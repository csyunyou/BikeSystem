<template>
	<div id='barchart'></div>
</template>
<script type="text/javascript">
let d3 = require('d3');
let d3tip=require('d3-tip');
import {mapState} from 'vuex';
export  default{
	data(){
		return{
			groupRecord:{
				inRecord:{},
				outRecord:{}
			},
			barData:{
				inFlow:[],
				outFlow:[]
			},
			pieData:{
				inFlow:[],
				outFlow:[]
			},
			clusterNum:50
		}
	},
	computed:{
		...mapState([
			'selectedCluster'
		])
	},
	methods:{
		type:function(d) {
			d.frequency = +d.frequency;
			return d;
		},
		draw:function(){
			d3.selectAll('#barchart > svg').remove();
			d3.selectAll('#barchart > .legend').remove();
			let vm=this;
				let segColor=["#98abc5", "#8a89a6", "#7b6888", "#6b486b"];
				let time2Color=new Map([
					['07-11','#d7191c'],
					['11-16',"#fdae61"],
					['16-21',"#abd9e9"],
					['21-07',"#2c7bb6"]
				]);

			function histoGram(data,type){
				let barColor='#bababa';
				var hG={},    hGDim = {t: 20, r:20, b: 30, l: 40};
			        hGDim.w = 1160 - hGDim.l - hGDim.r, 
			        hGDim.h = 110 - hGDim.t - hGDim.b;
		       
		        //create svg for histogram.
		        var hGsvg = d3.select('#barchart').append("svg").attr('class','svg'+type)
		            .attr("width", hGDim.w + hGDim.l + hGDim.r)
		            .attr("height", hGDim.h + hGDim.t + hGDim.b).append("g")
		            .attr("transform", "translate(0"  + "," + hGDim.t + ")").attr('class','bar'+type);
		        // vm.svg=hGsvg;
		        // create function for x-axis mapping.
		        var x = d3.scale.ordinal().rangeRoundBands([0, hGDim.w], 0.1)
		                .domain(data.map(function(d) { return d['cluster']; }));

		        // Add x-axis to the histogram svg.
		        if(type==='Out'){
		        	hGsvg.append("g").attr("class", "x axis")
			            .attr("transform", "translate(0," + hGDim.h + ")")
			            .call(d3.svg.axis().scale(x).orient('bottom'));
		        }
		        else {
		        	hGsvg.append("g").attr("class", "x axis")
			            .call(d3.svg.axis().scale(x).orient('top'));

		        }

		        // Create function for y-axis map.
		        var y = d3.scale.linear().range([hGDim.h, 0])
		                .domain([0, d3.max(data, function(d) { return d['num']; })]);

		        // Create bars for histogram to contain rectangles and freq labels.
		        var bars = hGsvg.selectAll(".bar").data(data).enter()
		                .append("g").attr("class", "bar");
		        
		        //create the rectangles.
		        bars.append("rect")
		            .attr("x", function(d) { return x(d['cluster']); })
		            .attr("y", function(d) { if(type==='Out') return y(d['num']); })
		            .attr("width", x.rangeBand())
		            .attr("height", function(d) { return hGDim.h - y(d['num']); })
		            .attr('fill',barColor)
		            .on("mouseover",mouseover)// mouseover is defined below.
		            .on("mouseout",mouseout);// mouseout is defined below.
		            
		        //Create the frequency labels above the rectangles.
		        bars.append("text").text(function(d){ return d3.format(",")(d['num'])})
		            .attr("x", function(d) { return x(d['cluster'])+x.rangeBand()/2; })
		            .attr("y", function(d) { if(type==='Out') return y(d['num'])-5; else return hGDim.h-y(d['num'])+15;})
		            .attr("text-anchor", "middle");
		        
		       function mouseover(d){  // utility function to be called on mouseover.
		            // filter for selected state.
		            /*var st = fData.filter(function(s){ return s.State == d[0];})[0],
		                nD = d3.keys(st.freq).map(function(s){ return {type:s, freq:st.freq[s]};});
		               
		            // call update functions of pie-chart and legend.    
		            pC.update(nD);
		            // leg.update(nD);*/
		            console.log(d);
		        }
		        
		        function mouseout(d){    // utility function to be called on mouseout.
		            // reset the pie-chart and legend.    
		            /*pC.update(tF);
		            leg.update(tF);*/
		            console.log(d);
		        }
		        // create function to update the bars. This will be used by pie-chart.
		        hG.update = function(data, color){
		            // update the domain of the y-axis map to reflect change in frequencies.
		            y.domain([0, d3.max(data, function(d) { return d['num']; })]);
		            
		            // Attach the new data to the bars.
		            var bars = hGsvg.selectAll(".bar").data(data);
		            
		            // transition the height and color of rectangles.
		            bars.select("rect").transition().duration(500)
		                .attr("y", function(d) {return y(d['num']); })
		                .attr("height", function(d) { return hGDim.h - y(d['num']); })
		                .attr("fill", color);

		            // transition the frequency labels location and change value.
		            bars.select("text").transition().duration(500)
		                .text(function(d){ return d3.format(",")(d['num'])})
		                .attr("y", function(d) {return y(d['num'])-5; });            
		        }        
		        return hG;
			}
			function pieChart(data,type){
		        var pC ={},    pieDim ={w:100, h: 100};
		        pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;
		        // create svg for pie chart.
		        var piesvg = d3.select('#barchart > .svg'+type).append("g")
		            .attr("transform", "translate("+1120+","+pieDim.h/2+")");
		        
		        // create function to draw the arcs of the pie slices.
		        var arc = d3.svg.arc().outerRadius(pieDim.r - 10).innerRadius(0);

		        // create a function to compute the pie slice angles.
		        var pie = d3.layout.pie().sort(null).value(function(d) { return d.num; });

		        // Draw the pie slices.
		        piesvg.selectAll("path").data(pie(data)).enter().append("path").attr("d", arc)
		            .each(function(d) {this._current = d; })
		            .style("fill", function(d) {return time2Color.get(d.data['time']); })
		            .on("mouseover",mouseover).on("mouseout",mouseout);
		        // create function to update pie-chart. This will be used by histogram.
		       pC.update = function(nD){
		            piesvg.selectAll("path").data(pie(nD)).transition().duration(500)
		                .attrTween("d", arcTween);
		        }    
		        // Utility function to be called on mouseover a pie slice.
		        function mouseover(d){
		            // call the update function of histogram with new data.
		            hG.update(vm.groupRecord[d.data.time],time2Color.get(d.data.time));
		        }
		        //Utility function to be called on mouseout a pie slice.
		        function mouseout(d){
		            // call the update function of histogram with all data.
		            
		            hG.update(vm.barData, '#bababa');
		        }
		        // Animating the pie-slice requiring a custom function which specifies
		        // how the intermediate paths should be drawn.
		       /* function arcTween(a) {
		            var i = d3.niterpolate(this._current, a);
		            this._current = i(0);
		            return function(t) { return arc(i(t));    };
		        }   */ 
		    }
		    // function to handle legend.
		    function legend(data){
		        var leg = {};
		            
		        // create table for legend.
		        var legend = d3.select('#barchart').append("table").attr('class','legend');
		        
		        // create one row per segment.
		        var tr = legend.append("tbody").selectAll("tr").data(data).enter().append("tr");
		            
		        // create the first column for each segment.
		        tr.append("td").append("svg").attr("width", '16').attr("height", '16').append("rect")
		            .attr("width", '16').attr("height", '16')
					.attr("fill",function(d){ return time2Color.get(d.time); });
		            
		        // create the second column for each segment.
		        tr.append("td").text(function(d){ return d.time;});

		        // create the third column for each segment.
		        tr.append("td").attr("class",'legendFreq')
		            .text(function(d){ return d3.format(",")(d.num);});

		        // create the fourth column for each segment.
		        tr.append("td").attr("class",'legendPerc')
		            .text(function(d){ return getLegend(d,data);});

		        // Utility function to be used to update the legend.
		        /*leg.update = function(nD){
		            // update the data attached to the row elements.
		            var l = legend.select("tbody").selectAll("tr").data(nD);

		            // update the frequencies.
		            l.select(".legendFreq").text(function(d){ return d3.format(",")(d.freq);});

		            // update the percentage column.
		            l.select(".legendPerc").text(function(d){ return getLegend(d,nD);});        
		        }*/
		        
		        function getLegend(d,aD){ // Utility function to compute percentage.
		            return d3.format("%")(d.num/d3.sum(aD.map(function(v){ return v.num; })));
		        }

		    }
			
			let hGOut=histoGram(vm.barData.outFlow,'Out');
			let hGIn=histoGram(vm.barData.inFlow,'In');
			pieChart(vm.pieData.outFlow,'Out');
			pieChart(vm.pieData.inFlow,'In');
			// legend(pieData);
			// test();
			
		}
	},
	watch:{
		selectedCluster:function(cluster){
			console.log('hi');
			let vm=this;
			if(cluster!==null){
				Promise.all([
					$.ajax({
					url: 'http://localhost:3000/grouprecord/GetOutFlowBarChartData',
					type: 'GET',
					data:{cluster}}),
					$.ajax({
					url: 'http://localhost:3000/grouprecord/GetInFlowBarChartData',
					type: 'GET',
					data:{cluster}})
				]).then(function(dataSet) {
					dataSet.forEach(function(data){
						Object.keys(data).forEach(function(key){
							let datum=data[key];
							for(let i=0;i<vm.clusterNum;i++){
								if((datum.find(d=>d.cluster===i))===undefined){
									datum.push({cluster:i,num:0});
								}
							}
							datum.sort((x,y)=>x.cluster-y.cluster);
						})
					})
					vm.groupRecord.outRecord=dataSet[0];
					vm.groupRecord.inRecord=dataSet[1];
					Object.keys(vm.groupRecord).forEach(function(key,index){
						let tmpRecord=vm.groupRecord[key];
						let flag=index===0?'inFlow':'outFlow';
						for(let i=0;i<vm.clusterNum;i++){
							let sum=0;
							Object.keys(tmpRecord).forEach(function(key){
								sum+=tmpRecord[key].find(d=>d.cluster===i).num;
							})
							vm.barData[flag].push({cluster:i,num:sum});
						}
						let type=['07-11','11-16','16-21','21-07']
						Object.keys(tmpRecord).forEach(function(key,index){
							let {num:sum}=tmpRecord[key].reduce(({num:x},{num:y})=>({num:x+y}));
							vm.pieData[flag].push({time:type[index],num:sum})
						})
					})
					
					
					// vm.barData.sort((x,y)=>(y.num-x.num));
					vm.draw();
				});
			}	
		}
	},
	mounted(){
		// this.draw();
	}


}
</script>
<style scoped>
	.axis path,
	.axis line {
	  fill: none;
	  stroke: #000;
	  shape-rendering: crispEdges;
	}

	.bar {
	  fill: orange;
	}
	.x.axis path {
	  display: none;
	}

</style>