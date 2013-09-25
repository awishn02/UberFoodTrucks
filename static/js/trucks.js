$(function(){
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
		initialize: function(){
			//this.listenTo(Trucks, 'reset', this.addAll);
			//this.listenTo(Trucks, 'all', this.render);
			Trucks.fetch();
			Trucks.on('reset', getPosition);
		},
		log: function(){
			initializeMap;
		},
		render: function(){

		},
		addOne: function(todo){
			this.$("#list").append(todo['address']);
		},
		addAll: function() {
			Trucks.each(this.addOne);
		}
	});

	var App = new AppView;

	function getPosition(){
		if (navigator.geolocation){
    		navigator.geolocation.getCurrentPosition(initializeMap);
    	}
	}

	function initializeMap(position){
		//var myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		var myLatlng = new google.maps.LatLng(Trucks.at(0).get('latitude'), Trucks.at(0).get('longitude'));
	  	var mapOptions = {
	    	zoom: 20,
		    center: myLatlng,
		    mapTypeId: google.maps.MapTypeId.ROADMAP
	  	};
	  	var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	  	Trucks.forEach(function(truck){
	  		marker = new google.maps.Marker({
                map: map,
                optimized: false, 
                position: new google.maps.LatLng(truck.get('latitude'),truck.get('longitude'))
            });
            console.log(truck.get('latitude')+", " +truck.get('longitude'))
	  	});
	}
});