export default {
    namespaced: true,
    state: () => ({
        streetService: null,
        radius: 2000,
        centeredOnStreetView: false,
        currentPanoId: '',
        panos: {},
        panoIter: 0,
        vrSceneActive: false,
    }),
    mutations: { 
        setStreetService(state, streetService){
            state.streetService = streetService;
        },
        setRadius(state, radius){
            state.radius = radius;
        },
        setCenteredOnStreetView(state, centeredOnStreetView){
            state.centeredOnStreetView = centeredOnStreetView;
        },
        updatePano(state, {id, info = null, image = null }){
            // Refactor: doing a bit much, also would rather mutate, though vue 3 doesn't have Vue.set
            const iter = state.panoIter + 1;
            const panos = state.panos;
            if(id in state.panos){
                if(info === null) info = panos[id].info;
                if(image === null) image = panos[id].image;
            }
            panos[id] = { id, info, image, iter }
            state.panos = panos;
            state.panoIter++;
        },
        setCurrentPanoId(state, id){
            state.currentPanoId = id;
        },
        setVrSceneActive(state, active){
            state.vrSceneActive = active;
        }

    },
    actions: { 
        // Refactor: Pano/info naming confusing, reorganize/rename data structure
        activateVR({commit, getters, dispatch}){
            if(!getters.currentPano){
                roamerUtils.displayError('Map must be centered on a location to start VR');
                return;
            }

            if(!getters.currentImage){
                console.log(getters.currentPano);
                dispatch('fetchPanoImage', getters.currentPano);
            }
            dispatch('panoCrawlFetch', getters.currentPano);
            commit('setVrSceneActive', true);
        },
        updateMapCenter({ state, commit, getters, dispatch }, latLng){
            getters.streetService.getPanoramaByLocation(latLng , getters.radius, (result, status) => {
                if(status == 'OK'){
                    console.log(result);
                    const panoId = result.location.pano;
                    commit('setCurrentPanoId', panoId);
                    commit('setCenteredOnStreetView', true);
                    if(!getters.findPano(panoId)){
                        const pano = { id: panoId, info: result };
                        commit('updatePano', pano);
                        if(state.vrSceneActive){
                            dispatch('fetchPanoImage', pano);
                            console.log('panoCrawlonCenter');
                            dispatch('panoCrawlFetch', pano);
                        }
                    }

                }else{
                    commit('setCenteredOnStreetView', false);
                }
            })
        },
        panoCrawlFetch({ state, commit, getters, dispatch }, pano){
            pano.info.links.forEach(link => {
                if(!getters.findPano(link.pano)){
                    dispatch('fetchPano', link.pano);
                }
            });
        },
        fetchPanoImage({state, commit}, pano){
            if(!window.Worker){
                roamerUtils.displayError('Browser does not support web workers. Try the latest Chrome.');
                return;
            }
            const fetchPanoWorker = new Worker('pano-worker.js');
            fetchPanoWorker.onmessage = e => {
                const response = e.data;
                if(response.success){
                    console.log(`Image for ${pano.id} fetched`);
                    commit('updatePano', { id: pano.id, image: response.image })
                }else{
                    console.log(response.message);
                }
                fetchPanoWorker.terminate();
            }
            const panoId = pano.id;
            const tiles = JSON.parse(JSON.stringify(pano.info.tiles));
            fetchPanoWorker.postMessage({ panoId, tiles });
        },
        fetchPano({ state, commit, dispatch }, panoId){
            state.streetService.getPanoramaById(panoId, (result, status) => {
                if(status == 'OK'){
                    const pano = { id: panoId, info: result };
                    commit('updatePano', pano);
                    dispatch('fetchPanoImage', pano);
                }
            })
        }
    },
    getters: {
        findPano(state) {
            return panoId => (panoId in state.panos) ? state.panos[panoId] : null;
        },
        currentPano(state) { return state.currentPanoId ? state.panos[state.currentPanoId] : null },
        currentLocation(state, getters){ return getters.currentPano ? getters.currentPano.info.location : null },
        currentLatLng(state, getters) { return getters.currentLocation ? getters.currentLocation.latLng : null },
        currentPanoId(state) { return state.currentPanoId },
        currentImage(state, getters) { return getters.currentPano ? getters.currentPano.image : null },
        currentLinks(state, getters) { return getters.currentPano ? getters.currentPano.info.links : [] },
        streetService(state) { return state.streetService },
        radius(state) { return state.radius },
        centeredOnStreetView(state) { return state.centeredOnStreetView },
        vrSceneActive(state) { return state.vrSceneActive }
    }
}