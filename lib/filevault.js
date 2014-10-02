/*jslint node:true*/
(function (module) {
    'use strict';

    var debug = require('debug')('blobstore:vault'),
        fs = require('fs'),
        fspath = require('path'),
        mkdirp = require('mkdirp'),
        zlib = require('zlib'),
        crypto = require('crypto'),
        async = require('async'),
        uuid = require('uuid'),
        inherits = require('inherits'),
        Vault = require('./vault'),
        FileBlob = require('./fileblob'),
        FileSource = require('./filesource');

    var FileVault = function (path) {
        if (!(this instanceof FileVault)) {
            return new FileVault(path);
        }
        Vault.call(this);

        this.path = path;
    };

    inherits(FileVault, Vault);

    var proto = FileVault.prototype;

    proto.isInitialized = function (callback) {
        fs.stat(this.path, function (err, stats) {
            return callback(null, (!err) && stats && stats.isDirectory());
        });
    };
    proto.initialize = function (callback) {
        return mkdirp(this.path, callback);
    };

    proto.add = function (source, callback) {

        function decorateCallback(message, cb) {
            //debug(message);
            return function (err) {
                if (err) {
                    debug('%s: %s', message, err);
                } else {
                    //debug('[%s]', message);
                }
                cb(err);
            }
        }
        var self = this;

        var state = {};

        function makeTempFolder(cb) {
            state.tempFolder = fspath.join(self.path, '.tmp');
            mkdirp(state.tempFolder, decorateCallback('create temp folder', cb));
        }

        function makeTempFile(cb) {
            state.tempSource = fspath.join(state.tempFolder, uuid.v4());
            source.createReadableStream()
                .on('error', decorateCallback('make temp file', cb))
                .on('end', decorateCallback('make temp file', cb))
                .pipe(fs.createWriteStream(state.tempSource));
        }

        function calculateHash(cb) {
            new FileSource(source.getKey(), state.tempSource).getHash(function (err, hash) {
                state.hash = hash;
                return decorateCallback('calculate hash', cb)(err);
          });
        }
                                                                      

        function makeTargetFolder(cb) {
            state.targetFolder = fspath.join(self.path, state.hash.substr(0, 2));
            mkdirp(state.targetFolder, decorateCallback('make target folder', cb));
        }

        function copyTempToTarget(cb) {
            state.target = fspath.join(state.targetFolder, state.hash.substr(2));
            fs.exists(state.target, function (exists) {
                if (exists) {
                    return cb();
                }

                fs.createReadStream(state.tempSource)
                    .on('error', decorateCallback('write target blob', cb))
                    .on('end', decorateCallback('write target blob', cb))
                    .pipe(zlib.createGzip())
                    .pipe(fs.createWriteStream(state.target));
            });
        }

        function removeTempFile(cb) {
            debug('removing %s', state.tempSource);
            fs.unlink(state.tempSource, decorateCallback('remove temp file', cb));
        }


        async.series([
            makeTempFolder,
            makeTempFile,
            calculateHash,
            makeTargetFolder,
            copyTempToTarget
        ],
            function (err) {
                setImmediate(function () {
                    async.series([removeTempFile], function () {
                        callback(err || null, state.hash || null);
                    });
                });
            });
    }

    proto.getBlob = function (entry, callback) {
        var self = this;
        var blobPath = fspath.join(self.path, entry.hash.substring(0, 2), entry.hash.substring(2));

        return callback(null, new FileBlob(blobPath, entry));
    };

    module.exports = FileVault;
})(module);