from sqlalchemy import Column, Integer, String, LargeBinary, Table, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy import types
from flask_login import UserMixin
import datetime
import random
import string
import json
from gametypes import GameBoard
from database import Base
from settings import PASSWORD_HASH_LENGTH, GAME_ID_LENGTH_BYTES, AUTH_TOKEN_LENGTH


# TODO: Change this association table to a "player" class which contains resources and whatnot


class User(Base, UserMixin):
    __tablename__ = 'users'
    userid = Column("userid", Integer, primary_key=True)
    displayname = Column("displayname", String, nullable=True)
    username = Column("username", String, nullable=False, unique=True)
    username_lower = Column('username_lower', String, nullable=False, unique=True)
    passwordhash = Column("passwordhash", LargeBinary(PASSWORD_HASH_LENGTH))
    players = relationship('Player', back_populates='user')
    authtoken = Column("authtoken", String, nullable=False, unique=True)

    def __init__(self, username, passwordhash, displayname=None):
        self.username = username
        self.username_lower = username.lower()
        self.passwordhash = passwordhash
        self.displayname = displayname
        self.regentoken()

    def regentoken(self):
        self.authtoken = "".join(random.SystemRandom().choice(string.printable) for _ in range(AUTH_TOKEN_LENGTH))

    def __repr__(self):
        return "User(username={}, passwordhash={}, displayname={})".format(
            self.username, self.passwordhash, self.displayname
        )

    def get_id(self):
        return self.authtoken


class GameBoardType(types.TypeDecorator):

    impl = types.String

    def process_bind_param(self, value, dialect):
        return json.dumps(value.asdict())

    def process_result_value(self, value, dialect):
        return GameBoard(json.loads(value))


class Game(Base):
    __tablename__ = 'games'
    gameid = Column('gameid', LargeBinary(GAME_ID_LENGTH_BYTES), primary_key=True)
    players = relationship("Player", back_populates="game", order_by="Player.order")
    # Stored the index in the 'players' list of the current turn
    currentturn = Column("currentturn", Integer)
    timecreated = Column("timecreated", DateTime, default=datetime.datetime.now)

    gameboard = Column('gameboard', GameBoardType, nullable=False)

    def __init__(self, gameid):
        self.gameid = gameid
        self.gameboard = GameBoard()

    def __repr__(self):
        return "Game(gameid={})".format(self.gameid)


class Player(Base):
    __tablename__ = 'players'
    playerid = Column('playerid', Integer, primary_key=True)
    gameid = Column('gameid', LargeBinary(GAME_ID_LENGTH_BYTES), ForeignKey('games.gameid'))
    game = relationship("Game", back_populates="players")
    userid = Column('userid', Integer, ForeignKey('users.userid'))
    user = relationship("User", back_populates="players")
    order = Column('order', Integer, unique=True, nullable=False)

    def __init__(self, user, game):
        self.order = random.randint(0, 2000000000)
        self.user = user
        self.game = game

    def __repr__(self):
        return "Game id: {}, Player id: {}, User id: {}, Order: {}".format(self.gameid, self.playerid,
                                                                           self.userid, self.order)

