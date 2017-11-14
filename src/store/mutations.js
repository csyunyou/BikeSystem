'use strict';
let L=require('leaflet');
let inside=require('point-in-polygon');
let colors=['#000000','#4C4C4C','#999999','#FFFFFF','#800000','#804000','#808000','#408000' ,'#008000','#008040','#008080','#004080','#000080','#400080','#800080','#800040','#FF0000','#FF8000', '#FFFF00','#80FF00','#00FF00','#00FF80','#00FFFF','#0080FF','#0000FF','#8000FF','#FF00FF','#FF0080', '#FF6666','#FFCC66','#FFFF66','#CCFF66','#66FF66','#66FFCC','#66FFFF','#66CCFF','#6666FF','#CC66FF', '#FF66FF','#FF6FCF','#F46142','#F4C542','#D4F442','#42F4AA','#42F4E8','#4283F4','#CB42F4','#F442BC','#F44289','#F4425F'];
export default{
	GET_ALL_STATIONS:function(state,map){
		$.ajax({
			url: 'http://localhost:3000/station/GetStations',
			type: 'GET',
		})
		.done(function(data) {
			let featureGroup=[]
			data.stations.forEach(function(station){
				featureGroup.push(L.circle([station.latitude,station.longitude],{
						opacity: 0.0,
	    				fillColor: colors[station.cluster],
					    fillOpacity: 1.0,
					    radius: 100,
					    cluster:station.cluster,
						name:station.name,
						id:station.id
				}))
			});
			// state.stationGroup=L.featureGroup(featureGroup)
			// console.log(state.stationGroup.getLayers())
			// layerControl.addOverlay(state.stationGroup,'stationGroup');
			return 

		});
	},
	GET_SELECTED_STATIONS:function(state,polygon){
		let cnt=0;
		state.stations.forEach(function(station){
			if(inside([station.circle.getLatLng().lat,station.circle.getLatLng().lng],polygon)){
				cnt+=1;
				console.log(station.circle.getLatLng().lat+","+station.circle.getLatLng().lng+","+station.cluster+","+station.id);
				station.circle.setStyle({fillColor:'red',color:'red'});
				station.circle.redraw();
			}
		});
		console.log('cnt='+cnt);
	},
	FILTER_STATIONS:function(state,clusters){
		console.log(clusters);
		state.stationGroup.eachLayer(function(layer){
			let exists=clusters.some(c=>c===layer.options.cluster)
			if(!exists){
				layer.setStyle({fillOpacity:0.0});
			}
			// console.log(layer);
		})
		// state.stations.forEach(function(station){
		// 	if(station.cluster!==cluster)
		// 		station.circle.setStyle({fillOpacity:0.0});
		// 	else
		// 		station.circle.setStyle({fillOpacity:1.0});
		// 	station.circle.redraw();
		// });
	},
	DRAW_STATIONS:function(state){
		state.stationGroup.eachLayer(function(layer){
			layer.setStyle({
				fillOpacity: 1.0
			});
		});
	},
	GET_CENTROIDS:function(state,map){
		$.ajax({
			url: 'http://localhost:3000/centroid/GetCentroids',
			type: 'GET',
		})
		.done(function(data) {
			data.centroids.forEach(function(centroid,i){
				state.centroids.push({
					circle:L.circle([centroid.latitude,centroid.longitude],{
						opacity: 0.0,
	    				fillColor: colors[i],
					    fillOpacity: 0.5,
					    radius: 200}).addTo(map),
					cluster:i
				});
			});
		});
	},
	CHANGE_SELECTED_CENTROID:function(state,{centroid}){
		state.selectedCentroid=centroid
	},
	CHANGE_MAP_HIGHLIGHTED:function(state,{cluster}){
		state.mapHighlight=cluster
	},
	CHANGE_SELECTED_DATE:function(state,{date}){
		state.selectedDate=date
	},
	CHANGE_SELECTED_PAIR:function(state,{pair}){
		state.selectedPair=pair
	},
	CHANGE_SELECTED_DATETIME_MODE:function(state,{mode,startHour,endHour}){
		console.log(mode,startHour,endHour)
	}
};
