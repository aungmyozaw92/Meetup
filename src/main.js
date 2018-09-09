// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import * as firebase from 'firebase'
import router from './router'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import { store } from './store'
import DateFilter from './filters/date'
import AlertCmp from './components/Shared/Alert.vue'
import EditDialog from './components/Meetup/Edit/EditMeetupDetailsDialog.vue'

Vue.use(Vuetify)
Vue.config.productionTip = false

Vue.filter('date', DateFilter)

Vue.component('app-alert', AlertCmp)

Vue.component('app-edit-dialog', EditDialog)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>',
  created () {
  	firebase.initializeApp({
	    apiKey: "AIzaSyAl7mM6fIrdXKhXY1UDvAiJ0WC6y862i90",
	    authDomain: "meetup-b8d1b.firebaseapp.com",
	    databaseURL: "https://meetup-b8d1b.firebaseio.com",
	    projectId: "meetup-b8d1b",
	    storageBucket: "gs://meetup-b8d1b.appspot.com",
	    messagingSenderId: "34103965749"
   })
    firebase.auth().onAuthStateChanged((user)=> {
      if (user) {
        this.$store.dispatch('autoSignIn', user)
      }
    })
    this.$store.dispatch('loadMeetups')
  }
})
