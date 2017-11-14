<template>
	<!-- <span>{{msg}}</span> -->
	<!-- <button @click='showStations'>show</button> -->
</template>
<script>
var L=require('leaflet');
var $=require('jquery');
export default{
	props:['map'],
	data(){
		return{
			stations:[]
		}
	},
	methods:{
		drawStation:function(){
			var vm=this

			this.stations.forEach(function(station){
				L.circle([station.latitude,station.longitude],{
					color: 'blue',
    				fillColor: '#f03',
				    fillOpacity: 0.5,
				    radius: 50}).addTo(vm.map);

			})
		}
	},
	created(){
		let vm=this
		$.ajax({
			url: 'http://localhost:3000/station/GetStations',
			type: 'GET',
		})
		.done(function(data) {
			vm.stations=data.stations
			vm.drawStation()
		});
	},
	mounted(){
		
	}
}
</script>
