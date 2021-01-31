import Noty from 'noty';
import '@popperjs/core';
import 'bootstrap';
import '@fortawesome/fontawesome-free/js/all';
import axios from 'axios';
import { createApp } from "vue";
import { createStore } from 'vuex'
import App from "./components/App.vue";
import LocationSelector from "./components/LocationSelector.vue";
import Cadence from "./components/Cadence.vue";
import XRScene from "./components/XRScene.vue";
import appStore from './stores/appStore';

window.roamerUtils = {
  displayAxiosError(axiosError) {
    let message = axiosError.message;
    if (typeof axiosError.response !== 'undefined' && typeof axiosError.response.data !== 'undefined' && typeof axiosError.response.data.message !== 'undefined') {
      message = axiosError.response.data.message;
    }
    this.displayError(message);
  },
  displayError(message) {
    new Noty({
      text: message,
      type: "error",
      theme: 'bootstrap-v4',
      timeout: '5000'
    }).show();
  },
  displaySuccess(message) {
    new Noty({
      text: message,
      type: "success",
      theme: 'bootstrap-v4',
      timeout: '3000'
    }).show();
  }
}

const store = createStore({
  modules: {
    appStore
  }
})

const app = createApp(App);
app.use(store)

app.component('xr-scene', XRScene);
app.component('cadence', Cadence);
app.component('location-selector', LocationSelector);


app.mixin({
  data() {
    return {
      gmapsApiKey: import.meta.env.SNOWPACK_PUBLIC_MAPS_API_KEY
    }
  },
  methods: {
    ...roamerUtils
  }
});

app.mount("#app");

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/#hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    app.unmount();
  });
}


