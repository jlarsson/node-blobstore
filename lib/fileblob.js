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
        .method('send', function (req, res) {
            if (res.get('ETag')){
                return res.sendFile(this.path);
            }

            var self = this;
            this.getHash(function (err, hash){
                if (err){
                    return res.status(500).send(err);
                }
                res.ETag = hash;
                if (req.fresh){
                    return res.status(304).send(':)');
                }
                return res.sendFile(self.path);
            });
        })
        .toClass();

    module.exports = FileBlob;
})(module);