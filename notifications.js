var settings = require("app-settings");

var api_key = settings.mailgun.appKey;
var domain  = settings.mailgun.domain;
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

var data = {
  from: settings.mailgun.from,
  to: settings.mailgun.to,
  subject: settings.mailgun.subject,
  html: text
};

mailgun.messages().send(data, function (error, body) {
  console.log(body);
});