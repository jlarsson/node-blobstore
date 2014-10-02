/*jslint node:true*/
(function (module) {
    'use strict';
    var fs = require('fs'),
        fspath = require('path'),
        inherits = require('inherits'),
        Source = require('./source');

    var FileSource = function (key, path) {
        if (!(this instanceof FileSource)) {
            return new FileSource(key, path);
        }
        Source.call(this, key);

        this.path = path;
        this.name = null;
        this.meta = null;
    };

    inherits(FileSource, Source);


    function abstract() {
        return function () {};
    };


    var proto = FileSource.prototype;

    proto.getName = function () {
        return this.name || fspath.basename(this.path);
    };
    proto.getMeta = function () {
        return this.meta;
    };
    proto.createReadableStream = function () {
        return fs.createReadStream(this.path);
    }

    module.exports = FileSource;
})(module);