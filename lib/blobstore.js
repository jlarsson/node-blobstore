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

    function getEffectiveSource(source){
        if (source instanceof Source){
            return source;
        }
        if (Buffer.isBuffer(source)){
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
        .method('add', function (source, options, callback) {
            if (arguments.length <2){
                throw new Error('invocation of blobstore.add(source[,options],callback) has too few arguments');
            }
            if (arguments.length < 3){
                options = {};
                callback = arguments[2];
            }
            
            options = options || {
                //key: uuid.v4()
            };
            source = getEffectiveSource(source);
            
            var self = this;
            self.vault.add(source, function (error, blob) {
                if (error) {
                    return callback(error);
                }
                var key = options.key || (options.hashIsKey ? blob.getHash() : uuid.v4());
                self.repo.execute('blobstore-add', {
                        hash: blob.getHash(),
                        key: key,
                        headers: options.headers||{}
                    },
                    callback
                );
            });
        })
        .method('getBlob', function (key, callback) {
            var self = this;
            return self.repo.query(
                function (model, cb) {
                    cb(null, model.getEntry(key));
                },
                function (error, entry) {
                    if (error) {
                        return callback(error);
                    }
                    return entry ?
                        self.vault.getBlob(entry.hash, callback) : callback(new Error('No such such blob: ['+key+']'), null);
                });
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