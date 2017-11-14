'use strict';
import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import mutations from './mutations';
Vue.use(Vuex);
const state = {
	stations:null,
	centroids:[],
	selectedCluster:null,
	stationGroup:null,
	selectedCentroid:-1,
	mapHighlight:-1,
	selectedDate:null,
	selectedPair:[],
	centroidColor:['#000000','#4C4C4C','#999999','#FFCC66','#800000','#804000','#808000','#408000' ,'#008000','#008040',
					'#008080','#004080','#000080','#400080','#800080','#800040','#FF0000','#FF66FF', '#FFFF00','#80FF00',
					'#00FF00','#00FF80','steelblue',/*#FF6666',*/'#BA5536','#0000FF','#8000FF','#FF00FF','#FF0080', /*'#66CCFF'*/'#FF6666','#336B87',
					'#FFFF66','#CCFF66','#66FF66','#66FFCC','#66FFFF','#00FFFF','#6666FF','#CC66FF', '#FF8000','#FF6FCF',
					'#F46142','#F4C542','#D4F442','#42F4AA','#42F4E8','#66A5AD','#CB42F4','#F442BC','#F44289','#F4425F'],
	
};
export default new Vuex.Store({
  state,
  actions,
  mutations
}); 