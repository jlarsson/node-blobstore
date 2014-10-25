(function (module) {
    'use strict';

    var fs = require('fs'),
        zlib = require('zlib'),
        Source = require('./source'),
        classBuilder = require('ryoc');

    // A blob is a Source but its stored compressed inside a vault
    var Blob = classBuilder()
        .inherit(Source)
        .construct(function (entry, source) {
            Source.call(this, entry.hash);
            this.source = source;
            this.entry = entry;
        })
        .method('createPipeable', function () {
            return this.source.createPipeable().pipe(zlib.createGunzip());
        })
        .toClass();

    // Blob file creation is put as a class method to keep gzip() details
    // localized to this source file
    Blob.ensureFile = function (path, source, callback) {
        source.createPipeable()
            .pipe(zlib.createGzip())
            .pipe(fs.createWriteStream(path))
            .on('error', callback)
            .on('finish', callback);
    };

    module.exports = Blob;
})(module);