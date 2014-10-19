/*jslint node:true*/
(function (module) {
    'use strict';

    var util = require('util'),
        crypto = require('crypto'),
        Source = require('./source'),
        classBuilder = require('ryoc');

    var BlobStore = classBuilder()
        .construct(function (options) {
            this.vault = options.vault;
            this.repo = options.repo;
        })
        .method('isInitialized', function (callback) {
            return this.vault.isInitialized(callback);
        })
        .method('initialize', function (callback) {
            return this.vault.initialize(callback);
        })
        .method('add', function (source, callback) {
            if (!(source instanceof Source)) {
                callback(new Error('source must be instance of class Source'));
            }
            var self = this;
            self.vault.add(source, function (error, blob) {
                if (error) {
                    return callback(error);
                }
                self.repo.execute('blobstore-add', {
                        hash: blob.getHash(),
                        key: source.getKey()
                        //name: source.getName(),
                        //meta: source.getMeta()
                    },
                    callback
                );
            });
        })
        .method('getBlob', function (key, callback) {
            var self = this;
            return self.repo.query(
                function (model, cb) {
                    cb(null, model.blob[key]);
                },
                function (error, entry) {
                    if (error) {
                        return callback(error);
                    }
                    return entry ?
                        self.vault.getBlob(entry.hash, callback) : callback(null, null);
                });
        })
        .method('getIndex', function (callback) {
            this.repo.query(function (model, cb) {
                    return cb(null, model.blob || {});
                },
                callback);
        })
        .toClass();

    module.exports = BlobStore;
})(module);