from sqlalchemy import Column, Integer, String, LargeBinary, Table, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from flask_login import UserMixin
import datetime
import random
import string
from database import Base
from settings import PASSWORD_HASH_LENGTH, GAME_ID_LENGTH_BYTES, AUTH_TOKEN_LENGTH


association_table = Table('game_user_association', Base.metadata,
                          Column('userid', Integer, ForeignKey('users.userid')),
                          Column('gameid', LargeBinary(GAME_ID_LENGTH_BYTES), ForeignKey('games.gameid')),
                          Column('ordering', Integer, default=lambda: random.randint(1, 2000000000))
                          )


class User(Base, UserMixin):
    __tablename__ = 'users'
    userid = Column("userid", Integer, primary_key=True)
    displayname = Column("displayname", String, nullable=True)
    username = Column("username", String, nullable=False, unique=True)
    username_lower = Column('username_lower', String, nullable=False, unique=True)
    passwordhash = Column("passwordhash", LargeBinary(PASSWORD_HASH_LENGTH))
    games = relationship("Game", secondary=association_table, back_populates="players")
    authtoken = Column("authtoken", String, nullable=False, unique=True)

    def __init__(self, username, passwordhash, displayname=None):
        self.username = username
        self.username_lower = username.lower()
        self.passwordhash = passwordhash
        self.displayname = displayname
        self.authtoken = "".join(random.SystemRandom().choice(string.printable) for _ in range(AUTH_TOKEN_LENGTH))

    def __repr__(self):
        return "User(username={}, passwordhash={}, displayname={})".format(
            self.username, self.passwordhash, self.displayname
        )

    def get_id(self):
        return self.authtoken


class Game(Base):
    __tablename__ = 'games'
    gameid = Column('gameid', LargeBinary(GAME_ID_LENGTH_BYTES), primary_key=True)
    players = relationship("User", secondary=association_table, back_populates="games",
                           order_by=association_table.c.ordering)
    currentturn_id = Column("currentturn_id", Integer, ForeignKey("users.userid"))
    currentturn = relationship("User")
    timecreated = Column("timecreated", DateTime, default=datetime.datetime.now)

    def __init__(self, gameid):
        self.gameid = gameid

    def __repr__(self):
        return "Game(gameid={})".format(self.gameid)
