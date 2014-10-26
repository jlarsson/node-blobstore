/*jslint node:true*/
(function (module) {
    'use strict';

    var fspath = require('path'),
        BlobStore = require('./lib/blobstore'),
        FileVault = require('./lib/filevault'),
        FileBlob = require('./lib/fileblob'),
        BufferBlob = require('./lib/bufferblob'),
        repository = require('./lib/repository'),
        highlander = require('highlander');


    module.exports = function (options) {
        return new BlobStore(options);
    }
    module.exports.FileBlob = FileBlob;
    module.exports.BufferBlob = BufferBlob;
    module.exports.FileVault = FileVault;

    module.exports.createBlob = function (pathOrBuffer, options) {
        return Buffer.isBuffer(pathOrBuffer) ? new BufferBlob(pathOrBuffer, options) : new FileBlob(pathOrBuffer, options);
    };

    module.exports.createFileBlobStore = function (folder) {
        var root = fspath.resolve(folder);
        return new BlobStore({
            vault: new FileVault(fspath.join(root, '.blob')),
            repo: repository.create({
                model: {
                    blob: {}
                },
                journal: highlander.fileJournal({
                    path: fspath.join(root, '.journal')
                })
            })
        });
    };
})(module);