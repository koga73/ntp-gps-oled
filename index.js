const Gpsd = require("./src/gpsd.js");
const Display = require("./src/display.js");

// Update at least every interval
const UPDATE_INTERVAL = 60000;
const TRY_MIN_INTERVAL = 1000;

let needsUpdate = true;
let lastUpdate = 0;

const display = new Display();
const gpsd = new Gpsd();

(function main() {
	gpsd.addEventListener(GPSD.EVENT.UPDATE, handler_gps_update);

	setInterval(() => {
		needsUpdate = true;
		tryUpdate();
	}, UPDATE_INTERVAL);
})();

function handler_gps_update(evt) {
	needsUpdate = true;
	tryUpdate();
}

function tryUpdate() {
	if (!needsUpdate) {
		return;
	}
	if (Date.now() - lastUpdate < TRY_MIN_INTERVAL) {
		return;
	}
	update();
}
function update() {
	needsUpdate = false;
	lastUpdate = Date.now();

	display.update(gpsd.data);
}
