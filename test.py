import argparse
import urllib, json
import os

from flask import Flask, g, jsonify, render_template, request, abort
from pymongo import MongoClient, Connection, GEO2D
from bson.json_util import dumps

client = MongoClient('mongodb://awishn02:Reds0x9!@ds047478.mongolab.com:47478/heroku_app18310921')
#client = MongoClient();
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
	#return dumps(food_trucks.find({"location":{"$near":[37.77493,-122.419416]}})[0:10])
	return dumps(db.food_trucks.find({"loc":{"$near":[-122.419416,37.77493]}})[0:15])

def dbSetup():
	#db = client.heroku_app18310921
	#db = uberdb.food_trucks
	#food_trucks = db.food_trucks
	jsonurl = urllib.urlopen("https://data.sfgov.org/Permitting/Mobile-Food-Facility-Permit/rqzj-sfat.json")
	trucks = json.loads(jsonurl.read())
	db.food_trucks.create_index([("loc", GEO2D)])
	#db.food_trucks.insert({"loc": [2, 5]})
	#db.food_trucks.insert({"loc": [30, 5]})
	#db.food_trucks.insert({"loc": [1, 2]})
	#for doc in db.food_truck.find({"loc": {"$near": [3, 6]}}).limit(3):
	#	repr(doc)
	#food_trucks.insert(trucks)
	for truck in trucks:
		if truck.has_key('location'):
			truck['loc'] = [float(truck['location']['longitude']), float(truck['location']['latitude'])]
			#truck['type'] = 'Point'
			#truck['coordinates'] = [float(truck['location']['longitude']), float(truck['location']['latitude'])]
			food_trucks.insert(truck)


if __name__ == '__main__':
	parser = argparse.ArgumentParser(description='Running uber backend')
	parser.add_argument('--setup', dest='run_setup', action='store_true')

	args = parser.parse_args()
	if args.run_setup:
		dbSetup()
	else:
		app.run(debug=True)
