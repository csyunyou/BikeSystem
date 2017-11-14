<template>
  <div id='map'>
  </div>
</template>
<script type="text/javascript">
import L from 'leaflet';
import simpleMarkers from '../lib/Leaflet.SimpleMarkers/lib/Control.SimpleMarkers.js'
import bus from '../lib/js/eventBus.js'
import * as d3 from 'd3'
import d3SvgOverlay from 'leaflet-d3-svg-overlay'
import _ from "underscore"
export default {
  data() {
    return {
      map: null,
      mapOptions: {
        center: [40.7254, -73.9757],
        zoom: 12,
        mapBaseLayers: {
          lightMap: L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoieXVueW91IiwiYSI6ImNpczg2aDh0NTAwMzkyeXA3MXU3YjMxeGcifQ.z-j7gq3uS7yQ2CCjiaIp1g', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
              '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
              'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'mapbox.dark'
          }),
          streetMap: L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoieXVueW91IiwiYSI6ImNpczg2aDh0NTAwMzkyeXA3MXU3YjMxeGcifQ.z-j7gq3uS7yQ2CCjiaIp1g', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
              '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
              'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'mapbox.dark'
          })
        }
      },
      flow: {
        colorMap: ["#3182bd", "#de2d26"],
        widthScale: d3.scaleLinear().range([0, 8]),
        threshold: 4
      },
      centroids: {
        centroidData: [],
        sizeScale: d3.scaleLinear().range([2, 15]),
      },
      marker: {
        src: -1,
        des: -1
      },
      layers: {
        stationsLayer: [],
        centroidsLayer: null,
        flowLayer: null,
        markerControlLayer: null,
      },
      mapMode: "centroidMode",
      markerCentroidClickMutex: 1,
      centroidMaxFlowVolume: -1,
      stationMaxFlowVolume: -1,
      weekdayNum: 66,
      weekendNum: 26,
    }
  },
  methods: {
    addFlowsLayer: function(data) {
      let vm = this
      vm.layers.flowLayer = d3SvgOverlay(function(selection, projection) {
        let link = selection.selectAll(".flowGroup").data(data).enter().append("g")
          .attr("class", function(d, i) {
            return `flowGroup${i===0?"Src":"Des"}`
          })
          .style("stroke", function(d, i) {
            return vm.flow.colorMap[i]
          })
          .style("fill", "none").selectAll('.flow').data(d => d).enter().append("path")
          .attr("class", "flow")
          .attr("d", function(d) {
            let src = projection.latLngToLayerPoint([d.srcLatLng.lat, d.srcLatLng.lng]),
              des = projection.latLngToLayerPoint([d.desLatLng.lat, d.desLatLng.lng])
            var sx = src.x,
              sy = src.y,
              tx = des.x,
              ty = des.y,
              dx = tx - sx,
              dy = ty - sy,
              dr = 2 * Math.sqrt(dx * dx + dy * dy);
            return "M" + sx + "," + sy + "A" + dr + "," + dr + " 0 0,1 " + tx + "," + ty;
          }).style("stroke-width", function(d) { return vm.flow.widthScale(d.weight) })
          .style("stroke-opacity", 0.7)
      })
      vm.layers.flowLayer.addTo(vm.map);
    },
    filterFlowsBySlider({ type, threshold }) {
      this.layers.flowLayer.selection.selectAll(`.flowGroup${type}>.flow`).style("stroke-opacity", 0.7)
      this.layers.flowLayer.selection.selectAll(`.flowGroup${type}>.flow`).filter(function(d) {
        return d.weight < threshold
      }).style("stroke-opacity", .0)
    },
    centroidSizeDataAdapter: function({ inOutFlow, selfFlow }) {
      let sizeData = []
      this.centroids.centroidData.forEach(function(centroid) {
        let inVolume = inOutFlow["inFlowVolume"].find(d => d.cluster === centroid.cluster),
          outVolume = inOutFlow["outFlowVolume"].find(d => d.cluster === centroid.cluster),
          selfVolume = selfFlow.find(d => d.cluster === centroid.cluster)
        centroid.size = (inVolume ? inVolume.num : 0) + (outVolume ? outVolume.num : 0) + (selfVolume ? selfVolume.num : 0)
      })
    },
    onMarkerAdd: function(marker) {
      let vm = this
      let minDis = d3.min(this.centroids.centroidData, d => Math.pow(marker._latlng.lat - d.latitude, 2) + Math.pow(marker._latlng.lng - d.longitude, 2))
      let c = this.centroids.centroidData.find(d => Math.abs(Math.pow(marker._latlng.lat - d.latitude, 2) + Math.pow(marker._latlng.lng - d.longitude, 2) - minDis) < Number.EPSILON)
      if (marker.options.class === "add_marker_source_control") this.marker.src = c.cluster
      else this.marker.des = c.cluster
      if (~this.marker.src && ~this.marker.des) {
        this.mapMode = "stationMode"
        this.$store.commit('CHANGE_SELECTED_PAIR', { pair: [this.marker.src, this.marker.des] })
        this.layers.stationsLayer.eachLayer((function(layer) {
          if (layer.options.cluster === this.marker.des || layer.options.cluster === this.marker.src) {
            layer.setStyle({ fillOpacity: 1.0 });
          }
        }).bind(this))
        // this.map.removeLayer(this.centroidsLayer)
        bus.$emit("switchCentroidLayer", false)
        // vm.$emit('update:sliderDisable', false)
        $.ajax({
            url: 'http://localhost:3000/grouprecord/GetAllFlowVolumeBetweenClusters',
            type: 'GET',
            data: { src: this.marker.src, des: this.marker.des }
          })
          .done(function(data) {
            vm.addStationLatLng(data)
            vm.flow.widthScale.domain([0, vm.stationMaxFlowVolume])
            vm.addFlowsLayer([data.s2d, data.d2s])
            bus.$emit('setSlider', { type: "src", num: data.s2d[4].weight, max: d3.max(data.s2d, d => d.weight) })
            bus.$emit('setSlider', { type: "des", num: data.d2s[4].weight, max: d3.max(data.d2s, d => d.weight) })
          })
      }
    },
    onMarkerDelete: function(marker) {
      if (marker.options.type === "source") this.markerSrc = -1
      else this.markerDes = -1
      this.d3SvgLayer.addTo(this.map);
    },
    addCentroidsLayer: function(data) {
      let vm = this
      vm.layers.centroidsLayer = d3SvgOverlay(function(selection, projection) {
        var updateSelection = selection.selectAll('circle').data(data);
        updateSelection.enter()
          .append('circle')
          .attr("cx", function(d) { return projection.latLngToLayerPoint(L.latLng(d.latitude, d.longitude)).x })
          .attr("cy", function(d) { return projection.latLngToLayerPoint(L.latLng(d.latitude, d.longitude)).y })
          .attr("r", function(d) {
            return vm.centroids.sizeScale(d.size)
          })
          .style("fill", d => vm.colors[d.cluster])
          .attr("stroke", "black")
          .attr("stroke-opacity", 0.0)
          .on("click", function(d) {
            if (!vm.markerCentroidClickMutex) return;
            if (d.cluster === vm.selectedCentroid) {
              vm.$store.commit('CHANGE_SELECTED_CENTROID', { centroid: -1 })
            } else {
              vm.$store.commit("CHANGE_SELECTED_CENTROID", { centroid: d.cluster })
            }
            // d3.event.stopPropagation(true)
          })

      });
      vm.layers.centroidsLayer.addTo(vm.map);
    },
    addStationsLayer: function(data) {
      let vm = this
      let featureGroup = []
      data.stations.forEach(function(station) {
        let circle = L.circle([station.latitude, station.longitude], {
          opacity: 0.0,
          fillColor: vm.colors[station.cluster],
          fillOpacity: 1.0,
          radius: 60, //40,
          cluster: station.cluster,
          name: station.name,
          id: station.id,
          color: vm.colors[station.cluster]
        })
        circle.on('click', function() {
          console.log(this.options.name)
        })
        featureGroup.push(circle)
      });
      vm.layers.stationsLayer = L.featureGroup(featureGroup)
      vm.map.addLayer(vm.layers.stationsLayer)
    },
    stationLayerSwitch: function(on) {
      if (on) {
/*        this.layers.stationsLayer.eachLayer(function(layer) {
          layer.setStyle({
            fillOpacity: 1.0
          });
        });*/
        this.layers.stationsLayer.addTo(this.map)
      } else {
/*        this.layers.stationsLayer.eachLayer(function(layer) {
          layer.setStyle({
            fillOpacity: 0.0
          });
        });*/
        this.map.removeLayer(this.layers.stationsLayer)
      }
    },
    centroidLayerSwitch: function(on) {
      let vm = this
      if (!on) {
        this.map.removeLayer(this.layers.centroidsLayer)
      } else {
        this.map.addLayer(this.layers.centroidsLayer)
        if (this.mapMode === "stationMode") {
          this.marker.src = -1
          this.marker.des = -1
          this.$store.commit("CHANGE_SELECTED_PAIR", { pair: null })
          this.map.removeLayer(this.layers.flowLayer)
          this.layers.markerControlLayer.deleteAllMarkers()
          this.layers.stationsLayer.eachLayer(function(layer) {
            layer.setStyle({
              fillOpacity: 0.0
            });
          });
          bus.$emit("setSlider", { type: "src", max: 0, num: 0 })
          bus.$emit("setSlider", { type: "des", max: 0, num: 0 })
          this.mapMode = "centroidMode"
        }
      }
    },
    selectFlowsByModeAndHour({ mode, startHour, endHour }) {
      let vm = this,
        demominator = mode === "weekend" ? vm.weekendNum : vm.weekdayNum
      this.layers.flowLayer && this.map.removeLayer(this.layers.flowLayer)
      if (this.mapMode === "centroidMode") {
        $.ajax({
            url: 'http://localhost:3000/centroid/GetInOutFlowBetweenClusterByHourAndMode',
            type: 'GET',
            data: { cluster: vm.selectedCentroid, mode, startHour, endHour },
          })
          .done(function(data) {
            vm.addCentroidLatLng(data)
            data.inFlow.forEach(d => d.weight = d.weight / demominator)
            data.outFlow.forEach(d => d.weight = d.weight / demominator)
            let maxVal = d3.max([data.inFlow, data.outFlow], function(flow) { return d3.max(flow, d => d.weight) })
            vm.flow.widthScale.domain([0, maxVal])
            vm.addFlowsLayer([data.inFlow, data.outFlow])
            bus.$emit("setSlider", { type: "src", max: d3.max(data.inFlow, d => d.weight), num: data.inFlow[vm.flow.threshold].weight })
            bus.$emit("setSlider", { type: "des", max: d3.max(data.outFlow, d => d.weight), num: data.outFlow[vm.flow.threshold].weight })
          })
      } else if (this.mapMode === "stationMode") {
        $.ajax({
            url: 'http://localhost:3000/grouprecord/GetAllFlowVolumeBetweenClustersByHourAndMode',
            type: 'GET',
            data: { src: this.marker.src, des: this.marker.des, mode, startHour, endHour }
          })
          .done(function(data) {
            vm.addStationLatLng(data)
            data.d2s.forEach(d => d.weight = d.weight / demominator)
            data.s2d.forEach(d => d.weight = d.weight / demominator)
            let maxVal = d3.max([data.d2s, data.s2d], function(flow) { return d3.max(flow, d => d.weight) })
            vm.flow.widthScale.domain([0, maxVal])
            vm.addFlowsLayer([data.d2s, data.s2d])
            bus.$emit('setSlider', { type: "src", num: data.s2d[vm.flow.threshold].weight, max: d3.max(data.s2d, d => d.weight) })
            bus.$emit('setSlider', { type: "des", num: data.d2s[vm.flow.threshold].weight, max: d3.max(data.d2s, d => d.weight) })
          })
      }
    },
    addStationLatLng(data) {
      let vm = this
      Object.keys(data).forEach(function(key) {
        let flowGroup = data[key]
        flowGroup.forEach(function(flow) {
          let srcStation = vm.layers.stationsLayer.getLayers().find(tmp => tmp.options.id === flow.src),
            desStation = vm.layers.stationsLayer.getLayers().find(tmp => tmp.options.id === flow.des)
          flow.srcLatLng = { lat: srcStation._latlng.lat, lng: srcStation._latlng.lng },
            flow.desLatLng = { lat: desStation._latlng.lat, lng: desStation._latlng.lng }
        })
      })
    },
    addCentroidLatLng(data) {
      let vm = this
      Object.keys(data).forEach(function(key) {
        let flowGroup = data[key]
        flowGroup.forEach(function(flow) {
          let srcCentroid = vm.centroids.centroidData.find(tmp => tmp.cluster === flow.src),
            desCentroid = vm.centroids.centroidData.find(tmp => tmp.cluster === flow.des)
          flow.srcLatLng = { lat: srcCentroid.latitude, lng: srcCentroid.longitude },
            flow.desLatLng = { lat: desCentroid.latitude, lng: desCentroid.longitude }
        })
      })
    }
  },
  computed: {
    colors() {
      return this.$store.state.centroidColor
    },
    mapHighlight() {
      return this.$store.state.mapHighlight
    },
    selectedCentroid() {
      return this.$store.state.selectedCentroid
    }
  },
  watch: {
    selectedCentroid(cluster) {
      let vm = this
      this.layers.flowLayer && this.map.removeLayer(this.layers.flowLayer)
      if (cluster !== -1) {
        $.ajax({
            url: 'http://localhost:3000/centroid/GetTopFiveInOutFlowBetweenCluster',
            type: 'GET',
            data: { cluster },
          })
          .done(function(data) {
            vm.addCentroidLatLng(data)
            vm.flow.widthScale.domain([0, vm.centroidMaxFlowVolume])
            vm.addFlowsLayer([data.inFlow, data.outFlow])
            bus.$emit("setSlider", { type: "src", max: d3.max(data.inFlow, d => d.weight), num: data.inFlow[vm.flow.threshold].weight })
            bus.$emit("setSlider", { type: "des", max: d3.max(data.outFlow, d => d.weight), num: data.outFlow[vm.flow.threshold].weight })
          })
      } else {
        bus.$emit("setSlider", { type: "src", max: 0, num: 0 })
        bus.$emit("setSlider", { type: "des", max: 0, num: 0 })
      }
    },
    mapHighlight: function(cluster) {
      if (cluster === -1) {
        this.layers.stationsLayer.eachLayer(function(layer) {
          layer.setStyle({
            opacity: 0.0,
            fillOpacity: 1.0
          });
        })
        this.layers.centroidsLayer.selection.selectAll("circle")
          .attr("stroke-opacity", 0.0)
          .attr("fill-opacity", 1.0)
      } else {
        this.layers.stationsLayer.eachLayer(function(layer) {
          if (layer.options.cluster === cluster) {
            layer.setStyle({
              opacity: 1.0,
              fillOpacity: 1.0
            });
          } else
            layer.setStyle({
              opacity: 0.0,
              fillOpacity: 0.5
            });
        });
        this.layers.centroidsLayer.selection.selectAll("circle")
          .attr("stroke-opacity", 0.0)
          .attr("fill-opacity", 0.5)
        this.layers.centroidsLayer.selection.selectAll("circle").filter(d => d.cluster === cluster)
          .attr("stroke", "black")
          .attr("stroke-opacity", 1.0)
          .attr("fill-opacity", 1.0)
      }
    }
  },
  created() {
    bus.$on("switchStationLayer", status => this.stationLayerSwitch(status))
    bus.$on("switchCentroidLayer", status => this.centroidLayerSwitch(status))
    bus.$on("filterFlowsBySlider", sliderInfo => this.filterFlowsBySlider(sliderInfo))
    bus.$on("selectFlowsByModeAndHour", timeInfo => this.selectFlowsByModeAndHour(timeInfo))
  },
  mounted() {
    let vm = this
    this.map = L.map('map').setView(this.mapOptions.center, this.mapOptions.zoom);
    this.mapOptions.mapBaseLayers.streetMap.addTo(this.map);

    vm.layers.markerControlLayer = new simpleMarkers({
      marker_draggable: true,
      marker_icon: [{
        icon: L.icon({ iconUrl: '/static/image/icon-source.png', iconSize: [20, 20] }),
        class: "add_marker_source_control"
      }, { icon: L.icon({ iconUrl: '/static/image/icon-destination.png', iconSize: [20, 20] }), class: "add_marker_destination_control" }],
      allow_popup: false,
      add_marker_callback: vm.onMarkerAdd.bind(vm),
      delete_marker_callback: vm.onMarkerDelete.bind(vm),
      before_add_marker_callback: () => this.markerCentroidClickMutex--,
      after_add_marker_callback: () => this.markerCentroidClickMutex++
    });
    this.map.addControl(vm.layers.markerControlLayer);

    Promise.all([
      $.ajax({
        url: 'http://localhost:3000/station/GetStations',
        type: 'GET',
      }),
      $.ajax({
        url: 'http://localhost:3000/grouprecord/GetAllFlowVolumeBetweenStations',
        type: 'GET',
      })
    ]).then(function(dataSet) {
      vm.addStationsLayer(dataSet[0])
      vm.stationLayerSwitch(false)
    })

    Promise.all([
      $.ajax({
        url: 'http://localhost:3000/centroid/getCentroids',
        type: 'GET'
      }),
      $.ajax({
        url: 'http://localhost:3000/centroid/GetMaxFlowVolumeBetweenCluster',
        type: 'GET'
      }),
      $.ajax({
        url: 'http://localhost:3000/grouprecord/GetMaxFlowVolumeBetweenStation',
        type: 'GET'
      }),
      $.ajax({
        url: 'http://localhost:3000/grouprecord/GetInOutGroupVolumeByCluster',
        type: 'GET'
      }),
      $.ajax({
        url: 'http://localhost:3000/grouprecord/GetSelfGroupVolumeByCluster',
        type: 'GET'
      })
    ]).then(function(dataSet) {
      vm.centroids.centroidData = dataSet[0];

      vm.centroidMaxFlowVolume = dataSet[1][0].maxweight
      vm.stationMaxFlowVolume = dataSet[2][0].maxweight
      vm.centroidSizeDataAdapter({ inOutFlow: dataSet[3], selfFlow: dataSet[4] });
      vm.centroids.sizeScale.domain([0, d3.max(vm.centroids.centroidData, d => d.size)])
      vm.addCentroidsLayer(vm.centroids.centroidData)
    });
  }

}

</script>
<style type="text/css" scoped>
#map {
  height: 792px;
  width: 1000px;
}

@import url(../../node_modules/leaflet/dist/leaflet.css);
@import url(../lib/Leaflet.SimpleMarkers/lib/Control.SimpleMarkers.css);

</style>
