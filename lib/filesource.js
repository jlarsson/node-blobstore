/*jslint node:true*/
(function (module) {
    'use strict';
    var fs = require('fs'),
        Source = require('./source'),
        classBuilder = require('ryoc');

    var FileSource = classBuilder()
        .inherit(Source)
        .construct(function (path, hash) {
            Source.call(hash);
            this.path = path;
        })
        .method('createPipeable', function () {
            return fs.createReadStream(this.path);
        })
        .toClass();

    module.exports = FileSource;
})(module);