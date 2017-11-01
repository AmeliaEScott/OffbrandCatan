from flask import current_app
from flask import render_template, request, redirect, url_for, make_response, send_from_directory, Blueprint
from flask_login import LoginManager, login_required, login_user, logout_user, confirm_login, current_user
from database import db_session
from models import User, Game
from settings import DEBUG, VERSION

gameplay_blueprint = Blueprint('gameplay', __name__, template_folder='templates')


@gameplay_blueprint.route("/game/<game_id>", methods=['GET'])
def load_game(game_id):
    response = make_response(render_template("game.html", game_id=game_id, version=VERSION))
    return response
