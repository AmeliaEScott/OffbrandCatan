from flask import current_app
from flask import render_template, request, Blueprint
import flask_login
from database import db_session
from models import User
import bcrypt
from settings import PASSWORD_SALT_ROUNDS, PASSWORD_MIN_LENGTH
import re

"""
This page handles all login and user registration.
Using flask_login, this login is persistent using secure cookies.
"""

# TODO: Logout
# TODO: Redirect to login on unauthorized access
# TODO: After login (or register), redirect to where the user was trying to go before logging in
# TODO: Account settings page:
#   TODO: Change password
#   TODO: Set/change Display name

login_page = Blueprint('login_page', __name__, template_folder='templates')
login_manager = flask_login.LoginManager()


@login_page.before_app_first_request
def init():
    login_manager.init_app(current_app)


@login_manager.user_loader
def load_user(user_id):
    return db_session.query(User).filter(User.authtoken == user_id).first()


@login_page.route('/login', methods=['GET'])
def login():
    return render_template('signin.html')


@login_page.route('/register', methods=['GET'])
def register():
    return render_template('signin.html', register=True)


@login_page.route('/register', methods=['POST'])
@login_page.route('/login', methods=['POST'])
def dologin():
    username = request.form['username']
    password = request.form['password']
    login = 'login' in request.form
    register = 'register' in request.form
    if login:
        current_app.logger.debug("Attempting login with username %s", username)
        user = db_session.query(User).filter(User.username == username).first()
        if user is None:  # If the username is not found
            current_app.logger.debug("User %s does not exist.", username)
            # Doing this to prevent timing attacks or whatever.
            # Idk, I don't actually know anything about security, I've just heard of timing attacks before.
            bcrypt.hashpw(b"pw", bcrypt.gensalt(PASSWORD_SALT_ROUNDS))
            return render_template('signin.html', error_login=True, username=username)
        elif bcrypt.checkpw(password.encode(), user.passwordhash):  # The password is correct
            current_app.logger.debug("Password is correct!")
            return processlogin(user)
        else:  # Username exists, wrong password
            # TODO: Count password attempts
            current_app.logger.debug("Password was incorrect.")
            return render_template('signin.html', error_login=True, username=username)
    elif register:
        error_username_invalid = len(username) > 100 or not re.match("^[a-zA-Z0-9_]+$", username)
        error_password_length = len(password) < PASSWORD_MIN_LENGTH or len(password) > 256

        current_app.logger.debug("Invalid username: %s, invalid password: %s",
                                 error_username_invalid, error_password_length)

        if error_password_length or error_username_invalid:
            return render_template('signin.html', register=True, error_username_invalid=error_username_invalid,
                                   error_password_length=error_password_length, username=username,
                                   password_min_length=PASSWORD_MIN_LENGTH)
        existinguser = db_session.query(User).filter(User.username == username).first()
        if existinguser is not None:  # This username is already taken
            current_app.logger.debug("Username is already taken")
            return render_template('signin.html', register=True, error_username_taken=True, username=username,
                                   password_min_length=PASSWORD_MIN_LENGTH)

        passwordhash = bcrypt.hashpw(password.encode(), bcrypt.gensalt(PASSWORD_SALT_ROUNDS))
        current_app.logger.debug("Password hash: %s", passwordhash)
        newuser = User(username, passwordhash)
        db_session.add(newuser)
        db_session.commit()
        return processlogin(newuser)


def processlogin(user):
    # TODO: Change this function to redirect to wherever the user was trying to log in.
    flask_login.login_user(user, remember=True)
    current_app.logger.debug("Successfully logged in user %s.", user.username)
    return render_template("debug_template.html", message="User {} is logged in.".format(user.username))
