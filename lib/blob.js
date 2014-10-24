(function (module) {
    'use strict';

    var zlib = require('zlib'),
        Source = require('./source'),
        classBuilder = require('ryoc');

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

    module.exports = Blob;
})(module);