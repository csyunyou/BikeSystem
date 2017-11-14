<template>
	<div id='scatterplot' :style="{width:`${width}px`,height:`${height}px`}"></div>
</template>
<script type="text/javascript">
let d3 = require('d3');
export default{
	data(){
		return{
			data:null,
			width:470,
			height:390,
			yLabel:"自流量",
			xLabel:"总流量",
			radius:4,
			margin:{top: 40, right: 30, bottom: 20, left: 40}
		}
	},
	computed:{
		colors(){
			return this.$store.state.centroidColor
		},
		xAxisWidth(){
			return this.width-this.margin.left-this.margin.right
		},
		yAxisHeight(){
			return this.height-this.margin.top-this.margin.bottom
		},
		xScale(){
			return d3.scaleLinear().range([0,this.xAxisWidth])
		},
		yScale(){
			return d3.scaleLinear().range([this.yAxisHeight,0])
		}
	},
	methods:{
		draw(){
			console.log('draw ScatterPlot')
			let vm=this
			var svg = d3.select("#scatterplot").append("svg")
			    .attr("width", this.width )
			    .attr("height", this.height)
			  	.append("g")
			    .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

			this.xScale.domain(d3.extent(vm.data, function(d) { return d.totalFlow; }));
  			this.yScale.domain(d3.extent(vm.data, function(d) { return d.selfFlow; }));

  			svg.append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + this.yAxisHeight + ")")
		      .call(d3.axisBottom(this.xScale).tickFormat(d3.format(".2s")))
		      .append("text")
		      .attr("class", "label")
		      .attr("x", this.xAxisWidth)
		      .attr("y", -6)
		      .style("text-anchor", "end")
		      .text(this.xLabel)
		      .attr("fill", "#000")


		    svg.append("g")
		      .attr("class", "y axis")
		      .call(d3.axisLeft(this.yScale).tickFormat(d3.format(".2s")))
		      .append("text")
		      .attr("class", "label")
		      .attr("transform", "rotate(-90)")
		      .attr("y", 6)
		      .attr("dy", ".71em")
		      .style("text-anchor", "end")
		      .text(this.yLabel)
		      .attr("fill", "#000")

		    svg.selectAll(".dot")
		      .data(vm.data)
		      .enter().append("circle")
		      .attr("class", "dot")
		      .attr("r", this.radius)
		      .attr("cx", function(d) { return vm.xScale(d.totalFlow); })
		      .attr("cy", function(d) { return vm.yScale(d.selfFlow); })
		      .attr("fill",d=>vm.colors[d.cluster])
		      .on("mouseover",d=>vm.$store.commit('CHANGE_MAP_HIGHLIGHTED',{cluster:d.cluster}))
		      .on("mouseout",d=>vm.$store.commit('CHANGE_MAP_HIGHLIGHTED',{cluster:-1}))
		},
		//to be modified
		scatterPlotDataAdapter:function(dataSet){
			 // console.log(dataSet[0].outFlowVolume.length,dataSet[0].inFlowVolume.length,dataSet[1].length)
			d3.range(0,50).forEach(function(cluster){
				if(dataSet[0].inFlowVolume.find(d=>d.cluster===cluster)===undefined)
					dataSet[0].inFlowVolume.push({
						cluster,
						num:0
					})
				if(dataSet[0].outFlowVolume.find(d=>d.cluster===cluster)===undefined)
					dataSet[0].outFlowVolume.push({
						cluster,
						num:0
					})
			})
			let flowData=dataSet[0].inFlowVolume.concat(dataSet[0].outFlowVolume);
			let entries=d3.nest().key(d=>d.cluster).rollup(d=>d[0].num+d[1].num).entries(flowData);
			let data=[]
			d3.range(50).forEach(function(cluster){
				let a=entries.find(d=>+d.key===cluster),
					b=dataSet[1].find(d=>d.cluster===cluster),
					selfFlow=b?b.num:0,
					totalFlow=a.value+selfFlow
				data.push({cluster,totalFlow,selfFlow})
			})
			return data
		}
	},
	mounted(){
		let vm=this
		Promise.all([
					$.ajax({
						url: 'http://localhost:3000/grouprecord/GetInOutGroupVolumeByCluster',
						type: 'GET',
					}),
					$.ajax({
						url: 'http://localhost:3000/grouprecord/GetSelfGroupVolumeByCluster',
						type: 'GET',
					})
		]).then(function(dataSet) {
			vm.data=vm.scatterPlotDataAdapter(dataSet)
			vm.draw()
		})
	}
}
</script>
<style>
.axis path,
.axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}

.dot {
  stroke: #000;
}
</style>