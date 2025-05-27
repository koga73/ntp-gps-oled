const Gpsd = require("./src/gpsd.js");
const Display = require("./src/display.js");
const IP = require("./src/ip.js");

// Update at least every interval
const UPDATE_INTERVAL = 1000;
const TRY_MIN_INTERVAL = 1000;

let needsUpdate = true;
let lastUpdate = 0;
let interval = 0;

const display = new Display();
const gpsd = new Gpsd();

(function main() {
	// Exit gracefully on Ctrl+C
	process.stdin.resume();
	process.on("SIGINT", destroy);

	gpsd.addEventListener(Gpsd.EVENT.UPDATE, handler_gps_update);

	interval = setInterval(() => {
		needsUpdate = true;
		tryUpdate();
	}, UPDATE_INTERVAL);
})();

function destroy() {
	clearInterval(interval);
	interval = 0;

	gpsd.removeEventListener(Gpsd.EVENT.UPDATE, handler_gps_update);
	gpsd.destroy();
	gpsd = null;

	display.destroy();
	display = null;

	process.exit();
}

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
async function update() {
	needsUpdate = false;
	lastUpdate = Date.now();

	const ip = await IP.get();
	display.update({...gpsd.data, ip});
}
