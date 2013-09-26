import argparse
import urllib, json
import os

from flask import Flask, g, jsonify, render_template, request, abort
from pymongo import MongoClient, Connection, GEO2D
from bson.json_util import dumps
from bson.son import SON

client = MongoClient('mongodb://awishn02:Reds0x9!@ds047478.mongolab.com:47478/heroku_app18310921')
#lient = MongoClient();
app = Flask(__name__)

db = client.heroku_app18310921
#db = client.uberdb
#db = Connection().uberdb
food_trucks = db.food_trucks

@app.route('/')
def index():
	return render_template('index.html')

@app.route("/trucks", methods=['GET'])
def all_trucks():
	distance = 3959/180
	app.logger.debug('Getting all trucks')
	return dumps(db.command(SON([('geoNear', 'food_trucks'), ('near', [-122.416449,37.748378]), ('limit', 20), ('distanceMultiplier', distance)])))

@app.route("/trucks/<string:lat>/<string:lng>", methods=['GET'])
def get_trucks(lat, lng):
	distance = 3959/180
	app.logger.debug('Getting trucks')
	return dumps(db.command(SON([('geoNear', 'food_trucks'), ('near', [float(lng),float(lat)]), ('limit', 20), ('distanceMultiplier', distance)])))

def dbSetup():
	jsonurl = urllib.urlopen("https://data.sfgov.org/Permitting/Mobile-Food-Facility-Permit/rqzj-sfat.json")
	trucks = json.loads(jsonurl.read())
	db.food_trucks.create_index([("loc", GEO2D)])
	for truck in trucks:
		if truck.has_key('location'):
			truck['loc'] = [float(truck['location']['longitude']), float(truck['location']['latitude'])]
			food_trucks.insert(truck)


if __name__ == '__main__':
	parser = argparse.ArgumentParser(description='Running uber backend')
	parser.add_argument('--setup', dest='run_setup', action='store_true')

	args = parser.parse_args()
	if args.run_setup:
		dbSetup()
	else:
		app.run(debug=True)
