/* jshint esversion: 6 */
const fs = require('fs'),
      storage = require('node-persist'),
      settings = require("app-settings"),
      handlebars = require('handlebars'),
      mailcomposer = require('mailcomposer'),
      emailHtml = fs.readFileSync('./templates/email.html', 'utf8'),
      emailBody = fs.readFileSync('./templates/body.hbs', 'utf8');

module.exports = toNotify => {

  toNotify = toNotify.sort( (a, b) => {
    return b.momentDate - a.momentDate;
  });

  // Prepare and compile email html
  var template = handlebars.compile(emailBody);
  var html = emailHtml.replace("{{ body }}", template({ items: toNotify }));

  var mailgun = require('mailgun-js')({
    apiKey: settings.mailgun.appKey,
    domain: settings.mailgun.domain
  });

  var mail = mailcomposer({
    from: settings.mailgun.from,
    to: settings.mailgun.to,
    subject: settings.mailgun.subject,
    body: 'Nuevos avisos!',
    html
  });

  mail.build((mailBuildError, message) => {

      var dataToSend = {
          to: settings.mailgun.to,
          message: message.toString('ascii')
      };

      mailgun.messages().sendMime(dataToSend, function (sendError, body) {
          if (sendError) return console.error(sendError);
      });
  });

};
