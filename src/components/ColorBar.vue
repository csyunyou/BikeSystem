<template>
	<div id='colorbar'></div>
</template>
<script type="text/javascript">
let d3 = require('d3');
let _ = require('underscore');
export  default{
	data(){
		return{
			svg:null,
			legend:null,
			margin :{top: 20, right: 20, bottom: 30, left: 40},
    		colors:['#000000','#4C4C4C','#999999','#FFFFFF','#800000','#804000','#808000','#408000' ,'#008000','#008040','#008080','#004080','#000080','#400080','#800080','#800040','#FF0000','#FF8000', '#FFFF00','#80FF00','#00FF00','#00FF80','#00FFFF','#0080FF','#0000FF','#8000FF','#FF00FF','#FF0080', '#FF6666','#FFCC66','#FFFF66','#CCFF66','#66FF66','#66FFCC','#66FFFF','#66CCFF','#6666FF','#CC66FF', '#FF66FF','#FF6FCF','#F46142','#F4C542','#D4F442','#42F4AA','#42F4E8','#4283F4','#CB42F4','#F442BC','#F44289','#F4425F']

		}
	},
	props:['map'],
	computed:{
		width:function(){
    		return 300 - this.margin.left - this.margin.right;
		},
		height:function(){
			return 500 - this.margin.top - this.margin.bottom;
		}
	},
	mounted(){
    let vm=this;
  	let svg = d3.select("#colorbar").append("svg")
    	.attr("width", this.width + this.margin.left + this.margin.right)
    	.attr("height", this.height + this.margin.top + this.margin.bottom)
    	.on('click',function(data,index){
    		vm.$store.dispatch('drawStations',index);
    	})
    	// .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    	//console.log(this.svg);
    	let legend = svg.selectAll(".legend")
      	.data(this.colors)
    	.enter().append("g")
      	.attr("class", "legend")
      	.attr("transform", function(d, i) {
      		let x,y;
      		if(i%2===0){
      			x=20,y=i/2*20;
      		}
      		else{
      			x=60,y=(i-1)/2*20;
      		}
      		return "translate("+x+","+y+")"; 
      	});
  		legend.append("rect")
      	.attr("x",0)
      	.attr("width", 18)
      	.attr("height", 18)
      	.style("fill", function(d,i){return vm.colors[i]}).on('click',function(data,index){
      		vm.$store.dispatch('filterStations',[index]);
      		d3.event.stopPropagation();
      	});

    legend.append("text")
        .attr("x", 0)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d,i) { return i; });
     /*Promise.all([
        $.ajax({
          url: 'http://localhost:3000/bikerecord/GetIndividualVolume',
          type: 'GET',
        }),
         $.ajax({
          url: 'http://localhost:3000/grouprecord/GetGroupVolume',
          type: 'GET',
        })
      ]).then(function(data){

 
      let oddStackDataSet=[{name:'Individual',data:[]},{name:'group',data:[]}],evenStackDataSet=[{name:'individual',data:[]},{name:'group',data:[]}];
      _.range(50).forEach(function(i){
        if(i%2===0){
          evenStackDataSet[0].data.push({cluster:i,volume:data[0].inflow[i].volume+data[0].outflow[i].volume});
          evenStackDataSet[1].data.push({cluster:i,volume:data[1].inflow[i].volume+data[1].outflow[i].volume});
        }
        else{
          oddStackDataSet[0].data.push({cluster:i,volume:data[0].inflow[i].volume+data[0].outflow[i].volume});
          oddStackDataSet[1].data.push({cluster:i,volume:data[1].inflow[i].volume+data[1].outflow[i].volume});
        }
      })
      let stack=d3.layout.stack().values(function(d){return d.data;})
                      .x(function(d){return d.cluster;})
                      .y(function(d){return d.volume});
      let evenStackData=stack(evenStackDataSet);
      let xScale=d3.scale.ordinal().domain(evenStackData[0].data.map(d=>d.cluster)).rangeBands([0,505],0.3);
      let maxVolume=d3.max(evenStackData[evenStackData.length-1].data,d=>d.y0+d.y);
      let yScale=d3.scale.linear().domain([0,maxVolume]).range([130,0]);
      let color=d3.scale.category10();
      let evenGroups=svg.selectAll('.evenStackBar').data(evenStackData).enter().append('g').attr('class','evenStackBar').style('fill',(d,i)=>color(i)).attr('transform','translate(180,0) rotate(90)');
      evenGroups.selectAll('rect').data(d=>d.data).enter().append('rect').attr('x',(d,i)=>i*20).attr('y',d=>yScale(d.y0+d.y))
                      .attr('width',18)
                      .attr('height',d=>130-yScale(d.y));
      let oddStackData=stack(oddStackDataSet);
      maxVolume=d3.max(oddStackData[oddStackData.length-1].data,d=>d.y0+d.y);
      yScale.domain([0,maxVolume]).range([130,0]);
      let oddGroups=svg.selectAll('.oddStackBar').data(oddStackData).enter().append('g').attr('class','oddStackBar').style('fill',(d,i)=>color(i)).attr('transform','translate(360,0) rotate(90)');
      oddGroups.selectAll('rect').data(d=>d.data).enter().append('rect').attr('x',(d,i)=>i*20).attr('y',d=>yScale(d.y0+d.y))
                      .attr('width',18)
                      .attr('height',d=>130-yScale(d.y));

    })*/
   
    
	}
}
</script>
<style type="text/css">
	
</style>