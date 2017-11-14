<template>
  <div id='calendar'></div>
</template>
<script type="text/javascript">
let d3 = require('d3');
let _ = require('underscore');
export default {
  data() {
    return {
      cellSize: 23,
      colorSegNum: 11,
      months: [7, 8, 9],
      year: 2016,
      data: null
    }
  },
  computed: {
    no_months_in_a_row() {
      return Math.floor(this.width / (this.cellSize * 7 + 50));
    },
    colorScale() {
      let vm = this
      return d3.scaleQuantize().range(d3.range(vm.colorSegNum).map(function(d) { return `q${d}-${vm.colorSegNum}`; }));
    }
  },
  props: ["width", 'height'],
  methods: {
    mouseover: function(d) {
      let tooltip = d3.select("#calendar>#tooltip")
      tooltip.style("visibility", "visible");
      var text = (this.data.get(d) !== undefined) ? this.data.get(d) : 0;
      text = d.toDateString() + ": " + text;
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(text)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY) - 50 + "px");
    },
    mouseout: function(d) {
      let tooltip = d3.select("#calendar>#tooltip")
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    },
    dataAdapter(data) {
      data = d3.nest()
        .key(function(d) {
          let tmpDate = new Date(d.date);
          tmpDate.setHours(0);
          return tmpDate;
        })
        .rollup(function(d) { return d[0].num })
        .map(data);
      return data
    },
    draw() {
      console.log('draw Calendar')
      let vm = this
      var offset = 0
      var shift_up = this.cellSize;
      var day = d3.timeFormat("%w"),
        week = d3.timeFormat("%U"),
        month = d3.timeFormat("%m"),
        year = d3.timeFormat("%Y")
      var svg = d3.select("#calendar")
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .append("g")
      let monthSvg = svg.selectAll(".month").data(this.months).enter().append("g").attr("class", d => "month" + d)
        .attr("transform", "translate(" + 30 + "," + 0 + ")");
      var rect = monthSvg.selectAll(".day")
        .data(function(d) {
          return d3.timeDays(new Date(vm.year, d - 1, 1), new Date(vm.year, d, 1));
        })
        .enter().append("rect")
        .attr("width", this.cellSize)
        .attr("height", this.cellSize)
        .attr("x", function(d) {
          var month_padding = 1.2 * vm.cellSize * 7 * ((month(d) - 1) % (vm.no_months_in_a_row));
          return day(d) * vm.cellSize + month_padding;
        })
        .attr("y", function(d) {
          var week_diff = week(d) - week(new Date(year(d), month(d) - 1, 1));
          var row_level = Math.floor((month(d) - 7) / (this.no_months_in_a_row));
          let lastDay = new Date(year(d), month(d), 0)
          let y = (week_diff * vm.cellSize) + vm.cellSize * offset
          if (d.getTime() === lastDay.getTime()) {
            let firstDay = new Date(year(d), month(d) - 1, 1)
            offset = offset + Number(week(lastDay)) - Number(week(firstDay)) + 1
          }
          return y //+ cellSize/2 //+ shift_up;
        })
      // on("click", function(d) { vm.$store.commit('CHANGE_SELECTED_DATE', { date: d }) })
      var tooltip = d3.select("#calendar")
        .append("div").attr("id", "tooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("a simple tooltip");

      rect.on("mouseover", this.mouseover);
      rect.on("mouseout", this.mouseout);
      rect.filter(function(d) {
        return vm.data.has(d);
      }).attr("class", function(d) { return "day " + vm.colorScale(vm.data.get(d)); })

    }
  },
  mounted() {
    let vm = this
    $.ajax({
        url: 'http://localhost:3000/grouprecord/GetGroupVolumeByDay',
        type: 'GET'
      })
      .done(function(data) {
        vm.colorScale.domain(d3.extent(data, d => d.num))
        vm.data = vm.dataAdapter(data)
        vm.draw()
      });


  }
}

</script>
<style>
.day {
  fill: #fff;
  stroke: #ccc;
}

/* color ranges */

.q10-11 {
  fill: rgb(165, 0, 38);
}

.q9-11 {
  fill: rgb(215, 48, 39)
}

.q8-11 {
  fill: rgb(244, 109, 67)
}

.q7-11 {
  fill: rgb(253, 174, 97)
}

.q6-11 {
  fill: rgb(254, 224, 139)
}

.q5-11 {
  fill: rgb(255, 255, 191)
}

.q4-11 {
  fill: rgb(217, 239, 139)
}

.q3-11 {
  fill: rgb(166, 217, 106)
}

.q2-11 {
  fill: rgb(102, 189, 99)
}

.q1-11 {
  fill: rgb(26, 152, 80)
}

.q0-11 {
  fill: rgb(0, 104, 55)
}

#tooltip {
  background-color: #fff;
  border: 2px solid #ccc;
  padding: 10px;
}

</style>
