<template>
    <div class="app-container">
        <h1>Street Roamer</h1>
        <hr>
        <div class="row">
            <div class="col-12 col-lg-6">
                <cadence></cadence>
                <hr class="my-4">
                <xr-scene></xr-scene>
            </div>
            <div class="col-12 col-lg-6">
                <location-selector></location-selector>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'app',
    data() {
        return {
            coords: {lat:'', lng:''}
        };
    },
    methods: {
        
    },
    mounted() {
        // navigator.xr.isSessionSupported('immersive-vr').then((session) => {console.log(session)})
    },
};
</script>

<style>
.app-container {
  text-align: center;
}
</style>
