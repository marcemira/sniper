/* jshint esversion: 6 */
var fs = require('fs'),
    sh = require("shorthash"),
    moment = require('moment'),
    scrape = require('scrape'),
    storage = require('node-persist'),
    settings = require("app-settings"),
    handlebars = require('handlebars'),
    mailcomposer = require('mailcomposer');

var emailHtml = fs.readFileSync('./templates/email.html', 'utf8');
var emailBody = fs.readFileSync('./templates/body.hbs', 'utf8');

var toNotify = [];

storage.init();

var doRequests = new Promise( ( resolve, reject ) => {

  var toProcess = [];

  settings.urls.forEach( url => {

    toProcess.push( new Promise( (requestResolve, requestReject ) => {

      scrape.request({ url, globoff: true }, ( err, $ ) => {
        
        if (err) {
          return console.error(err);
          requestReject();
        }

        $('.BoxResultado').each(box => {

          var data = {
            link:  box.find('.Left .foto a')[0].attribs.href,
            src:   box.find('.Left .foto a img')[0].attribs.src,
            title: box.find('.Info .Modelo h3 a').first().text,
            desc:  box.find('.Descripcion p').first().text,
            price: box.find('.Info .Left .cifra').first().text,
            date:  box.find('.pie-aviso-teaser').first().text,
          };

          data.momentDate = moment(data.date.replace('Publicado: ', ''), 'DD.MM.YYYY');

          var id = sh.unique(data.title);

          storage.getItem(id).then(value => {
            if(!value){
              toNotify.push(data);
              toProcess.push(storage.setItem(id, data));
            }
          });

        });

        requestResolve();

      });

    }));

  });

  Promise.all(toProcess).then(resolve);

});

doRequests.then(() => {
  if(toNotify.length){

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

  }
});