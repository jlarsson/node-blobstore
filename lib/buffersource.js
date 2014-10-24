/*jslint node:true*/
(function (module) {
    'use strict';
    var stream = require('stream'),
        Source = require('./source'),
        classBuilder = require('ryoc');

    var FileSource = classBuilder()
        .inherit(Source)
        .construct(function (buffer, hash) {
            Source.call(this, hash);
            this.buffer = buffer;
        })
        .method('createReadStream', function () {
            var s = new stream.Readable();
            s.push(this.buffer);
            s.push(null);
            return s;
        })
        .toClass();

    module.exports = FileSource;
})(module);