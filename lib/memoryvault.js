/*jslint node:true*/
(function (module) {
    'use strict';

    var debug = require('debug')('blobstore:mvault'),
        async = require('async'),
        Vault = require('./vault'),
        BufferBlob = require('./bufferblob'),
        classBuilder = require('ryoc');

    var MemoryVault = classBuilder()
        .construct(function () {
            Vault.call(this);
            this.buffers = {};
        })
        .method('isInitialized', function (callback) {
            return callback(null, true);
        })
        .method('initialize', function (callback) {
            return callback(null);
        })
        .method('getBlob', function (options, callback) {
            var hash = options.hash;
            var buffer = this.buffers[hash];
            if (buffer) {
                return callback(null, new BufferBlob(buffer, options));
            }
            return callback(new Error('No such blob:' + hash));
        })
        .method('addBlob', function (blob, callback) {
            var self = this;
            var state = {};
            async.series([

                function calculateHash(cb) {
                        blob.getHash(function (err, hash) {
                            state.hash = hash;
                            cb(err);
                        });
                },
                function readBlobBuffer(cb) {
                        blob.read(function (err, buffer) {
                            if (err) {
                                return cb(err);
                            }
                            self.buffers[state.hash] = buffer;
                            cb(null);
                        });
                }],
                function (err) {
                    if (err) {
                        debug('failed to add blob %j: %j', blob, err); 
                    }
                    callback(err, state.hash);
                });
        })
        .toClass();

    module.exports = MemoryVault;
})(module);