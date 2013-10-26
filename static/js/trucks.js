$(function() {
	"use strict";
	var curPos;

	// Food Truck Model //
	var truck = Backbone.Model.extend({
		initialize: function() {}
	});

	// Food Truck View //
	var TruckView = Backbone.View.extend({
		tagName: "li",
		template: _.template($("#truck-template").html()),
		events: {
			"click .view": "center"
		},
		render: function() {
			var distance = this.model.dis;
			if (distance < 0.1) {
				distance *= 5280;
				distance = distance.toPrecision(3) + " ft";
			} else {
				distance = distance.toPrecision(2) + " mi";
			}
			this.model.dis = distance;
			$(this.el).html(this.template(this.model));
			return this;
		},
		center: function() {
			$("#trucks").removeClass("show");
			var destination = new google.maps.LatLng(this.model.obj.loc[1], this.model.obj.loc[0]);
			calcRoute(destination);
		},
		clear: function() {
			this.model.destroy();
		}
	});

	// Food Truck Collection //
	var TruckList = Backbone.Collection.extend({
		model: truck,
		url: "/trucks"
	});

	var Trucks = new TruckList();

	// App View //
	var AppView = Backbone.View.extend({
		el: $("#list-area"),
		initialize: function() {
			Trucks.on("reset", this.addAll);
			getPosition();
		},
		log: function() {
			initializeMap();
		},
		render: function() {

		},
		addAll: function(data) {
			var results = jQuery.parseJSON(JSON.stringify(data))[0].results;
			results.forEach(function(truck) {
				var view = new TruckView({
					model: truck
				});
				$("#truck-list").append(view.render().el);
				var marker = new google.maps.Marker({
					map: map,
					optimized: false,
					animation: google.maps.Animation.DROP,
					position: new google.maps.LatLng(truck.obj.loc[1], truck.obj.loc[0])
				});
				markers.push(marker);
				google.maps.event.addListener(marker, "mouseover", function() {
					var distance = truck.dis;
					infowindow.setContent("<p>" + truck.obj.applicant + "</p><p>" + distance + "</p>" +
						"<p class='items'>" + truck.obj.fooditems + "</p>");
					infowindow.open(map, this);
				});
				google.maps.event.addListener(marker, "mouseout", function() {
					infowindow.close();
				});
				google.maps.event.addListener(marker, "click", function() {
					calcRoute(new google.maps.LatLng(truck.obj.loc[1], truck.obj.loc[0]));
				});
			});
		}
	});

	var App = new AppView();

	// Get User's Current Location //

	function getPosition() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				initializeMap(position);
				Trucks.fetch({
					url: "/trucks/" + position.coords.latitude + "/" + position.coords.longitude
				});
			});
		}
	}

	var infowindow;
	var iconFile;
	var map;
	var markers = [];
	var person;

	var directionsDisplay;
	var directionsService = new google.maps.DirectionsService();

	function initializeMap(position) {
		var myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		directionsDisplay = new google.maps.DirectionsRenderer();
		curPos = myLatlng;
		var mapOptions = {
			zoom: 17,
			center: myLatlng,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			noClear: true
		};
		map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
		directionsDisplay.setMap(map);

		var geocoder = new google.maps.Geocoder();

		infowindow = new google.maps.InfoWindow({
			content: "hold"
		});

		iconFile = "http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png";

		person = new google.maps.Marker({
			map: map,
			position: myLatlng,
			optimized: false
		});
		person.setIcon(iconFile);
	}

	// Calculate Walking Directions //

	function calcRoute(destination) {
		var request = {
			origin: curPos,
			destination: destination,
			// Note that Javascript allows us to access the constant
			// using square brackets and a string value as its
			// "property."
			travelMode: google.maps.TravelMode.WALKING
		};
		directionsService.route(request, function(response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				directionsDisplay.setDirections(response);
			}
		});
	}

	function removeMarkers() {
		$("#truck-list").empty();
		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
		}
	}
	var geocoder = new google.maps.Geocoder();
	var autocomplete = new google.maps.places.Autocomplete($("#map-search")[0], {});
	google.maps.event.addListener(autocomplete, "place_changed", function() {
		var place = autocomplete.getPlace();
		var lat = place.geometry.location.lb;
		var lng = place.geometry.location.mb;
		removeMarkers();
		var latlng = new google.maps.LatLng(lat, lng);
		var marker = new google.maps.Marker({
			map: map,
			optimized: false,
			position: latlng
		});
		marker.setIcon(iconFile);
		markers.push(marker);
		Trucks.fetch({
			url: "/trucks/" + lat + "/" + lng
		});
		person.setPosition(latlng);
		map.setCenter(latlng);
		curPos = latlng;
	});

	$("#more").click(function() {
		$("#trucks").toggleClass("show");
	});

	$("#filter").keypress(function(e) {
		if (e.which == 13) {
			if ($(this).val() != "") {
				removeMarkers();
				Trucks.fetch({
					url: "/trucks/" + curPos.lb + "/" + curPos.mb + "/" + $(this).val()
				});
			} else {
				removeMarkers();
				Trucks.fetch({
					url: "/trucks/" + curPos.lb + "/" + curPos.mb
				});
			}
		}
	});
});