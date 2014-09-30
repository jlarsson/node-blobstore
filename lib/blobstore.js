/*jslint node:true*/
(function (module) {
    'use strict';

    var util = require('util'),
        crypto = require('crypto'),
        Source = require('./source');

    var BlobStore = function (options) {
        if (!(this instanceof BlobStore)) {
            return new BlobStore(options);
        }

        this.vault = options.vault;
        this.repo = options.repo;
    };


    var proto = BlobStore.prototype;

    proto.add = function (source, callback) {
        if (!(source instanceof Source)) {
            callback(new Error('source must be instance of class Source'));
        }

        var self = this;

        self.vault.add(source, function (error, hash) {
            if (error) {
                return callback(error);
            }
            self.repo.execute('blobstore-add', {
                    hash: hash,
                    key: source.getKey(),
                    name: source.getName(),
                    meta: source.getMeta()
                },
                callback
            );
        });
    }

    proto.getBlob = function (key, callback) {
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
                    self.vault.getBlob(entry, callback) : callback(null, null);
            });
    }

    proto.getIndex = function (callback) {
        this.repo.query(function (model, cb) {
                return cb(null, model.blob || {});
            },
            callback);
    }

    module.exports = BlobStore;
})(module);