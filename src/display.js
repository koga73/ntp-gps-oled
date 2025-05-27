// https://github.com/noopkat/oled-js/
const five = require("johnny-five");
const Raspi = require("raspi-io").RaspiIO;
const Oled = require("oled-js");
const font = require("oled-font-5x7");

const DEFAULT_OLED_OPTIONS = {
	width: 128,
	height: 32,
	address: 0x3c
};

class Display {
	static DECIMAL_PRECISION = 6; // Number of decimal places
	static FONT_HEIGHT = 8; // Height of the font in pixels

	debug = false;
	board = null;
	oled = null;
	oled_options = {...DEFAULT_OLED_OPTIONS};

	constructor({debug = false, width = DEFAULT_OLED_OPTIONS.width, height = DEFAULT_OLED_OPTIONS.height, address = DEFAULT_OLED_OPTIONS.address, ...options} = {}) {
		this.debug = debug;
		this.oled_options = {
			width,
			height,
			address,
			...options
		};

		this.handler_board_ready = this.handler_board_ready.bind(this);

		const board = new five.Board({
			io: new Raspi()
		});
		board.on("ready", this.handler_board_ready);
		this.board = board;
	}

	destroy() {
		if (this.oled) {
			this.oled = null;
		}
		if (this.board) {
			board.off("ready", this.handler_board_ready);
			this.board = null;
		}
	}

	handler_board_ready() {
		if (this.debug) {
			console.log("Board is ready");
		}
		const oled = new Oled(this.board, five, this.oled_options);
		oled.clearDisplay();
		oled.update();
		this.oled = oled;
	}

	update({lat = 0, lon = 0, alt = 0, speed = 0, status = 0, time = 0, sats = 0, quality = 0, pps = 0}) {
		const {oled} = this;

		const now = new Date();
		const hoursStr = now.getHours().toString().padStart(2, "0");
		const minutesStr = now.getMinutes().toString().padStart(2, "0");

		const lines = [
			`SATS: ${sats} PPS: ${pps ? "Yes" : "No"}`,
			`LAT: ${lat.toFixed(Display.DECIMAL_PRECISION)}`,
			`LON: ${lon.toFixed(Display.DECIMAL_PRECISION)}`,
			`TIME: ${hoursStr}:${minutesStr}`
		];

		oled.clearDisplay();
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const y = i * Display.FONT_HEIGHT + 1;
			oled.setCursor(1, y);
			oled.writeString(font, 1, line, 1, false, 1, false);
		}
		oled.update();
	}
}
module.exports = Display;
