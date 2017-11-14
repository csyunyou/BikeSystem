<template>
  <div id='linechart' :style="{width:`${width}px`,height:`${height}px`}">
  </div>
</template>
<script type="text/javascript">
let d3 = require('d3');
let _ = require("underscore")
export default {
  data() {
    return {
      weekdayStackData: null,
      weekendStackData: null,
      angleScale: d3.scaleTime().range([0, 2 * Math.PI]),
      dayColorScale: d3.scaleOrdinal().range(['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494']),
      outDiffColorScale: d3.scaleQuantize().range(['#ffffcc', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026']),
      inDiffColorScale: d3.scaleQuantize().range(['#ffffcc', '#a1dab4', '#41b6c4', '#2c7fb8', '#253494']),
      innerRadius: 75,
      outerRadius: 115,
      width: 280,
      height: 400,
    }
  },
  methods: {
    stackAjaxAdapter: function(data) {
      let key = _.uniq(data.map(d => d.day)).sort(function(a, b) { return a - b })
      var stack = d3.stack().keys(key)
      var nest = d3.nest().key(function(d) { return d.hour; });
      data = nest.entries(data);
      let tmpData = []
      for (let i = 0; i < 24; i++) {
        let hour = data.find(d => +d.key === i),
          tmp
        if (!hour) {
          tmp = {
            hour: i
          }
          hour = {}
          hour.values = []
        } else {
          tmp = { hour: +hour.key }
        }
        key.forEach(function(j) {
          let day = hour.values.find(d => d.day === j)
          tmp[j] = day ? day.num : 0
        })
        tmpData.push(tmp)
      }
      return stack(tmpData);
    },
    donutAjaxAdapter: function(data) {
      let inFlow, outFlow, inFlowNum, outFlowNum;
      let donutData = _.range(24).map(function(hour) {
        inFlow = data.inFlowVolume.find(d => d.hour === hour)
        outFlow = data.outFlowVolume.find(d => d.hour === hour)
        inFlowNum = inFlow ? inFlow.num : 0
        outFlowNum = outFlow ? outFlow.num : 0
        return { hour, diff: inFlowNum - outFlowNum }
      })
      return donutData
    },
    drawStack: function(layers, info) {
      let vm = this
      var area = d3.radialArea()
        .curve(d3.curveCardinalClosed)
        .angle(function(d) { return vm.angleScale(d.data.hour); })
        .innerRadius(function(d) { return vm.radiusScale(d[0]); })
        .outerRadius(function(d) { return vm.radiusScale(d[1]); }),
        g = info.g.append("g")
      this.angleScale.domain([0, 24]);
      this.dayColorScale.domain(layers.map(d => d.key))
      g.selectAll(".layer")
        .data(layers)
        .enter().append("path")
        .attr("class", "layer")
        .attr("d", area)
        .style("fill", function(d, i) { return vm.dayColorScale(d.key); })
        .attr("fill-opacity", 0.8)
        .on("mouseover", function(d, i) {
          d3.event.target.setAttribute("fill-opacity", 1.0)
          d3.event.target.setAttribute("stroke", "black")
        })
        .on("mouseout", function(d, i) {
          d3.event.target.setAttribute("fill-opacity", 0.7)
          d3.event.target.setAttribute("stroke", "none")
        });
      g.selectAll(".axis")
        .data(d3.range(24))
        .enter().append("g")
        .attr("transform", function(d) { return "rotate(" + vm.angleScale(d) * 180 / Math.PI + ")"; })
        .append("text")
        .attr("y", -vm.innerRadius + 6)
        .attr("dy", ".71em")
        .attr("text-anchor", "middle")
        .attr("fill", "#000")
        .text(function(d) { return d; });
    },
    drawDonut: function(data, info) {
      let inMaxVal = d3.max(data, d => d.diff),
        outMaxVal = -d3.min(data, d => d.diff)
      this.inDiffColorScale.domain([0, inMaxVal])
      this.outDiffColorScale.domain([0, outMaxVal])
      let vm = this,
        pie = d3.pie().sort((a, b) => a.hour - b.hour).value(d => 1)
      var arc = d3.arc()
        .outerRadius(vm.outerRadius - 70)
        .innerRadius(vm.innerRadius - 40);
      var arcg = info.g.append("g").selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");
      arcg.append("path")
        .attr("d", arc)
        .style("fill", function(d) { return d.data.diff > 0 ? vm.inDiffColorScale(d.data.diff) : vm.outDiffColorScale(-d.data.diff); })
        .style("stroke", "#cccccc");
    }
  },
  computed: {
    selectedCentroid() {
      return this.$store.state.selectedCentroid
    },
    svg() {
      return d3.select("#linechart").append("svg").attr("width", this.width).attr("height", this.height)
    },
    weekdayInfo() {
      return {
        label: "工作日",
        g: this.svg.append("g").attr("transform", "translate(" + this.width / 2 + "," + 85 + ")").attr("class", "weekday-group")
      }
    },
    weekendInfo() {
      return {
        label: "周末",
        g: this.svg.append("g").attr("transform", "translate(" + this.width / 2 + "," + 290 + ")").attr("class", "weekend-group")
      }
    },
    radiusScale() {
      return d3.scaleLinear().range([this.innerRadius, this.outerRadius])
    }
  },
  watch: {
    selectedCentroid: function(cluster) {
      let vm = this
      this.weekdayInfo.g.selectAll('g').remove()
      this.weekendInfo.g.selectAll('g').remove()
      if (cluster === -1) {
        let maxVal = d3.max([vm.weekdayStackData, vm.weekendStackData], function(layer) { return d3.max(layer[layer.length - 1], function(d) { return d[1] }) })
        vm.radiusScale.domain([0, maxVal])
        vm.drawStack(vm.weekdayStackData, vm.weekdayInfo)
        vm.drawStack(vm.weekendStackData, vm.weekendInfo)
        return
      }
      Promise.all([$.ajax({
          url: 'http://localhost:3000/grouprecord/GetGroupVolumeByHourOnWeekday',
          type: 'GET',
          data: { cluster }
        }),
        $.ajax({
          url: 'http://localhost:3000/grouprecord/GetGroupVolumeByHourInWeekend',
          type: 'GET',
          data: { cluster }
        })
      ]).then(function([weekdayData, weekendData]) {
        let layers1 = vm.stackAjaxAdapter(weekdayData),
          layers2 = vm.stackAjaxAdapter(weekendData)
        let maxVal = d3.max([layers1, layers2], function(layer) { return d3.max(layer[layer.length - 1], function(d) { return d[1] }) })
        vm.radiusScale.domain([0, maxVal])
        vm.drawStack(layers1, vm.weekdayInfo)
        vm.drawStack(layers2, vm.weekendInfo)
      })
      Promise.all([$.ajax({
          url: 'http://localhost:3000/grouprecord/GetInOutGroupVolumeByHourOnWeekday',
          type: 'GET',
          data: { cluster },
        }),
        $.ajax({
          url: 'http://localhost:3000/grouprecord/GetInOutGroupVolumeByHourInWeekend',
          type: 'GET',
          data: { cluster }
        })
      ]).then(function([weekdayData, weekendData]) {
        let weekdayDonutData = vm.donutAjaxAdapter(weekdayData),
          weekendDonutData = vm.donutAjaxAdapter(weekendData)
        vm.drawDonut(weekdayDonutData, vm.weekdayInfo)
        vm.drawDonut(weekendDonutData, vm.weekendInfo)
      })
    }
  },
  mounted() {
    let vm = this
    Promise.all([$.ajax({
        url: 'http://localhost:3000/grouprecord/GetTotalGroupVolumeByHourOnWeekday',
        type: 'GET',
      }),
      $.ajax({
        url: 'http://localhost:3000/grouprecord/GetTotalGroupVolumeByHourInWeekend',
        type: 'GET',
      })
    ]).then(function([weekdayData, weekendData]) {
      vm.weekdayInfo.g.append("text").attr("text-anchor", "middle").text(vm.weekdayInfo.label)
      vm.weekendInfo.g.append("text").attr("text-anchor", "middle").text(vm.weekendInfo.label)
      let layers1 = vm.stackAjaxAdapter(weekdayData),
        layers2 = vm.stackAjaxAdapter(weekendData)
      let maxVal = d3.max([layers1, layers2], function(layer) { return d3.max(layer[layer.length - 1], function(d) { return d[1] }) })
      vm.radiusScale.domain([0, maxVal])
      vm.weekdayStackData = layers1
      vm.weekendStackData = layers2
      vm.drawStack(vm.weekdayStackData, vm.weekdayInfo)
      vm.drawStack(vm.weekendStackData, vm.weekendInfo)
    })
  }
}

</script>

