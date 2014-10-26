(function (module) {
    'use strict';

    var fs = require('fs'),
        fspath = require('path'),
        zlib = require('zlib'),
        mkdirp = require('mkdirp'),
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

    // Blob file creation is put as a class method to keep gzip()
    // and other piping details local to this source file
    Blob.ensureFile = function (path, source, callback) {
        // Copy source to blob
        // We might encounter
        // - folder doesnt exists
        // - file already exists
        function copy(cb) {
            source.createPipeable()
                .pipe(zlib.createGzip())
                .pipe(fs.createWriteStream(path, {
                    flags: 'wx'
                }))
                .on('error', onError)
                .on('finish', cb);
        };
        function onFolderCreated(err){
            return err ? callback(err) : copy(callback);
        }

        function onError(err) {
            if (err.code === 'ENOENT') {
                // this is an indication the folder doesnt exist
                return mkdirp(fspath.dirname(path), onFolderCreated);
            }
            if (err.code == 'EEXIST'){
                // blob did exists, all is fine
                return callback(null);
            }
            callback(err);
        }
        copy(callback);
    };

    module.exports = Blob;
})(module);