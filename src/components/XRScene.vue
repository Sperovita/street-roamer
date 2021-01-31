<template>
    <div class="xr-scene-container">
        <button class="btn btn-info" type="button" @click="launch">Launch VR Scene</button>
        <div ref="sceneContainer" class="scene-container d-flex justify-content-center mt-3" v-show="loaded">
            <!-- TODO: Was trying AFrame here, some issues in chrome with valve index, looking to go with just three JS, impliment three js -->
            <!-- <span v-if="!currentImage">Loading Image..</span>
            <img v-else :src="currentImage" width="400" height="200" /> -->
        </div>   
    </div>
</template>

<script>
let scene, camera, renderer, sphere, textureLoader;
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
            this.initThree();
        },
        initThree(){
            const container = this.$refs.sceneContainer;

            const clock = new THREE.Clock();

            scene = new THREE.Scene();
            scene.background = new THREE.Color( 0x101010 );

            const light = new THREE.AmbientLight( 0xffffff, 1 );
            scene.add(light);

            camera = new THREE.PerspectiveCamera(70, 2, 1, 2000);
            scene.add(camera);

            // Create the panoramic sphere geometery
            const panoSphereGeo = new THREE.SphereGeometry(6, 256, 256);

            // Create the panoramic sphere material
            const panoSphereMat = new THREE.MeshStandardMaterial({
                side: THREE.BackSide,
                displacementScale: - 4.0
            });

            // Create the panoramic sphere mesh
            sphere = new THREE.Mesh(panoSphereGeo, panoSphereMat);

            // Load and assign the texture and depth map
            const manager = new THREE.LoadingManager();
            textureLoader = new THREE.TextureLoader(manager);

            // On load complete add the panoramic sphere to the scene
            manager.onLoad = () => {
                scene.add(sphere);
            };

            renderer = new THREE.WebGLRenderer();
            renderer.setSize(600,300);
            renderer.xr.enabled = true;
            renderer.xr.setReferenceSpaceType('local');
            container.appendChild(renderer.domElement);

            const vrButtonEl = VRButton.createButton(renderer);
            vrButtonEl.style.background = "rgba(0, 0, 0, 0.8)";
            document.body.appendChild(vrButtonEl);
            
            renderer.setAnimationLoop(() => {
                renderer.render(scene, camera);
            });
        },
    },
    computed: {
        currentImage() {
            return this.$store.getters['appStore/currentImage'];
        }
    },
    mounted() {
        
    },
    watch: {
        currentImage: function(newVal, oldVal) {
            if(newVal){
                textureLoader.load(newVal, texture => {
                    sphere.material.map = texture;
                });
            }            
        }
    }
};
</script>

<style>
.scene-container {
    
}
</style>
