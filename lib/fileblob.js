/*jslint node:true*/
(function (module) {
    'use strict';
    var fs = require('fs'),
        Blob = require('./blob'),
        classBuilder = require('ryoc');

    var FileBlob = classBuilder()
        .inherit(Blob)
        .construct(function (path, options) {
            Blob.call(this, options);
            this.path = path;
        })
        .method('createReadStream', function () {
            return fs.createReadStream(this.path);
        })
        .toClass();

    module.exports = FileBlob;
})(module);