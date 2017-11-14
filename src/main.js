//import Vue from 'vue'

import App from './App';
import store from './store';
import Vue from 'vue';
import iView from 'iview';
import 'iview/dist/styles/iview.css';
/* eslint-disable no-new */
Vue.use(iView);
new Vue({
  el: '#app',
  store,
  template: '<App/>',
  components: { App }
});
