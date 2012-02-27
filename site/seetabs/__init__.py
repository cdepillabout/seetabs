from flask import Flask
from flaskext.sqlalchemy import SQLAlchemy
app = Flask(__name__)
db = SQLAlchemy(app)
from . import views, settings

def init_seetabs():
    app.config.from_object('seetabs.settings')
    db.init_app(app)

def run_seetabs(debug=None, host='localhost'):
    init_seetabs()

    if debug is not None:
        app.run(debug=debug, host=host)
    else:
        app.run(host=host)

def create_db():
    init_seetabs()
    db.create_all()

