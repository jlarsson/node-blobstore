/*jslint node:true*/
(function (module) {
    'use strict';

    var crypto = require('crypto'),
        classBuilder = require('ryoc');

    var Source = classBuilder()
        .construct(function (key, hash) {
            this.key = key;
            this.hash = hash || null;
        })
        .method('getKey', function () {
            return this.key;
        })
        .abstract('createReadStream')
        .method('getHash', function (callback) {
            if (this.hash) {
                return callback(null, this.hash);
            }
            var sha1 = crypto.createHash('sha256');
            sha1.setEncoding('hex');
            this.createReadStream()
                .on('error', callback)
                .on('end', function () {
                    sha1.end();
                    this.hash = sha1.read();
                    callback(null, this.hash);
                })
                .pipe(sha1);
        })
        .toClass();

    module.exports = Source;
})(module);