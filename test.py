import argparse
import urllib, json
import os

from flask import Flask, g, jsonify, render_template, request, abort
from pymongo import MongoClient
from bson.json_util import dumps

client = MongoClient('mongodb://awishn02:Reds0x9!@ds047478.mongolab.com:47478/heroku_app18310921')
#client = MongoClient();
app = Flask(__name__)

@app.route('/')
def index():
	return render_template('index.html')

@app.route("/trucks", methods=['GET'])
def all_trucks():
	return dumps(client.uberdb.food_trucks.find())

def dbSetup():
	db = client.heroku_app18310921
	#db = uberdb.food_trucks
	food_trucks = db.food_trucks
	jsonurl = urllib.urlopen("https://data.sfgov.org/Permitting/Mobile-Food-Facility-Permit/rqzj-sfat.json")
	trucks = json.loads(jsonurl.read())
	food_trucks.insert(trucks)


if __name__ == '__main__':
	parser = argparse.ArgumentParser(description='Running uber backend')
	parser.add_argument('--setup', dest='run_setup', action='store_true')

	args = parser.parse_args()
	if args.run_setup:
		dbSetup()
	else:
		app.run(debug=True)