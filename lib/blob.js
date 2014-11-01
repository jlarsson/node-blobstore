/*jslint node:true*/
(function (module) {
    'use strict';

    var crypto = require('crypto'),
        classBuilder = require('ryoc');

    var Blob = classBuilder()
        .construct(function (options) {
            var o = options || {};
            this.state = {
                hash: o.hash || null,
                key: o.key || null,
                headers: o.headers || {}
            };
        })
        .getter('key', function (){ return this.state.key; })
        .getter('headers', function (){ return this.state.headers; })
        .abstract('createReadStream' /*, function (){}*/ )
        .method('getHash', function (callback) {
            if (this.state.hash) {
                return callback(null, this.state.hash);
            }
            var sha1 = crypto.createHash('sha1');
            sha1.setEncoding('hex');
            this.createReadStream().pipe(sha1)
                .on('error', callback)
                .on('finish', function () {
                    sha1.end();
                    this.state.hash = sha1.read();
                    callback(null, this.state.hash);
                }.bind(this));
        })
        .method('read', function (callback /*(err, Buffer)*/ ) {
            var buffers = [];
            this.createReadStream()
                .on('data', function (data) {
                    buffers.push(Buffer.isBuffer(data) ? data : new Buffer(data));
                })
                .on('error', callback)
                .on('end', function () {
                    callback(null, Buffer.concat(buffers));
                });
        })
        .method('send', function (req, res) {
            this.createReadStream().pipe(res);
        })
        .toClass();

    
    module.exports = Blob;
})(module);