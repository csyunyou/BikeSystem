<template>
  <div id='barplot' :style="{width:`${width}px`,height:`${height}px`}"></div>
</template>
<script type="text/javascript">
let d3 = require('d3');
export default {
  data() {
    return {
      defaultBarData: [],
      width: 470,
      height: 400,
      defaultColor: '#9ecae1',
      margin: { top: 80, right: 10, bottom: 20, left: 40 },
    }
  },
  computed: {
    xScale() {
      return d3.scaleBand().rangeRound([0, this.xAxisWidth]).padding(0.1)
    },
    yScale() {
      return d3.scaleLinear().range([this.yAxisHeight, 0])
    },
    selectedCentroid() {
      return this.$store.state.selectedCentroid
    },
    colors() {
      return this.$store.state.centroidColor
    },
    xAxisWidth() {
      return this.width - this.margin.left - this.margin.right
    },
    yAxisHeight() {
      return this.height - this.margin.top - this.margin.bottom
    },
    svg() {
      return d3.select("#barplot").append("svg").attr("width", this.width).attr("height", this.height)
    }
  },
  methods: {
    barDataAdapter: function(data) {
      let barData = []
      for (let key in data[0]) {
        barData.push({ age: key, num: data[0][key] })
      }
      return barData
    },
    draw: function(data) {
      let vm = this,
        g = this.svg.append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

      this.xScale.domain(data.map(d => d.age));
      this.yScale.domain([0, d3.max(data, d => d.num)]);
      g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + this.yAxisHeight + ")")
        .call(d3.axisBottom(this.xScale));
      g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(this.yScale).tickFormat(d3.format(".2s")))
      g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return vm.xScale(d.age); })
        .attr("y", function(d) { return vm.yScale(d.num); })
        .attr("width", this.xScale.bandwidth())
        .attr("height", function(d) { return vm.yAxisHeight - vm.yScale(d.num); })
        .attr("fill", vm.selectedCentroid === -1 ? vm.defaultColor : vm.colors[vm.selectedCentroid])
      // .attr("stroke","black")
    }
  },
  watch: {
    selectedCentroid: function(newVal) {
      this.svg.selectAll("g").remove();
      let vm = this
      if (newVal === -1) {
        this.draw(this.defaultBarData)
        return;
      }
      $.ajax({
          url: 'http://localhost:3000/grouprecord/GetAgeDistribution',
          type: 'GET',
          data: { cluster: vm.selectedCentroid },
        })
        .done(function(data) {
          vm.draw(vm.barDataAdapter(data))
        })
    }
  },
  mounted() {
    let vm = this
    $.ajax({
        url: 'http://localhost:3000/grouprecord/GetTotalAgeDistribution',
        type: 'GET',
      })
      .done(function(data) {
        vm.defaultBarData = vm.barDataAdapter(data)
        vm.draw(vm.defaultBarData)
      })
  }
}

</script>
<style>
.axis--x path {
  display: none;
}

.bar:hover {
  opacity: 0.5
}

</style>
