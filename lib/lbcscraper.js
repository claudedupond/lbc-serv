var fs = require('fs'),
    request = require('request'),
    cheerio = require('cheerio'),
    _this = this,
    requestJSON = require('request-json'),
    _advert = {},
    client = null;


var lbcscraper = function () {
    _this = this;
    global.timeOut = 120;
};

lbcscraper.prototype.run = function () {
    var interval = setInterval(function () {
        if (global.running && global.waitingList.length > 0) {
            _this.scrapOffre(global.waitingList.shift(), function (error, advert) {
                if (!error) {
                    if(global.server){
                        client = requestJSON.newClient(global.server);
                        client.post('save', advert, function (err, res, body) {
                            if (err) {
                                console.log(err);
                            }
                            else{
                                console.log(body);
                            }
                        });
                    }
                }
                global.count++;
                global.last = new Date().toString('T');
            });
        }
        else{
            clearInterval(interval);
            global.running = false;
        }
    }, global.timeOut * 1000);
};

lbcscraper.prototype.scrapOffre = function (ad, callback) {
    request(ad.options, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            var advert = _advert;
            advert.nom = _this.fullTrim($('div.upload_by').children('a').text());
            advert.prix = _this.fullTrim($('span.price').text());
            $('tr').each(function (i, element) {
                var th = this.children('th').text().trim();
                var td = _this.fullTrim(this.children('td').text());
                switch (th) {
                    case 'Ville :' :
                        advert.ville = td;
                        break;
                    case 'Code postal :' :
                        advert.codepostal = td;
                        break;
                    case 'Marque :' :
                        advert.marque = td;
                        break;
                    case 'Mod�le :' :
                        advert.modele = td;
                        break;
                    case 'Kilométrage :' :
                        advert.kilometrage = td;
                        break;
                    case 'Carburant :' :
                        advert.carburant = td;
                        break;
                    case 'Bo�te de vitesse :' :
                        advert.boitevitesse = td;
                        break;
                    case 'Année-mod�le :' :
                        advert.anneemodele = td;
                        break;
                }
            });
            advert.date = new Date().toString('T');
            //title
            advert.title = _this.fullTrim(ad.title);
            //description
            advert.description = _this.fullTrim($('div.content').text());
            //lien
            advert.lien = ad.options.url;
            //urgent
            advert.urgent = ad.urgent;
            //particulier
            advert.particulier = ad.particulier;

            //numero
            var reqLink = 'http://www2.leboncoin.fr/ajapi/get/phone?list_id=';
            var id = $('div.upload_by').children('a').attr('href').slice(39);
            reqLink += id;
            advert.numero = null;
            request({url: reqLink, port: 80, method: 'GET' }, function (error, response, html) {
                if (!error && response.statusCode == 200) {
                    if(html.length > 20){
                        var json = JSON.parse(html);
                        if (json.phoneUrl) {
                            advert.numero = json.phoneUrl;
                        }
                    }
                    else{
                        global.waitingList = [];
                        global.running = false;
                    }
                }
                callback(error, advert);
            });
        }
        else
            callback(error, null);
    });
};

lbcscraper.prototype.fullTrim = function(str){
    return str.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');
}

module.exports = lbcscraper;
