from . import db
from flask import Flask
from flaskext.sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

# information for these can be found here:
# http://packages.python.org/Flask-SQLAlchemy/models.html

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)
    pw_hash = db.Column(db.String(300))
    email = db.Column(db.String(120))
    tabs = db.relationship('Tab', backref=db.backref('user', lazy='joined'),
            lazy='dynamic')

    def __init__(self, username, email, password):
        self.username = username
        self.email = email
        self.set_password(password)

    def __repr__(self):
        return '<User %r (%r)>' % (self.username, self.email)

    def set_password(self, password):
        self.pw_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.pw_hash, password)

class Tab(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    url = db.Column(db.Text)

    def __init__(self, user_id, url):
        self.user_id = user_id
        self.url = url

    def __repr__(self):
        return '<Tab %r (%r)>' % (self.usrl, self.user.username)
