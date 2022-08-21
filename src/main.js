import Vue from 'vue'
import App from './App.vue'
import router from './router.js'
import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);
Vue.config.productionTip = false


const vueInstance = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')


window.showMenu = async function (...args) {
  return vueInstance.$children[0].$refs.context_menu.show(...args);//返回一个promise
};


window.getAppInstance = function () {
  return vueInstance.$children[0]
};
