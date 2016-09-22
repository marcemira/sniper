/* jshint esversion: 6 */
const notifier = require('./notifier.js'),
      settings = require("app-settings"),
      validate = require("./validate"),
      storage  = require('node-persist'),
      toNotify = [];

validate();

storage.init({
  dir: settings.storage.dir,
  logging: settings.storage.logging
});

doRequests = [
  require('./processors/lavoz.js')(toNotify),
  //require('./processors/alamaula')(toNotify)
];

Promise.all(doRequests).then(() => {
  if(toNotify.length){ 
    notifier(toNotify); 
  }
});
