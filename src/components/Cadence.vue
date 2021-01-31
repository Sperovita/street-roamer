<template>
    <div class="cadence-container">
        <h3>Cycles <!-- <span :class="connectedClass"><i class="fas fa-plug"></i></span>--></h3>
        <div v-if="monitor" class="display-1">
            {{ cycles }}
        </div>
        <div v-else>
            Not Connected<br>
            <button type="button" class="btn btn-primary" @click="connectDevice">Connect Cadence Bluetooth</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'cadence',
    data() {
        return {
            monitor: null,
            cycles: 0,
            cadenceVal: -1,
        };
    },
    methods: {
        connectDevice() {
            if(typeof navigator.bluetooth === 'undefined'){
                this.displayError("Your browser does not support bluetooth connections, try the latest Chrome");
                return;
            }
            const options = {
                filters: [{ services: ['cycling_speed_and_cadence'] }]
            }
            // Note: setup using the Magene S3+ Cycling Cadence / Speed Sensor in Cadence Mode. Not sure if any others will work.
            navigator.bluetooth.requestDevice(options).then(device => {
                device.gatt.connect()
                    .then(gattServer => gattServer.getPrimaryService('cycling_speed_and_cadence'))
                    .then(service => service.getCharacteristic('00002a5b-0000-1000-8000-00805f9b34fb'))
                    .then(characteristic => characteristic.startNotifications())
                    .then(characteristic => {
                        characteristic.addEventListener('characteristicvaluechanged', (event) => {
                            this.monitor = event.target.value;
                            const newCadenceVal = this.monitor.getUint8(1);
                            if(this.cadenceVal > -1 && newCadenceVal !== this.cadenceVal){
                                this.cycles++;
                            }
                            this.cadenceVal = newCadenceVal;
                            
                        })
                    })
            }).catch(err => {
                this.displayError(err);
            })
        }
    },
    computed: {
        connectedClass() {
            if(this.monitor){
                return 'text-success';
            }else{
                return 'text-danger';
            }
        }
    },
    mounted() {
    },
};
</script>

<style>

</style>
