(function (module) {
    'use strict';

    var zlib = require('zlib'),
        classBuilder = require('ryoc');

    var Blob = classBuilder()
        .construct(function (hash) {
            this.hash = hash;
        })
        .method('getHash', function () {
            return this.hash;
        })
        .abstract('createReadStream')
        .method('createPipeable', function () {
            return this.createReadStream().pipe(zlib.createGunzip());
        })
        .method('read', function (callback /*(err, Buffer)*/ ) {
            var buffers = [];
            this.createPipeable()
                .on('data', function (data) {
                    buffers.push(Buffer.isBuffer(data) ? data : new Buffer(data));
                })
                .on('error', callback)
                .on('end', function () {
                    callback(null, Buffer.concat(buffers));
                });
        })
        .toClass();

    module.exports = Blob;
})(module);