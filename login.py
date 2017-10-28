from flask import current_app
from flask import render_template, request, redirect, url_for, make_response, Blueprint
from urllib.parse import urlparse, urljoin
from flask_login import LoginManager, login_required, login_user, logout_user, current_user
from database import db_session
from models import User
import bcrypt
from settings import PASSWORD_SALT_ROUNDS, PASSWORD_MIN_LENGTH
import re

"""
This page handles all login and user registration.
Using flask_login, this login is persistent using secure cookies.
"""

login_page = Blueprint('login_page', __name__, template_folder='templates')
login_manager = LoginManager()
login_manager.login_view = "login_page.login"


@login_page.before_app_first_request
def init():
    login_manager.init_app(current_app)


@login_manager.user_loader
def load_user(user_id):
    return db_session.query(User).filter(User.authtoken == user_id).first()


@login_page.route('/login', methods=['GET'])
def login():
    nexturl = request.args.get("next", None)
    return render_template('signin.html', password_min_length=PASSWORD_MIN_LENGTH,
                           next=url_for("index") if nexturl is None else nexturl, has_next=nexturl is not None)


@login_page.route('/register', methods=['GET'])
def register():
    nexturl = request.args.get("next", None)
    return render_template('signin.html', register=True, password_min_length=PASSWORD_MIN_LENGTH,
                           next=url_for("index") if nexturl is None else nexturl, has_next=nexturl is not None)


@login_page.route('/login', methods=['POST'])
def dologin():
    username = request.form['username']
    password = request.form['password']
    nexturl = request.form['next']

    current_app.logger.debug("Attempting login with username %s", username)
    user = db_session.query(User).filter(User.username_lower == username.lower()).first()
    if user is None:  # If the username is not found
        current_app.logger.debug("User %s does not exist.", username)
        # Doing this to prevent timing attacks or whatever.
        # Idk, I don't actually know anything about security, I've just heard of timing attacks before.
        bcrypt.hashpw(b"pw", bcrypt.gensalt(PASSWORD_SALT_ROUNDS))
        return render_template('signin.html', error_login=True, username=username,
                               password_min_length=PASSWORD_MIN_LENGTH, next=nexturl)
    elif bcrypt.checkpw(password.encode(), user.passwordhash):  # The password is correct
        current_app.logger.debug("Password is correct!")
        return processlogin(user, nexturl)
    else:  # Username exists, wrong password
        # TODO: Count password attempts
        current_app.logger.debug("Password was incorrect.")
        return render_template('signin.html', error_login=True, username=username,
                               password_min_length=PASSWORD_MIN_LENGTH, next=nexturl)


@login_page.route('/register', methods=['POST'])
def doregister():
    username = request.form['username']
    password = request.form['password']
    nexturl = request.form['next']

    error_username_invalid = len(username) > 100 or not re.match("^[a-zA-Z0-9_]+$", username)
    error_password_length = len(password) < PASSWORD_MIN_LENGTH or len(password) > 256

    current_app.logger.debug("Invalid username: %s, invalid password: %s",
                             error_username_invalid, error_password_length)

    if error_password_length or error_username_invalid:
        return render_template('signin.html', register=True, error_username_invalid=error_username_invalid,
                               error_password_length=error_password_length, username=username,
                               password_min_length=PASSWORD_MIN_LENGTH, next=nexturl)
    # This is to check if there's already a user with the given name
    existinguser = db_session.query(User).filter(User.username_lower == username.lower()).first()
    if existinguser is not None:  # This username is already taken
        current_app.logger.debug("Username is already taken")
        return render_template('signin.html', register=True, error_username_taken=True, username=username,
                               password_min_length=PASSWORD_MIN_LENGTH, next=nexturl)

    # By this point, we know that the user is good to register. So let's register!
    passwordhash = bcrypt.hashpw(password.encode(), bcrypt.gensalt(PASSWORD_SALT_ROUNDS))
    current_app.logger.debug("Password hash: %s", passwordhash)
    newuser = User(username, passwordhash)
    db_session.add(newuser)
    db_session.commit()
    return processlogin(newuser, nexturl)


def is_safe_url(target):
    """
    Returns True if this URL is safe to redirect to.
    Source: http://flask.pocoo.org/snippets/62/
    :param target: Target URL
    :return: True or False
    """
    ref_url = urlparse(request.host_url)
    test_url = urlparse(urljoin(request.host_url, target))
    return test_url.scheme in ('http', 'https') and ref_url.netloc == test_url.netloc


def processlogin(user, nexturl=None):
    login_user(user, remember=True)
    current_app.logger.debug("Successfully logged in user %s.", user.username)

    if nexturl is None or not is_safe_url(nexturl):
        nexturl = url_for("index")

    return redirect(nexturl)


@login_page.route('/profile', methods=['GET'])
@login_required
def profile():
    return render_template("profile.html", password_min_length=PASSWORD_MIN_LENGTH,
                           username=current_user.username, display_name=current_user.displayname,
                           change_display_name_url=url_for("login_page.changename"),
                           change_password_url=url_for("login_page.changepassword"))


@login_page.route('/changename', methods=['POST'])
@login_required
def changename():
    newname = request.form['newname']
    if len(newname) > 127:
        return make_response("Username should be less than 127 characters.", 400)
    current_user.displayname = newname
    db_session.add(current_user)
    db_session.commit()
    return make_response("Successfully changed display name to {}".format(newname), 200)


@login_page.route('/changepassword', methods=['POST'])
@login_required
def changepassword():
    oldpassword = request.form['oldpassword'].encode()
    newpassword = request.form['newpassword'].encode()

    if bcrypt.checkpw(oldpassword, current_user.passwordhash):
        newhash = bcrypt.hashpw(newpassword, bcrypt.gensalt(PASSWORD_SALT_ROUNDS))
        current_user.passwordhash = newhash
        current_user.regentoken()
        db_session.add(current_user)
        db_session.commit()
        return make_response("success", 200)
    else:
        return make_response("incorrect password", 401)


@login_page.route('/logout')
@login_required
def logout():
    username = current_user.username
    logout_user()
    current_app.logger.debug("Logged out user %s.", username)
    return redirect(url_for("index"))
