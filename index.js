const five = require('johnny-five');
const Raspi = require("raspi-io").RaspiIO;
const Oled = require('oled-js');
const font = require('oled-font-5x7');

//GPS
/*
const Gpsd = require('node-gpsd-client')
const client = new Gpsd({
  port: 2947,              // default
  hostname: 'localhost',   // default
  parse: true
})
client.on('connected', () => {
  console.log('Gpsd connected')
  client.watch({
    //class: 'WATCH',
    json: true,
    //scaled: true
  })
})
client.on('error', err => {
  console.log(`Gpsd error: ${err.message}`)
})
//SKY, TPV
//https://gpsd.gitlab.io/gpsd/gpsd_json.html
client.on('PPS', data => {
  console.log(data)
})
client.connect();
*/

//OLED
const board = new five.Board({
  io: new Raspi()
});
board.on('ready', () => {
  console.log('Ready');

  const opts = {
    width: 128,
    height: 32,
    address: 0x3C
  };

  const oled = new Oled(board, five, opts);
  oled.clearDisplay();
  oled.setCursor(1, 1);
  oled.writeString(font, 1, "Hello World", 1, false, 1);
  oled.update();
});
