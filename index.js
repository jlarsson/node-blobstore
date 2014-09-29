(function (module) {
    var fspath = require('path'),
        BlobStore = require('./lib/blobstore'),
        FileSource = require('./lib/filesource'),
        FileVault = require('./lib/filevault'),
        repository = require('./lib/repository'),
        highlander = require('highlander');


    module.exports = function (options) {
        return new BlobStore(options);
    }
    module.exports.FileSource = FileSource;
    module.exports.FileVault = FileVault;


    module.exports.createFileBlobStore = function (folder) {
        return new BlobStore({
            vault: new FileVault(fspath.join(folder, '.blob')),
            repo: repository.create({
                model: {
                    blob: {}
                },
                journal: highlander.fileJournal({
                    path: fspath.join(folder, '.journal')
                })
            })
        });
    };
})(module);