from flask import Flask, render_template, request, send_from_directory
from flask_login import login_required, current_user
from database import db_session
from login import login_page
from gameplay import gameplay_blueprint
from settings import SECRET_KEY, DEBUG


app = Flask(__name__, static_folder='static', static_path='/static')
app.secret_key = SECRET_KEY
app.register_blueprint(login_page)
app.register_blueprint(gameplay_blueprint)


@app.route('/')
def index():
    return render_template("debug_template.html", message="This is the index page!")


@app.route('/debug')
@login_required
def debug():
    return render_template("debug_template.html",
                           message="Congratulations, {}! You made it!".format(current_user.username))


@app.after_request
def add_header(r):
    if DEBUG:
        r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        r.headers["Pragma"] = "no-cache"
        r.headers["Expires"] = "0"
    return r


@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()


# @app.route("/static/<file>")
# def static(file):
#     return send_from_directory('static', file)


if __name__ == '__main__':
    app.run(debug=DEBUG)
