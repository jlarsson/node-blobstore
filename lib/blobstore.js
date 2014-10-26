/*jslint node:true*/
(function (module) {
    'use strict';

    var util = require('util'),
        crypto = require('crypto'),
        uuid = require('uuid'),
        Blob = require('./blob'),
        BufferBlob = require('./bufferblob'),
        FileBlob = require('./fileblob'),
        classBuilder = require('ryoc'),
        _ = require('lodash');

    function getEffectiveBlob(blob) {
        if (blob instanceof Blob) {
            return blob;
        }
        if (Buffer.isBuffer(blob)) {
            return BufferBlob(blob);
        }
        // source is now assumed to be a path string
        return FileBlob(blob);
    }
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
        .method('addBlob', function (blob, callback) {
            if (arguments.length < 2) {
                throw new Error('invocation of blobstore.add(source,callback) has too few arguments');
            }
            blob = getEffectiveBlob(blob);

            var self = this;
            self.vault.addBlob(blob, onAddBlobToVault);

            function onAddBlobToVault(err, hash) {
                if (err) {
                    return callback(err);
                }
                var entry = {
                    key: blob.key || uuid.v4(),
                    hash: hash,
                    headers: blob.headers || {}
                };
                self.repo.execute('blobstore-add', entry, onAddToRepository);
            }

            function onAddToRepository(err, entry) {
                if (err) {
                    return err;
                }
                return self.vault.getBlob(entry, callback);
            }
        })
        .method('getBlob', function (key, callback) {
            var self = this;
            return self.repo.query(
                function (model, cb) {
                    cb(null, model.getEntry(key));
                },
                onGetEntry);

            function onGetEntry(err, entry) {
                return err ? callback(err) :
                    (entry ? self.vault.getBlob(entry, callback) : callback(new Error('No such such blob: [' + key + ']'), null));
            }
        })
        .method('getAllEntries', function (callback) {
            this.repo.query(function (model, cb) {
                    return cb(null, model.getAllEntries());
                },
                callback);
        })
        .toClass();

    module.exports = BlobStore;
})(module);