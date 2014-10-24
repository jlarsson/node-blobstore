/*jslint node:true*/
(function (module) {
    'use strict';

    var fspath = require('path'),
        BlobStore = require('./lib/blobstore'),
        FileVault = require('./lib/filevault'),
        repository = require('./lib/repository'),
        highlander = require('highlander');


    module.exports = function (options) {
        return new BlobStore(options);
    }
    module.exports.FileSource = require('./lib/filesource');
    module.exports.BufferSource = require('./lib/buffersource');
    module.exports.FileVault = FileVault;


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