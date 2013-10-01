$(function() {
	// Food truck model
	var curPos;
	var truck = Backbone.Model.extend({
		initialize: function(){
		}
	});

	var TruckView = Backbone.View.extend({
		tagName: "li",
    	template: _.template($('#truck-template').html()),
    	events: {
    		"click .view" : "center"
    	},
	    render: function() {
	    	distance = this.model['dis'];
			if (distance < .1) {
				distance *= 5280;
				distance = distance.toPrecision(3) + " ft";
			} else {
				distance = distance.toPrecision(2) + " mi";
			}
			this.model['dis'] = distance;
	      	$(this.el).html(this.template(this.model));
	      	return this;
	    },
	    center: function(){
	    	$("#trucks").removeClass('show');	
	    	destination = new google.maps.LatLng(this.model['obj']['loc'][1], this.model['obj']['loc'][0])
	    	map.panTo(destination)
	    	calcRoute(destination)
	    },
	    clear: function(){
	    	this.model.destroy()
	    }
	});

	var TruckList = Backbone.Collection.extend({
		model: truck,
		url: '/trucks'
	})

	var Trucks = new TruckList;

	var AppView = Backbone.View.extend({
		el: $("#list-area"),
		initialize: function() {
      		Trucks.on('reset', this.addAll);
			getPosition();
		},
		log: function() {
			initializeMap;
		},
		render: function() {

		},
		addAll: function(data) {	
			results = jQuery.parseJSON(JSON.stringify(data))[0]['results']
			results.forEach(function(truck){
				var view = new TruckView({model: truck});
    	  		this.$("#truck-list").append(view.render().el);
				var marker = new google.maps.Marker({
					map: map,
					optimized: false,
	    			animation: google.maps.Animation.DROP,
					position: new google.maps.LatLng(truck['obj']['loc'][1], truck['obj']['loc'][0])
				});
				markers.push(marker);
				google.maps.event.addListener(marker, 'click', function() {
					var distance = truck['dis'];
					infowindow.setContent('<p>' + truck['obj']['applicant'] + '</p><p>' + distance + '</p>' +
										  '<p class="items">' + truck['obj']['fooditems'] + '</p>')
					infowindow.open(map, this);
				})
			});
		}
	});

	var App = new AppView;

	function getPosition() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				initializeMap(position)
				Trucks.fetch({url:'/trucks/'+position.coords.latitude+"/"+position.coords.longitude})
			});
		}
	}

	var infowindow;
	var map;
	var markers = [];
	var latitude;
	var longitude;

	var directionsDisplay;
	var directionsService = new google.maps.DirectionsService();

	function initializeMap(position) {
		var myLatlng = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
  		directionsDisplay = new google.maps.DirectionsRenderer();
		curPos = myLatlng;
		var mapOptions = {
			zoom: 17,
			center: myLatlng,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			noClear: true
		};
		map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  		directionsDisplay.setMap(map);

		var geocoder = new google.maps.Geocoder();

		infowindow = new google.maps.InfoWindow({
			content: "hold"
		})

		iconFile = "http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png";

		var person = new google.maps.Marker({
			map: map,
			position: myLatlng,
			optimized: false
		}); 
		markers.push(person);
		person.setIcon(iconFile);
	}

	function calcRoute(destination) {
	  var request = {
	      origin: curPos,
	      destination: destination,
	      // Note that Javascript allows us to access the constant
	      // using square brackets and a string value as its
	      // "property."
	      travelMode: google.maps.TravelMode["WALKING"]
	  };
	  directionsService.route(request, function(response, status) {
	    if (status == google.maps.DirectionsStatus.OK) {
	      directionsDisplay.setDirections(response);
	    }
	  });
	}
	function removeMarkers(){
		for(var i = 0; i < markers.length; i++){
			markers[i].setMap(null);
		}
	}
	var geocoder = new google.maps.Geocoder();
	var autocomplete = new google.maps.places.Autocomplete($("#map-search")[0], {});
	google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var place = autocomplete.getPlace();
        lat = place['geometry']['location']['lb'];
        lng = place['geometry']['location']['mb'];
        removeMarkers();
		var latlng = new google.maps.LatLng(lat, lng);
		var marker = new google.maps.Marker({
			map: map,
			optimized: false,
			position: latlng
		});
		marker.setIcon(iconFile);
		markers.push(marker);
		Trucks.fetch({url:"/trucks/"+lat+"/"+lng})
        map.setCenter(latlng);
        curPos = latlng;
    });

    $("#more").click(function(){
    	$("#trucks").toggleClass('show');
    })
});