from flask import Flask, render_template, request
from flask_login import login_required, current_user
from database import db_session
from login import login_page
from settings import SECRET_KEY


app = Flask(__name__)
app.secret_key = SECRET_KEY
app.register_blueprint(login_page)


@app.route('/')
def hello_world():
    return 'Hello World!'


@app.route('/debug')
@login_required
def debug():
    return render_template("debug_template.html",
                           message="Congratulations, {}! You made it!".format(current_user.username))


@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()


if __name__ == '__main__':
    app.run(debug=True)
