import Vue from 'vue';
import store from './components/Store';
import App from './App.vue';
import Vuelidate from 'vuelidate';

Vue.config.productionTip = false;

Vue.use(Vuelidate);

new Vue({
  store,
  render: h => h(App)
}).$mount("#booking-app");