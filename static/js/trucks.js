$(function(){
	// Food truck model
	var truck = Backbone.Model.extend({

	});

	var TruckList = Backbone.Collection.extend({
		model: truck,
		url: '/trucks',
		fetch : function() {
		    // store reference for this collection
		    var collection = this;
		    $.ajax({
		        type : 'GET',
		        url : this.url,
		        dataType : 'json',
		        success : function(data) {
		            //console.log(data);
		            // set collection data (assuming you have retrieved a json object)
		            collection.reset(data)
		            getPosition(data)
		        }
		    });
		}
	})

	var Trucks = new TruckList;

	var AppView = Backbone.View.extend({
		el: $("#list-area"),
		initialize: function(){
			//this.listenTo(Trucks, 'reset', this.addAll);
			//this.listenTo(Trucks, 'all', this.render);
			Trucks.fetch();
			//Trucks.on('reset', getPosition);
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

	function getPosition(data){
		if (navigator.geolocation){
    		navigator.geolocation.getCurrentPosition(function(position){initializeMap(position, data)});
    	}
	}

	var infowindow;

	function initializeMap(position, data){
		//var myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		var myLatlng = new google.maps.LatLng(37.748378, -122.416449);
	  	var mapOptions = {
	    	zoom: 20,
		    center: myLatlng,
		    mapTypeId: google.maps.MapTypeId.ROADMAP
	  	};
	  	var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	  	infowindow = new google.maps.InfoWindow({
	  		content: "hold"
	  	})

		iconFile = "http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png";

		var person = new google.maps.Marker({
			map: map,
			position: myLatlng
		});
		person.setIcon(iconFile);
		//console.log(data);
		results = data['results']
	  	results.forEach(function(truck){
	  		marker = new google.maps.Marker({
                map: map,
                optimized: false, 
                position: new google.maps.LatLng(truck['obj']['loc'][1],truck['obj']['loc'][0])
            });
            google.maps.event.addListener(marker, 'click', function(){
            	distance = truck['dis'];
            	if(distance < .1){
            		distance *= 5280;
            		distance = distance.toPrecision(3) +  " ft";
            	}else{
            		distance = distance.toPrecision(2) + " mi";
            	}
            	console.log(distance + " miles");
            	infowindow.setContent('<p>'+truck['obj']['applicant']+'</p><p>'+distance+'</p>')
            	infowindow.open(map, this);
            })
	  	});
	}
});