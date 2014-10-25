/*jslint node:true*/
(function (module) {
    'use strict';

    var debug = require('debug')('blobstore:vault'),
        fs = require('fs'),
        fspath = require('path'),
        zlib = require('zlib'),
        mkdirp = require('mkdirp'),
        async = require('async'),
        Vault = require('./vault'),
        Blob = require('./blob'),
        FileSource = require('./filesource'),
        classBuilder = require('ryoc');

    function createBlob(entry, path) {
        return new Blob(entry, new FileSource(path, entry.hash));
    }

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
        .method('getBlob', function (entry, callback) {
            var hash = entry.hash;
            var blobPath = fspath.join(this.path, hash.substring(0, 2), hash.substring(2));
            return callback(null, createBlob(entry, blobPath));
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
                            state.hash = hash;
                            cb(err);
                        });
                },
                function calculateBlobPath(cb) {
                        state.blobFolder = fspath.join(state.basePath, state.hash.substr(0, 2));
                        state.blobPath = fspath.join(state.blobFolder, state.hash.substr(2));
                        cb(null);
                },
                function checkIfBlobExists(cb) {
                        fs.exists(state.blobPath, function (exist) {
                            state.blobExists = exist;
                            cb();
                        });
                },
                function createBlobFolderIfNotExists(cb) {
                        return state.blobExists ? cb(null) : mkdirp(state.blobFolder, cb);
                },
                function copySourceToBlobIfNotExists(cb) {
                        return state.blobExists ? cb(null) : Blob.ensureFile(state.blobPath, source, cb);
                    }],
                function (err) {
                    callback(err, state.hash);
                });
        })
        .toClass();

    module.exports = FileVault;
})(module);