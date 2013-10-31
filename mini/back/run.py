#!/usr/bin/env python

from flask import Flask
from flask import request, Blueprint
from flask.ext.pymongo import PyMongo
from mdb import mongo_dbs, minicd_inner, minicd_dbname
from bml import bml_take, bml_save

app = Flask(__name__)

app.config['MONGO_MINICD_DBNAME'] = minicd_dbname
mongo_dbs[minicd_inner] = PyMongo(app, config_prefix='MONGO_MINICD')

app.register_blueprint(bml_take)
app.register_blueprint(bml_save)


@app.errorhandler(404)
def page_not_found(error):
    print(request.url)
    print('\n')
    print(request.get_data())
    print('\n')

    return 'page not found', 404

if __name__ == '__main__':
    app.run(host='localhost', port=12345, debug=True)

