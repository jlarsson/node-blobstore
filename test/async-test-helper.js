(function (module) {
    'use strict';

    var fs = require('fs'),
        mkdirp = require('mkdirp'),
        remove = require('remove'),
        blobstore = require('../');

    module.exports = function () {

        var vars = {};
        return {
            getVar: function (name) {
                return vars[name];
            },
            mkdirp: function (path) {
                return function (callback) {
                    return mkdirp(path, callback);
                };
            },
            rmrf: function (path) {
                return function (callback) {
                    return remove(path, callback);
                };
            },
            writeFile: function (path, content) {
                return function (callback) {
                    return fs.writeFile(path, content, callback);
                };
            },
            unlink: function (path) {
                return function () {
                    fs.unlink(path, callback);
                };
            },
            addFileToBlobStore: function (store, key, path) {
                return function (callback) {
                    store.add(blobstore.FileSource(key, path), callback);
                };
            },
            saveBlobContentIntoVar: function (store, key, varName) {
                return function (callback) {
                    var buffers = [];
                    store.getBlob(key, function (err, blob) {
                        if (err) {
                            return callback(err);
                        }
                        if (!blob) {
                            callback('no such blob:' + key);
                        }
                        blob.createPipeable()
                            .on('data', function (data) {
                                buffers.push(Buffer.isBuffer(data) ? data : new Buffer(data));
                            })
                            .on('error', callback)
                            .on('end', function () {
                                vars[varName] = Buffer.concat(buffers).toString();
                                callback();
                            });
                    });

                };
            }
        };
    }
})(module);