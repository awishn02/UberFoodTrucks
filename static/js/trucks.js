$(function() {
	// Food truck model
	var truck = Backbone.Model.extend({

	});

	var TruckList = Backbone.Collection.extend({
		model: truck,
		url: '/trucks'
	})

	var Trucks = new TruckList;

	var AppView = Backbone.View.extend({
		el: $("#list-area"),
		initialize: function() {
			Trucks.on('reset', placeMarkers);
			getPosition();
		},
		log: function() {
			initializeMap;
		},
		render: function() {

		},
		addOne: function(todo) {
			this.$("#list").append(todo['address']);
		},
		addAll: function() {
			Trucks.each(this.addOne);
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

	function initializeMap(position) {
		var myLatlng = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
		var mapOptions = {
			zoom: 16,
			center: myLatlng,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			noClear: true
		};
		map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

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

	function placeMarkers(data){
		results = jQuery.parseJSON(JSON.stringify(data))[0]['results']
		results.forEach(function(truck) {
			var marker = new google.maps.Marker({
				map: map,
				optimized: false,
    			animation: google.maps.Animation.DROP,
				position: new google.maps.LatLng(truck['obj']['loc'][1], truck['obj']['loc'][0])
			});
			markers.push(marker);
			google.maps.event.addListener(marker, 'click', function() {
				distance = truck['dis'];
				if (distance < .1) {
					distance *= 5280;
					distance = distance.toPrecision(3) + " ft";
				} else {
					distance = distance.toPrecision(2) + " mi";
				}
				console.log(distance + " miles");
				infowindow.setContent('<p>' + truck['obj']['applicant'] + '</p><p>' + distance + '</p>' +
									  '<p class="items">' + truck['obj']['fooditems'] + '</p>')
				infowindow.open(map, this);
			})
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
        lat = place['geometry']['location']['nb'];
        lng = place['geometry']['location']['ob'];
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
    });

    $("#morebtn").click(function(){
    	$("#map-filter").slideToggle();
    })
});