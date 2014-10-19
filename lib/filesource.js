/*jslint node:true*/
(function (module) {
    'use strict';
    var fs = require('fs'),
        Source = require('./source'),
        classBuilder = require('ryoc');

    var FileSource = classBuilder()
        .inherit(Source)
        .construct(function (key, path, hash) {
            Source.call(this, key, hash);
            this.path = path;
        })
        .method('createReadStream', function () {
            return fs.createReadStream(this.path);
        })
        .toClass();

    module.exports = FileSource;
})(module);