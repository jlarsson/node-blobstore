/*jslint node:true*/
(function (module) {
    'use strict';

    var debug = require('debug')('blobstore:vault'),
        fs = require('fs'),
        fspath = require('path'),
        mkdirp = require('mkdirp'),
        async = require('async'),
        Vault = require('./vault'),
        FileBlob = require('./fileblob'),
        FileSource = require('./filesource'),
        classBuilder = require('ryoc');

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
        .method('getBlob', function (hash, callback) {
            var blobPath = fspath.join(this.path, hash.substring(0, 2), hash.substring(2));
            return callback(null, new FileBlob(hash, blobPath));
        })
        .method('add', function (source, callback) {
            var self = this;

            var state = {
                basePath: this.path,
                temp: fspath.join(self.path, '.tmp')
            };
            async.series([

                function ensureTempFolder(cb) {
                        mkdirp(state.temp, cb);
                },
                function calculateHash(cb) {
                        source.getHash(function (err, hash) {
                            state.sourceHash = hash;
                            cb(err);
                        });
                },
                function calculateBlobPath(cb) {
                        state.blobFolder = fspath.join(state.basePath, state.sourceHash.substr(0, 2));
                        state.blobPath = fspath.join(state.blobFolder, state.sourceHash.substr(2));
                        state.blob = new FileBlob(state.sourceHash, state.blobPath);
                        cb(null);
                },
                function checkIfBlobExists(cb) {
                        fs.exists(state.blobPath, function (exist) {
                            state.blobExists = exist;
                            cb();
                        });
                },
                function createBlobFolderIfNotExists(cb) {
                        if (state.blobExists) {
                            return cb(null);
                        }
                        mkdirp(state.blobFolder, cb);
                },
                function copySourceToBlobIfNotExists(cb) {
                        if (state.blobExists) {
                            return cb(null);
                        }
                        state.blob.writeSource(source, cb);
                }
            ],
                function (err) {
                    //debug(state);
                    callback(err, state.blob);
                });
        })
        .toClass();

    module.exports = FileVault;
})(module);