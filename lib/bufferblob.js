/*jslint node:true*/
(function (module) {
    'use strict';
    var stream = require('stream'),
        Blob = require('./blob'),
        classBuilder = require('ryoc');

    var BufferBlob = classBuilder()
        .inherit(Blob)
        .construct(function (buffer, options) {
            Blob.call(this,options);
            this.buffer = buffer;
        })
        .method('createReadStream', function () {
            var s = new stream.Readable();
            s.push(this.buffer);
            s.push(null);
            return s;
        })
        .toClass();

    module.exports = BufferBlob;
})(module);