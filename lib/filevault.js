/*jslint node:true*/
(function (module) {
    'use strict';

    var debug = require('debug')('blobstore:fvault'),
        fs = require('fs'),
        fspath = require('path'),
        mkdirp = require('mkdirp'),
        async = require('async'),
        Vault = require('./vault'),
        FileBlob = require('./fileblob'),
        classBuilder = require('ryoc');

    function writeBlob(blob, path, callback) {
        // Copy blob to file
        // We might encounter
        // - folder doesnt exists
        // - file already exists
        function copy(cb) {
            debug('writing blobfile %s', path);
            blob.createReadStream()
                .pipe(fs.createWriteStream(path, {
                    flags: 'wx'
                }))
                .on('error', onError)
                .on('finish', cb);
        };

        function onFolderCreated(err) {
            return err ? callback(err) : copy(callback);
        }

        function onError(err) {
            if (err.code === 'ENOENT') {
                // this is an indication the folder doesnt exist
                debug('creting folder for blobfile %s', path);
                return mkdirp(fspath.dirname(path), onFolderCreated);
            }
            if (err.code == 'EEXIST') {
                // blob did exists, all is fine
                debug('blobfile %s already existed', path);
                return callback(null);
            }
            callback(err);
        }
        copy(callback);
    };


    var FileVault = classBuilder()
        .construct(function (path) {
            Vault.call(this);
            this.path = path;
        })
        .method('isInitialized', function (callback) {
            fs.stat(this.path, function (err, stats) {
                return callback(null, (!err) && stats && stats.isDirectory());
            });
        })
        .method('initialize', function (callback) {
            return mkdirp(this.path, callback);
        })
        .method('getBlob', function (options, callback) {
            var hash = options.hash;
            var blobPath = fspath.join(this.path, hash.substring(0, 2), hash.substring(2));
            var blob = new FileBlob(blobPath, options);
            return callback(null, blob);
        })
        .method('addBlob', function (blob, callback) {
            var self = this;

            var state = {
                basePath: this.path,
                hash: undefined,
                blobPah: undefined
            };

            async.series([

                function calculateHash(cb) {
                        blob.getHash(function (err, hash) {
                            state.hash = hash;
                            cb(err);
                        });
                },
                function calculateBlobPath(cb) {
                        state.blobPath = fspath.join(state.basePath, state.hash.substr(0, 2), state.hash.substr(2));
                        cb(null);
                },
                function copySourceToBlobIfNotExists(cb) {
                        writeBlob(blob, state.blobPath, cb);
                    }],
                function (err) {
                    if (err) {
                        debug('failed to add blob %j: %j', blob, err); 
                    }
                    callback(err, state.hash);
                });
        })
        .toClass();

    module.exports = FileVault;
})(module);