const {Board} = require("johnny-five");
const Raspi = require("raspi-io").RaspiIO;

const Gpsd = require("./src/gpsd.js");
const Display = require("./src/display.js");
const IP = require("./src/ip.js");

// Update at least every interval
const UPDATE_INTERVAL = 1000;
const TRY_MIN_INTERVAL = 1000;

let board = null;
let display = null;
let gpsd = null;

let needsUpdate = true;
let lastUpdate = 0;
let interval = 0;

(function main() {
	board = new Board({
		io: new Raspi()
	});
	board.on("ready", handler_board_ready);
})();

function destroy() {
	board.off("exit", destroy);
	board = null;

	clearInterval(interval);
	interval = 0;

	gpsd.removeEventListener(Gpsd.EVENT.UPDATE, handler_gps_update);
	gpsd.destroy();
	gpsd = null;

	display.destroy();
	display = null;

	process.exit();
}

function handler_board_ready() {
	board.off("ready", handler_board_ready);
	board.on("exit", destroy);

	display = new Display(board);

	gpsd = new Gpsd();
	gpsd.addEventListener(Gpsd.EVENT.UPDATE, handler_gps_update);

	interval = setInterval(() => {
		needsUpdate = true;
		tryUpdate();
	}, UPDATE_INTERVAL);
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
