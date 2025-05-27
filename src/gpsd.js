// https://github.com/ardhi/node-gpsd-client
const GpsdClient = require("node-gpsd-client");

// Get data from GPSD and summarize it
class Gpsd extends EventTarget {
	static EVENT = {
		CONNECTED: "connected",
		ERROR: "error",
		TPV: "tpv",
		SKY: "sky",
		PPS: "pps",
		UPDATE: "update"
	};
	static STATUS = {
		UNKNOWN: 0,
		NORMAL: 1,
		DGPS: 2,
		RTK_FIXED: 3,
		RTK_FLOATING: 4,
		DR: 5,
		GNSSDR: 6,
		TIME: 7,
		SIMULATED: 8,
		P_Y: 9
	};
	static QUALITY = {
		NO_SIGNAL: 0,
		SEARCHING: 1,
		AQUIRED: 2,
		UNUSABLE: 3,
		LOCKED_1: 4, // Code locked and time synchronized
		LOCKED_2: 5, // Code and carrier locked and time synchronized
		LOCKED_3: 6, // Code and carrier locked, time synchronized
		LOCKED_4: 7 // Code and carrier locked, time synchronized
	};

	debug = false;
	client = null;
	data = {
		lat: 0,
		lon: 0,
		alt: 0,
		speed: 0,
		status: 0,
		time: 0,
		sats: 0,
		quality: 0,
		pps: 0
	};

	constructor({debug = false, port = 2947, hostname = "localhost", parse = true, ...options} = {}) {
		super();

		this.debug = debug;

		this.handler_connected = this.handler_connected.bind(this);
		this.handler_error = this.handler_error.bind(this);
		this.handler_tpv = this.handler_tpv.bind(this);
		this.handler_sky = this.handler_sky.bind(this);
		this.handler_pps = this.handler_pps.bind(this);

		const client = new GpsdClient({
			port,
			hostname,
			parse,
			...options
		});
		client.on("connected", this.handler_connected);
		client.on("error", this.handler_error);
		client.on("TPV", this.handler_tpv);
		client.on("SKY", this.handler_sky);
		client.on("PPS", this.handler_pps);
		client.connect();

		this.client = client;
	}

	destroy() {
		const {client} = this;
		if (client) {
			client.removeListener("connected", this.handler_connected);
			client.removeListener("error", this.handler_error);
			client.removeListener("TPV", this.handler_tpv);
			client.removeListener("SKY", this.handler_sky);
			client.removeListener("PPS", this.handler_pps);
			client.unwatch();
			client.disconnect();
		}
		this.client = null;
	}

	handler_connected() {
		if (this.debug) {
			console.log("GPSD Connected");
		}

		const {client} = this;
		client.watch({
			class: "WATCH",
			json: true,
			scaled: true
		});

		this.dispatchEvent(new CustomEvent(Gpsd.EVENT.CONNECTED));
	}

	handler_error(err) {
		if (this.debug) {
			console.error("GPSD Error", err);
		}
		this.dispatchEvent(new CustomEvent(Gpsd.EVENT.ERROR, {detail: err}));
	}

	// time-position-velocity
	// https://Gpsd.gitlab.io/gpsd/gpsd_json.html#_tpv
	handler_tpv(data) {
		if (this.debug) {
			console.log("TPV:", data);
		}
		const {lat, lon, altHAE: alt, speed, status, time} = data;

		let didUpdate = false;
		const oldData = this.data;
		const newData = {...oldData};
		if (lat && lat !== oldData.lat) {
			newData.lat = lat;
			didUpdate = true;
		}
		if (lon && lon !== oldData.lon) {
			newData.lon = lon;
			didUpdate = true;
		}
		if (alt && alt !== oldData.alt) {
			newData.alt = alt;
			didUpdate = true;
		}
		if (speed && speed !== oldData.speed) {
			newData.speed = speed;
			didUpdate = true;
		}
		if (status && status !== oldData.status) {
			newData.status = status;
			didUpdate = true;
		}
		if (time && time !== oldData.time) {
			newData.time = time;
			didUpdate = true;
		}

		if (didUpdate) {
			this.data = newData;
			this.dispatchEvent(new CustomEvent(Gpsd.EVENT.UPDATE, {detail: this.data}));
		}
		this.dispatchEvent(new CustomEvent(Gpsd.EVENT.TPV, {detail: data}));
	}

	// sky view of the GPS satellite positions
	// https://Gpsd.gitlab.io/gpsd/gpsd_json.html#_sky
	handler_sky(data) {
		if (this.debug) {
			console.log("SKY:", data);
		}
		const {uSat: sats, qual: quality} = data;

		let didUpdate = false;
		const oldData = this.data;
		const newData = {...oldData};
		if (sats && sats !== oldData.sats) {
			newData.sats = sats;
			didUpdate = true;
		}
		if (quality && quality !== oldData.quality) {
			newData.quality = quality;
			didUpdate = true;
		}

		if (didUpdate) {
			this.data = newData;
			this.dispatchEvent(new CustomEvent(Gpsd.EVENT.UPDATE, {detail: this.data}));
		}
		this.dispatchEvent(new CustomEvent(Gpsd.EVENT.SKY, {detail: data}));
	}

	// pulse per second signal
	// https://Gpsd.gitlab.io/gpsd/gpsd_json.html#_pps
	handler_pps(data) {
		if (this.debug) {
			console.log("PPS:", data);
		}
		const {realSec: pps} = data;

		let didUpdate = false;
		const oldData = this.data;
		const newData = {...oldData};
		if (pps && pps !== oldData.pps) {
			newData.pps = pps;
			didUpdate = true;
		}

		if (didUpdate) {
			this.data = newData;
			this.dispatchEvent(new CustomEvent(Gpsd.EVENT.UPDATE, {detail: this.data}));
		}
		this.dispatchEvent(new CustomEvent(Gpsd.EVENT.PPS, {detail: data}));
	}
}
module.exports = Gpsd;
