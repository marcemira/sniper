/* jshint esversion: 6 */
const notifier = require('./notifier.js'),
      storage  = require('node-persist'),
      toNotify = [];

storage.init();

doRequests = [
  require('./processors/lavoz.js')(toNotify),
  //require('./processors/alamaula')(toNotify)
];

Promise.all(doRequests).then(() => {
  if(toNotify.length){ 
    notifier(toNotify); 
  }
});
