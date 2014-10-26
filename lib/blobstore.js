/*jslint node:true*/
(function (module) {
    'use strict';

    var util = require('util'),
        crypto = require('crypto'),
        uuid = require('uuid'),
        Source = require('./source'),
        BufferSource = require('./buffersource'),
        FileSource = require('./filesource'),
        classBuilder = require('ryoc'),
        _ = require('lodash');

    function getEffectiveSource(source) {
        if (source instanceof Source) {
            return source;
        }
        if (Buffer.isBuffer(source)) {
            return BufferSource(source);
        }
        // source is now assumed to be a path string
        return FileSource(source);
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
        .method('addBlob', function (source, options, callback) {
            if (arguments.length < 2) {
                throw new Error('invocation of blobstore.add(source[,options],callback) has too few arguments');
            }
            if (arguments.length < 3) {
                options = {};
                callback = arguments[2];
            }

            options = options || {
                //key: uuid.v4(),
                //generateKey: false
            };
            source = getEffectiveSource(source);

            var self = this;
            self.vault.add(source, onAddSourceToVault);

            function onAddSourceToVault(err, hash) {
                if (err) {
                    return callback(err);
                }
                var key = options.key || (options.generateKey ? hash : uuid.v4());
                self.repo.execute('blobstore-add', {
                        hash: hash,
                        key: key,
                        headers: options.headers || {}
                    },
                    onAddToRepository
                );
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