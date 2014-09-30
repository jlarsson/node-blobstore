/*jslint node:true*/
(function (module) {
    'use strict';

    var fs = require('fs'),
        fspath = require('path'),
        inherits = require('inherits'),
        zlib = require('zlib'),
        Blob = require('./blob');

    var FileBlob = function (path, entry) {
        if (!(this instanceof FileBlob)) {
            return new FileBlob(path, key);
        }
        Blob.call(this);

        this.path = path;
        this.entry = entry;
    };

    inherits(FileBlob, Blob);

    var proto = FileBlob.prototype;

    proto.pipe = function (writable) {
        return fs.createReadStream(this.path).pipe(zlib.createGunzip()).pipe(writable);
    }

    module.exports = FileBlob;
})(module);