import Vue from 'vue'
import Vuex from 'vuex'

import * as firebase from 'firebase'

Vue.use(Vuex)

export const store = new Vuex.Store({
	state: {
		loadedMeetups:[
		{ 
            imageUrl: 'https://cdn.pixabay.com/photo/2014/05/02/23/46/new-york-city-336475_960_720.jpg', 
            id: 'dfsdfsdf889', 
            title: 'Meetup In Yangon ',
            date: new Date(),
            location: 'Yanogn Meetup',
            description: 'Yangon Mweekjlsa lasdfj dsfjl'
         },
         { 
            imageUrl: 'https://thumb7.shutterstock.com/display_pic_with_logo/1336324/741225427/stock-photo-aerial-shot-view-from-the-drone-on-the-road-junction-and-city-of-yangon-near-rangoon-river-at-741225427.jpg',
            id: 'adfssdfff8897', 
            title: 'Meetup In Mandalay ',
            date: new Date(),
            location: 'Mandalay Meetup',
            description: 'Mandalay Mweekjlsa lasdfj dsfjl'
         }
        ],
        user: null,
        loading: false,
        error: null
	},
	mutations: {
		setLoadedMeetups (state, payload) {
			state.loadedMeetups = payload
		},
		createMeetup(state, payload) {
			state.loadedMeetups.push(payload)
		},
		updateMeetup(state, payload) {
			const meetup = state.loadedMeetups.find(meetup => {
				return meetup.id === payload.id
			})
			if (payload.title) {
				meetup.title = payload.title
			}
			if (payload.description) {
				meetup.description = payload.description
			}
			if (payload.date) {
				meetup.date = payload.date
			}
		},
		setUser(state, payload){
			state.user = payload
		},
		setLoading (state, payload) {
			state.loading = payload
		},
		setError (state, payload) {
			state.error = payload
		},
		clearError (state, payload) {
			state.error = null
		}
	},
	actions: {
		loadMeetups({commit}) {
			commit('setLoading', true)
			firebase.database().ref('meetups').once('value')
			.then((data) => {
				const meetups = []
				const obj = data.val()
				for (let key in obj){
					meetups.push({
						id: key,
						title: obj[key].title,
						description: obj[key].description,
						imageUrl: obj[key].imageUrl,
						date: obj[key].date,
						location: obj[key].location,
						creatorId: obj[key].creatorId
					})
				}
				commit('setLoadedMeetups',meetups)
				commit('setLoading', false)
			})
			.catch(
				(error) => {
					console.log(error)
					commit('setLoading', true)
				}
			)
		},
		createMeetup ({commit, getters}, payload) {
	      const meetup = {
	        title: payload.title,
	        location: payload.location,
	        description: payload.description,
	        date: payload.date.toISOString(),
	        creatorId: getters.user.id
	      }
	      let imageUrl
	      let key
	      firebase.database().ref('meetups').push(meetup)
	        .then((data) => {
	          key = data.key
	          return key
	        })
	        .then(key => {
	          const filename = payload.image.name
	          const ext = filename.slice(filename.lastIndexOf('.'))
	          return firebase.storage().ref('meetups/' + key + '.' + ext).put(payload.image)
	        })
	        .then(fileData => {
	          imageUrl = fileData.metadata.downloadURLs[0]
	          return firebase.database().ref('meetups').child(key).update({imageUrl: imageUrl})
	        })
	        .then(() => {
	          commit('createMeetup', {
	            ...meetup,
	            imageUrl: imageUrl,
	            id: key
	          })
	        })
	        .catch((error) => {
	          console.log(error)
	        })
	      // Reach out to firebase and store it
	    },
	    updateMeetupData ({commit}, payload) {
	    	commit('setLoading', true)
	    	const  updateObj = {}
	    	if (payload.title) {
	    		updateObj.title = payload.title
	    	}
	    	if (payload.date) {
	    		updateObj.date = payload.date
	    	}
	    	if (payload.description) {
	    		updateObj.description = payload.description
	    	}
	    	firebase.database().ref('meetups').child(payload.id).update(updateObj)
	    	.then(()=>{
	    		commit('setLoading', false)
	    		commit('updateMeetup', payload)
	    	}).catch(error => {
	    		console.log(error)
	    		commit('setLoading', false)
	    	})
	    },
		signUserUp ({commit},payload) {
			commit('setLoading', true)
			commit('clearError')
			firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
			.then(
				user => {
					commit('setLoading', false)
					const newUser = {
						id: user.uid,
						registeredMeetups: []
					}
					commit('setUser',newUser)
				}
			).catch(error => {
				commit('setLoading', false)
				commit('setError', error)
				console.log(error)
			})
		},
		signUserIn ({commit}, payload) {
			commit('setLoading', true)
			commit('clearError')
			firebase.auth().signInWithEmailAndPassword(payload.email, payload.password).then(
				user => {
					commit('setLoading', false)
					const newUser = {
						id: user.id,
						registeredMeetups: []
					}
					commit('setUser', newUser)
				}
			).catch(error => {
				commit('setLoading', false)
				commit('setError', error)
				console.log(error)
			})
		},
		autoSignIn ({commit}, payload) {
			commit('setUser', {id: payload.uid, registeredMeetups: [] })
		},
		logout ({commit}) {
			firebase.auth().signOut()
			commit('setUser', null)
		},
		clearError ({commit}) {
			commit('clearError')
		}
	},
	getters: {
		loadedMeetups (state) {
			return state.loadedMeetups.sort((meetupA, meetupB)=>{
				return meetupA.date > meetupB.date
			})
		},
		featuredMeetups(state , getters) {
			return getters.loadedMeetups.slice(0,5)
		},
		loadedMeetup(state) {
			return(meetupId) => {
				return state.loadedMeetups.find((meetup) => {
					return meetup.id === meetupId
				})
			}
		},
		user (state) {
			return state.user
		},
		loading (state) {
			return state.loading
		},
		error (state) {
			return state.error
		}
	}
})