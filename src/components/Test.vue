<template>
	<div id='test'>
		<!-- <station :map='map' :msg=msg ref='station'></station> -->
	</div>
</template>
<script type="text/javascript">
let d3 = require('d3');
let _ = require('underscore');
import {mapState} from 'vuex';
export  default{
	mounted(){
		/*let svg=d3.select('#test').append('svg').attr('width',300).attr('height',200);
		let lineGenerator = d3.line().curve(d3.curveCardinal);
		var points = [
			[0, 80],
			[100, 100]
		]
		var pathData = lineGenerator(points);
		let path=d3.selectAll('path')*/
		console.log('hey');
		let svg=d3.select('#test').append('svg').attr('width',300).attr('height',200)
		// let diagonal=d3.svg.diagonal();
		// let data=[[100,100],[300,200]];
		// let linePath=d3.svg.line().interpolate("cardinal");
		let dataset={source:{x:100,y:100},target:{x:300,y:200}},dataset2={source:{x:300,y:200},target:{x:100,y:100}};
		//svg.append("path").attr("d",linePath(data)).attr("fill","none").attr("stroke","black").attr("stroke-width",3);
		// svg.append("path").attr("d",diagonal(dataset2)).attr("fill","none").attr("stroke","black").attr("stroke-width",3);
		//svg.append("path").attr("d","M20,20L80,80").attr("fill","none").attr("stroke","black").attr("stroke-width",3);
		//svg.append("path").attr("d","M20 20 C90,40 130,40 180,20").attr("fill","none").attr("stroke","black").attr("stroke-width",3);
		// svg.append("path").attr("d","M20 20 c70,20 110,20 160,0").attr("fill","none").attr("stroke","black").attr("stroke-width",3);
		// svg.append("path").attr("d","M20 20 C90,0 130,0 180,20").attr("fill","none").attr("stroke","black").attr("stroke-width",3);
		// svg.append("path").attr("d","M70,100 a50,50 0 1,0 50,-50").attr("fill","none").attr("stroke","black").attr("stroke-width",3);
		// svg.append("path").attr("d","M70,100 a50,50 0 0,0 50,-50").attr("fill","none").attr("stroke","blue").attr("stroke-width",3);
		// svg.append("path").attr("d","M70,100 a50,50 0 0,1 50,-50").attr("fill","none").attr("stroke","red").attr("stroke-width",3);
		// svg.append("path").attr("d","M70,100 a50,50 0 1,1 50,-50").attr("fill","none").attr("stroke","green").attr("stroke-width",3);
		function tick(x1,y1,x2,y2) {
		        var dx = x1 -x2 ,
		            dy = y1 - y2,
		            dr = Math.sqrt(dx * dx + dy * dy);
		        return "M" + 
		            x1 + "," + 
		            y1 + "A" + 
		            dr + "," + dr + " 0 1,1 " + 
		            x2 + "," + 
		            y2;
		 }
		 // svg.append("svg:defs").selectAll("marker")
		 //    .data(["end"])      // Different link/path types can be defined here
		 //  .enter().append("svg:marker")    // This section adds in the arrows
		 //    .attr("id", String)
		 //    .attr("viewBox", "0 -5 10 10")
		 //    .attr("refX", 15)
		 //    .attr("refY", -1.5)
		 //    .attr("markerWidth", 6)
		 //    .attr("markerHeight", 6)
		 //    .attr("orient", "auto")
		 //  .append("svg:path")
		 //    .attr("d", "M0,-5L10,0L0,5");

		svg.append("path").attr("d",tick(70,100,120,50)).attr("fill","none").attr("stroke","green").attr("stroke-width",3).attr("marker-end", "url(#end)");;
		svg.append("path").attr("d",tick(120,50,70,100)).attr("fill","none").attr("stroke","yellow").attr("stroke-width",3).attr("marker-end", "url(#end)");;
		var data = d3.range(-1/4 * Math.PI, 1/4 * Math.PI, .01).map(function(t) {
  return [t, Math.cos(2 * t)];
});
		var r = d3.scaleLinear()
	    .domain([0, 1])
	    .range([0, 50]);
	    var line = d3.radialLine()
    .radius(function(d) { return r(d[1]); })
    .angle(function(d) { return d[0]});
    let path=d3.creator("path")
    // console.log(path())
    // let path=d3.select("#test123").append("path")
    // let path=d3.select("#test").append("path")
    // console.log(path,path2)
    // console.log(path())
    // console.log(d3.select("#test123").append(path))
    // let tmp=path.attr("transform","translate(150,100)")
    // .datum(data)
    // .attr("class", "line")
    // .attr("d", line);
    // console.log(tmp.attr("d"))

		
	}
}
</script>
<style>
	.line {
  fill: none;
  stroke: red;
  stroke-width: 1.5px;
}
</style>