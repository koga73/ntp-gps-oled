const dns = require("node:dns");
const os = require("node:os");
const promisfy = require("node:util").promisify;

const dnsLookup = promisfy(dns.lookup);

class IP {
	static cache = null;

	static get(force = false) {
		if (IP.cache && !force) {
			return Promise.resolve(IP.cache);
		}
		return dnsLookup(os.hostname(), {family: 4}).then(({address}) => {
			IP.cache = address;
			return address;
		});
	}
}
module.exports = IP;
