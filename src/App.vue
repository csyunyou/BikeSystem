<template>
  <div id="app">
    <Row type="flex" justify="space-around">
      <Col span="4">
      <Row>
        <Col span="24">
        <Card>
          <p slot="title" class="title">日历图</p>
          <div class="week-head">日&nbsp;&nbsp;一&nbsp;&nbsp;&nbsp;二&nbsp;&nbsp;&nbsp;三&nbsp;&nbsp;&nbsp;四&nbsp;&nbsp;&nbsp;五&nbsp;&nbsp;&nbsp;六
          </div>
          <div style="width:50px;height:375px;float:left">
            <div class="label1">
              <div>七月</div>
            </div>
            <div class="label2">
              <div>
                八月
              </div>
            </div>
            <div class="label2">
              <div>
                九月
              </div>
            </div>
          </div>
          <calendar-view :width="230" :height="370"></calendar-view>
        </Card>
        </Col>
      </Row>
      <Row>
        <Col span="24">
        <Card>
          <p slot="title">堆叠时钟图</p>
          <line-chart></line-chart>
        </Card>
        </Col>
      </Row>
      </Col>
      <Col span="13">
      <card>
        <p slot="title">群体行为分布地图</p>
        <menu-bar ></menu-bar>
        <hr/>
        <Tabs value="name1">
          <Tab-pane label="双模式地图" name="name1">
            <leaflet-map >
            </leaflet-map>
          </Tab-pane>
          <Tab-pane label="热力地图" name="name2">
            <leaflet-heat-map></leaflet-heat-map>
          </Tab-pane>
        </Tabs>
        <br/>
      </card>
      </Col>
      <Col span="6">
        <Row>
          <Col span="24">
          <card>
            <p slot="title">流量散点图</p>
            <scatter-plot></scatter-plot>
          </card>
          </Col>
        </Row>
        <Row>
          <Col span="24">
          <card>
            <p slot="title">年龄直方图</p>
            <bar-plot></bar-plot>
          </card>
          </Col>
        </Row>
      </Col>
    </Row>
  </div>
</template>
<script>
import LeafletMap from './components/LeafletMap.vue'
import LeafletHeatMap from './components/LeafletHeatMap.vue';
import CalendarView from './components/CalendarView.vue';
import LineChart from './components/LineChart.vue'
import ScatterPlot from './components/ScatterPlot.vue'
import BarPlot from './components/BarPlot.vue'
import MenuBar from './components/MenuBar.vue'
export default {
  name: 'app',
  data() {
    return {
    }
  },
  computed: {

  },
  methods: {

  },
  components: {
    LeafletMap,
    LeafletHeatMap,
    CalendarView,
    LineChart,
    ScatterPlot,
    BarPlot,
    MenuBar
  },
  created() {
  }
}

</script>
<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 11px;
}

.label1,
.label2 {
  display: flex;
  align-items: center;
  width: 50px;
  margin-left: 20px;
}

.label1 {
  height: 138px;
}

.label2 {
  height: 115px;
}

.label1>div,
.label2>div {
  font-family: 'Times New Roman', Times, serif;
  color: #000000;
  font-size: 20px;
}

.ivu-col {
  margin-bottom: 10px;
}

.ivu-card-head {
  background-color: #e3e8ee;
  height: 40px;
  padding: 0px 0px !important;
}

.ivu-card-head p {
  padding: 10px;
  height: 40px !important;
  line-height: 40px;
}

.week-head {
  width: 160px;
  position: relative;
  left: 91px;
}

.ivu-card-body {
  padding: 5px !important;
}

.slider {
  display: inline-block;
  width: 100px;
  height: 30px;
}

.week-num {
  height: 21px;
  width: 23px;
}

</style>
