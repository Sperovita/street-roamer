<template>
    <div class="location-selector-container">
        <div class="row g-3">
            <div class="col-12 col-lg-8">
                <label for="inputAddress" class="visually-hidden">Search</label>
                <input @keyup.enter="findLocation" v-model="address" type="text" class="form-control" id="inputAddress" placeholder="Search">
            </div>
            <div class="col-auto">
                <button type="button" class="btn btn-primary mb-3" @click="findLocation">Find Location</button>
            </div>
            
        </div>
        <div class="row">
            <div class="col-auto">
                <span v-if="latLng">Lat: {{ latLng.lat() }} Lng: {{ latLng.lng() }}</span>
            </div>
        </div>
        <div class="row">
            <div class="col-auto">
                <span class="small">{{ centeredOnStreetView ? 'Centered on Street' : 'No Street Found Near Center'}}</span>
            </div>
        </div>
        <div ref="map" class="gmap"></div>
    </div>
</template>
<script>
export default {
    name: "location-selector",
    props: {

    },
    data() {
        return {
            map: null,
            geocoder: null,
            zoom: 11,
            address: '',
            buffer: false,
            overflow: false,
            programmaticCentering: false,
        } 
    },
    methods: {
        async loadMap () {
            this.geocoder = new google.maps.Geocoder();
            this.map = new google.maps.Map(this.$refs.map, {
                zoom: this.zoom,
                streetViewControl: true,
                center: {lat: 40.654, lng: -73.808},
            })
            this.$store.commit('appStore/setStreetService', new google.maps.StreetViewService());
            this.$nextTick(() => {
                // Note: this triggers a decent amount of jumping around in here. Maybe refactor for cleaner code
                this.map.addListener('center_changed', () => {
                    if(!this.programmaticCentering){
                        this.updateBuffer();
                    }else{
                        this.programmaticCentering = false;
                    }
                })
                this.updateCenter();
            })
        },
        updateBuffer(){
            if(!this.buffer){
                this.buffer = true;
                setTimeout(() => {
                    this.buffer = false;
                    if(this.overflow){
                        this.overflow = false;
                        this.updateBuffer();
                    }else{
                        this.updateCenter()
                    }
                    
                }, 300)
            }else{
                this.overflow = true;
            }
        },
        updateCenter(){
            this.$store.dispatch('appStore/updateMapCenter', this.map.getCenter());
        },
        findLocation () {
            this.geocoder.geocode({ address: this.address }, (results, status) => {
                if(status == 'OK') {
                    this.map.setCenter(results[0].geometry.location);
                } else {
                    this.displayError(`Map Error: ${status}`);
                }
            })
        },
    },
    computed: {
        streetService() {
            return this.$store.getters['appStore/streetService'];
        },
        radius() {
            return this.$store.getters['appStore/radius'];
        },
        latLng() {
            return this.$store.getters['appStore/currentLatLng'];
        },
        centeredOnStreetView() {
            return this.$store.getters['appStore/centeredOnStreetView'];
        }
    },
    mounted() {
        if(typeof window.gmapsInitialized === 'undefined'){
            window.gmapsInitialized = false;
        }
        if(!window.gmapsInitialized){
            window.gmapsInitCallback = () => {
                console.log("Maps Initialized");
                window.gmapsInitialized = true;
                this.loadMap();
            };
            const script = document.createElement("script");
            script.async = true;
            script.defer = true;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${this.gmapsApiKey}&callback=gmapsInitCallback`;
            script.onerror = (error) => {
                console.error(error);
            };
            document.querySelector("head").appendChild(script);
        }
    },
    created() { 
    },
    watch: {
        latLng: function(newVal, oldVal) {
            const currentCenter = this.map.getCenter();
            if(currentCenter.lng() !== newVal.lng() && currentCenter.lat() !== newVal.lat()){
                this.programmaticCentering = true;
                this.map.setCenter(newVal);
            }
            
        }
    }
};
</script>
<style scoped>
.gmap {
    height:600px;
}
</style>
