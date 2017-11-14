<template>
	<div id='heatmap'></div>
</template>
<script type="text/javascript">
let d3 = require('d3');
let _ = require('underscore');
import {mapState} from 'vuex';
export  default{
	data(){
		return{
			groupRecord:{
				inRecord:[],
				outRecord:[]
			},
			clusterNum:50
		}
	},
	methods:{
		draw:function(){
			var itemSize = 18,
			    cellSize = itemSize-1,
			    width = 1000,
			    height = 690,
			    margin = {top:20,right:20,bottom:20,left:25},
			    colorCalibration = ['#f6faaa','#FEE08B','#FDAE61','#F46D43','#D53E4F','#9E0142'];
			var heatmap = d3.select('#heatmap').append('svg')
			    .attr('width',width)
			    .attr('height',height)
				.append('g')
			    .attr('width',width-margin.left-margin.right)
			    .attr('height',height-margin.top-margin.bottom)
			    .attr('transform','translate('+margin.left+','+margin.top+')');
			let maxVal=d3.max(this.groupRecord.outRecord,d=>d.num)
			var colorIndex = d3.scale.quantize()
			          .range([0,1,2,3,4,5])
			          .domain([0,maxVal]);
			var rect = null;
			rect = heatmap.selectAll('rect')
				   	  .data(this.groupRecord.outRecord)
				      .enter().append('rect')
				      .attr('width',cellSize)
				      .attr('height',cellSize)
				      .attr('x',function(d){
				        return itemSize*(d.cluster);
				      })
				      .attr('y',function(d){            
				        return d.idx*itemSize;
				      })
				      .attr('fill',function(d){return colorCalibration[colorIndex(d.num)]})
			rect.append('title').text(function(d){return d.idx+" "+d.cluster+" "+d.num})
		}
	},
	computed:{
		...mapState([
			'selectedCluster'
		])
	},
	watch:{
		selectedCluster:function(cluster){
			let vm=this;
			if(cluster!==null){
				$.ajax({
					url: 'http://localhost:3000/grouprecord/GetOutFlowData',
					type: 'GET',
					data:{cluster}
				}).done(function(data) {
					vm.groupRecord.outRecord=data;
					vm.draw();
				})
			}
		}
	}

}
</script>