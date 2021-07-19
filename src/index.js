
import './etftse.scss';
import Vue from 'vue';
import App from './app.vue';

class Stats {
  constructor(el, srcPath) {
    this.vueApp = new Vue({
      el: el,
      render: h => h(App, {props: {srcPath}}),
      methods: {
      },
    });
  }
}

window.ETFTSE = Stats;
