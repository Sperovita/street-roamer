// Inspired by google-panorama-equirectangular by mattdesl
// https://github.com/mattdesl/google-panorama-equirectangular
self.onmessage = function(e) {
    // At Zoom 4 it's 512x512 tiles
    // Sample Data that columns and rows calculation is based off of
    // y=8, x=16 (w=16384, h=8192) [WxH / 512] 16 x 32
    // y=7, x=13 (w=13312, h=6656) [WxH / 512] 13 x 26
    const { panoId, tiles } = e.data;
    const worldSize = tiles.worldSize;
    const tileSize = tiles.tileSize;
    const columns = Math.ceil((worldSize.height / tileSize.height) / 2);
    const rows = Math.ceil((worldSize.width / tileSize.width) / 2);
    const height = tileSize.height * columns;
    const width = tileSize.width * rows;
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('2d');

    if(!panoId){
        self.postMessage({message: `Missing Pano Id ${panoId}`, image: null, success: false});
        return;
    }

    context.clearRect(0, 0, width, height);

    const imageRequests = [];
    for (let x = 0; x < rows; x++) {
        for (let y = 0; y < columns; y++) {
            imageRequests.push(getTile(panoId, tiles , x, y, context));
        }
    }

    Promise.all(imageRequests).then(images => {
        canvas.convertToBlob().then(blob => {
            // Refactor: might be best to just pass the blob back now that we're going with three js, might be more performant
            const reader = new FileReader();
            reader.onload = function(e) {
                self.postMessage({message: 'Succesfully fetched panorama', image: e.target.result , success: true});
            }
            reader.readAsDataURL(blob);
        });
    }).catch(err => {
        console.log(err);
        self.postMessage({message: `Error fetching panorama ${panoId}`, image: null, success: false});
    })
}

// Note: canvas context is being modified by ref, should allow the draw operations to be in parallel as well
function getTile(panoId, tiles, x, y, context){
    return new Promise((resolve, reject) => {
        const tileWidth = tiles.tileSize.width;
        const tileHeight = tiles.tileSize.height;
        const url = `//geo0.ggpht.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&panoid=${panoId}&output=tile&x=${x}&y=${y}&zoom=4&nbt&fover=2`;
        
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.responseType = 'arraybuffer';
        xhr.onload = function(e) {
            const uInt8Array = new Uint8Array(this.response);
            const blob = new Blob([uInt8Array], {type: "image/png"});
            createImageBitmap(blob).then(img => {
                context.drawImage(img, tileWidth * x, tileHeight * y);
                resolve(img);
            }).catch(err => {
                console.log(err);
                reject();
            });
        }

        xhr.onerror = err => {
            console.log(err);
            reject();
        }

        xhr.send();
    })
}