from sqlalchemy import Column, Integer, String, LargeBinary, Table, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from settings import PASSWORD_HASH_LENGTH, GAME_ID_LENGTH_BYTES


association_table = Table('game_user_association', Base.metadata,
                          Column('userid', Integer, ForeignKey('users.userid')),
                          Column('gameid', LargeBinary(GAME_ID_LENGTH_BYTES), ForeignKey('games.gameid'))
                          )


class User(Base):
    __tablename__ = 'users'
    userid = Column("userid", Integer, primary_key=True)
    displayname = Column("displayname", String, nullable=True)
    email = Column("email", String, nullable=False, unique=True)
    passwordhash = Column("passwordhash", LargeBinary(PASSWORD_HASH_LENGTH))
    games = relationship("Game", secondary=association_table, back_populates="players")

    def __init__(self, email, passwordhash, displayname=None):
        self.email = email
        self.passwordhash = passwordhash
        self.displayname = displayname


class Game(Base):
    __tablename__ = 'games'
    gameid = Column('gameid', LargeBinary(GAME_ID_LENGTH_BYTES), primary_key=True)
    players = relationship("User", secondary=association_table, back_populates="games")
    currentturn = relationship("User")

    def __init__(self, gameid):
        self.gameid = gameid
