/*jslint node:true*/
(function (module) {
    'use strict';

    var fs = require('fs'),
        zlib = require('zlib'),
        Blob = require('./blob'),
        classBuilder = require('ryoc');

    var FileBlob = classBuilder()
        .inherit(Blob)
        .construct(function (hash, path) {
            Blob.call(this, hash);
            this.path = path;
        })
        .method('createReadStream', function () {
            return fs.createReadStream(this.path);
        })
        .method('writeSource', function (source, callback) {
            source.createReadStream()
                .on('error', callback)
                .on('end', callback)
                .pipe(zlib.createGzip())
                .pipe(fs.createWriteStream(this.path));
        })
        .toClass();

    module.exports = FileBlob;
})(module);