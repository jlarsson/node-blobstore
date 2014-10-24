/*jslint node:true*/
(function (module) {
    'use strict';

    var crypto = require('crypto'),
        classBuilder = require('ryoc');

    var Source = classBuilder()
        .construct(function (hash) {
            this.hash = hash || null;
        })
        .abstract('createPipeable' /*, function (){}*/)
        .method('getHash', function (callback) {
            if (this.hash) {
                return callback(null, this.hash);
            }
            var sha1 = crypto.createHash('sha256');
            sha1.setEncoding('hex');
            this.createPipeable().pipe(sha1)
                .on('error', callback)
                .on('finish', function () {
                    sha1.end();
                    this.hash = sha1.read();
                    callback(null, this.hash);
                });
        })
        .method('read', function (callback /*(err, Buffer)*/ ) {
            var buffers = [];
            this.createPipeable()
                .on('data', function (data) {
                    buffers.push(Buffer.isBuffer(data) ? data : new Buffer(data));
                })
                .on('error', callback)
                .on('finish', function () {
                    callback(null, Buffer.concat(buffers));
                });
        })
        .toClass();

    module.exports = Source;
})(module);