/* jshint esversion: 6 */
const sh = require("shorthash"),
      moment = require('moment'),
      scrape = require('scrape'),
      storage = require('node-persist'),
      settings = require("app-settings");

module.exports = toNotify => {

  return new Promise( ( resolve, reject ) => {

    var toProcess = [],
        urls = settings.urls.lavoz;

    urls.forEach( url => {

      toProcess.push( new Promise( (requestResolve, requestReject ) => {

        scrape.request({ url, globoff: true }, ( err, $ ) => {
          
          if (err) { requestReject(err); }

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
                toProcess.push(storage.setItem(id, null));
              }
            });

          });

          requestResolve();

        });

      }));

    });

    Promise.all(toProcess).then(resolve);

  });

};