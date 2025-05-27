const dns = require("node:dns");
const os = require("node:os");
const promisfy = require("node:util").promisify;

const dnsLookup = promisfy(dns.lookup);

class IP {
	static cache = null;

	static get(force = false) {
		if (cache && !force) {
			return Promise.resolve(cache);
		}
		return dnsLookup(os.hostname(), {family: 4}).then((addr) => {
			cache = addr;
			return addr;
		});
	}
}
module.exports = IP;
