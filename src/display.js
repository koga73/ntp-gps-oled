// https://github.com/noopkat/oled-js/
const five = require("johnny-five");
const Oled = require("oled-js");
const font = require("oled-font-5x7");

const DEFAULT_OLED_OPTIONS = {
	width: 128,
	height: 32,
	address: 0x3c
};

class Display {
	static DECIMAL_PRECISION = 3; // Number of decimal places

	static FONT_WIDTH = 5; // Height of the font in pixels
	static FONT_HEIGHT = 7; // Height of the font in pixels
	static FONT_LEADING = 3; // Padding between lines in pixels

	debug = false;
	oled = null;
	oled_options = {...DEFAULT_OLED_OPTIONS};

	constructor(board, {debug = false, width = DEFAULT_OLED_OPTIONS.width, height = DEFAULT_OLED_OPTIONS.height, address = DEFAULT_OLED_OPTIONS.address, ...options} = {}) {
		this.board = board;
		this.debug = debug;
		this.oled_options = {
			width,
			height,
			address,
			...options
		};

		this.destroy = this.destroy.bind(this);
		this.update = this.update.bind(this);

		const oled = new Oled(board, five, this.oled_options);
		oled.turnOnDisplay();
		oled.clearDisplay(false);
		oled.update();
		this.oled = oled;
	}

	destroy(turnOff = true) {
		const {oled} = this;
		if (oled) {
			if (turnOff) {
				oled.turnOffDisplay();
			}
			this.oled = null;
		}
	}

	update({lat = 0, lon = 0, alt = 0, speed = 0, status = 0, time = 0, sats = 0, quality = 0, pps = 0, ip = null}) {
		const {oled} = this;

		const satsStr = `SATS: ${sats}`;
		const ppsStr = `PPS: ${pps ? "YES" : "NO"}`;
		const satsPpsSpace = " ".repeat(Math.floor(this.oled_options.width / (Display.FONT_WIDTH + 2)) - (satsStr.length + ppsStr.length));

		/*
		const hasNegative = lat < 0 || lon < 0;
		const line2 = `LAT: ${hasNegative && lat >= 0 ? "" : ""}${lat.toFixed(Display.DECIMAL_PRECISION)}`;
		const line3 = `LON: ${hasNegative && lon >= 0 ? "" : ""}${lon.toFixed(Display.DECIMAL_PRECISION)}`;
		const latLon = `${lat.toFixed(Display.DECIMAL_PRECISION)} ${lon.toFixed(Display.DECIMAL_PRECISION)}`;
		*/

		const now = new Date();
		const monthStr = (now.getMonth() + 1).toString().padStart(2, "0");
		const dayStr = now.getDate().toString().padStart(2, "0");
		const yearStr = now.getFullYear().toString().slice(-2); // Last two digits of the year
		const hoursStr = now.getHours().toString().padStart(2, "0");
		const minutesStr = now.getMinutes().toString().padStart(2, "0");
		const secondsStr = now.getSeconds().toString().padStart(2, "0");

		const lines = [`${satsStr}${satsPpsSpace}${ppsStr}`, `${monthStr}-${dayStr}-${yearStr} ${hoursStr}:${minutesStr}:${secondsStr}`, ip ? ip : "IP: N/A"];

		oled.clearDisplay(false);
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const y = i * (Display.FONT_HEIGHT + Display.FONT_LEADING);
			oled.setCursor(0, y);
			oled.writeString(font, 1, line, 1, false, 0, false);
		}
		oled.update();
	}
}
module.exports = Display;
