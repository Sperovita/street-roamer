<template>
    <div class="xr-scene-container">
        <button class="btn btn-info" type="button" @click="launch">Launch VR Scene</button>
        <div class="scene-container mt-3" v-if="loaded">
            <!-- TODO: Was trying AFrame here, some issues in chrome with valve index, looking to go with just three JS, impliment three js -->
            <span v-if="!currentImage">Loading Image..</span>
            <img v-else :src="currentImage" width="400" height="200" />
        </div>        
    </div>
</template>

<script>
export default {
    name: 'xr-scene',
    props: {
        coords: {
            type: Object
        }
    },
    data() {
        return {
            loaded: false,
            size: '1024x2048',
            radius: 50,
            skySrc: ''
        };
    },
    methods: {
        launch(){
            if(typeof google === 'undefined'){
                this.displayError('Google maps not loaded yet, please wait or reload')
                return;
            }
            this.loaded = true;
            this.$store.dispatch('appStore/activateVR');
        },
    },
    computed: {
        currentImage() {
            return this.$store.getters['appStore/currentImage'];
        }
    },
    mounted() {
        
    },
};
</script>

<style>
.scene-container {
    height: 450px;
    width: 100%;
}
</style>
