<template>
  <div id="menu-bar" style="height:50px">
    <span style="float:left;margin:10px">
                <label>自行车站点图层</label>
                <i-switch @on-change="switchStationLayer" v-model="showStationLayer">layer</i-switch>
              </span>
    <span style="float:left;margin:10px">
                <label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;聚类中心点图层</label>
                <i-switch @on-change="switchCentroidLayer" v-model="showCentroidLayer">layer</i-switch>
              </span>
    <span style="float:left;margin:3px">
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <Icon type="flag" color="blue" size="25"/>
                &nbsp;&nbsp;
                <Slider class="slider" v-model="srcSlider.num" :max="srcSlider.max" @on-input="setSrcNum"></Slider>
              </span>
    <span style="float:left;margin:3px">
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <Icon type="flag" color="red" size="25"/>
                &nbsp;&nbsp;
                <Slider class="slider" v-model="desSlider.num" :max="desSlider.max" @on-input="setDesNum"></Slider>
                &nbsp;&nbsp;&nbsp;&nbsp;
              </span>
    <span style="float:left;margin-top:8px">
                <Select v-model="mode" style="width:80px;">
                  <Option v-for="item in modeList" :value="item.value" :key="item">{{ item.label }}</Option>
                </Select>
                 <Input-number :max="24" :min="0" v-model="startHour" style="width:50px"></Input-number>
                 <span style="width:50px">点</span>
    <b>~</b>
    <Input-number :max="24" :min="0" v-model="endHour" style="width:50px"></Input-number>点
    <Button type="primary" shape="circle" icon="ios-search" size="small" @click="setModeAndHour"></Button>
    </span>
  </div>
</template>
<script type="text/javascript">
import bus from '../lib/js/eventBus.js'
export default {
  data() {
    return {
      showCentroidLayer: true,
      showStationLayer: false,
      srcSlider: {
        num: 0,
        max: 0
      },
      desSlider: {
        num: 0,
        max: 0
      },
      modeList: [{ value: 'weekday', label: '工作日' }, { value: 'weekend', label: '周末' }],
      mode: '',
      startHour: 0,
      endHour: 0
    }
  },
  methods: {
    switchStationLayer(status) {
      bus.$emit("switchStationLayer", status)
    },
    switchCentroidLayer(status) {
      bus.$emit("switchCentroidLayer", status)
    },
    setModeAndHour() {
      let mode = this.mode,
        startHour = this.startHour,
        endHour = this.endHour
      bus.$emit('selectFlowsByModeAndHour', { mode, startHour, endHour })
    },
    setSrcNum(val) {
      bus.$emit('filterFlowsBySlider', {type:'Src',threshold:val})
    },
    setDesNum(val) {
      bus.$emit('filterFlowsBySlider',{type:'Des',threshold:val})
    }
  },
  created() {
  	let vm=this
    bus.$on('switchCentroidLayer',status => this.showCentroidLayer = status)

    bus.$on('setSlider',function(sliderInfo){
    	if(sliderInfo.type==="src")
    		vm.srcSlider={max:sliderInfo.max,num:sliderInfo.num}
    	else
    		vm.desSlider={max:sliderInfo.max,num:sliderInfo.num}
    })
  },
  mounted() {
  }
}

</script>
