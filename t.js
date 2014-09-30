var fs = require('fs'),
    fspath = require('path'),
    fswalk = require('fs-walk'),
    async = require('async'),
    blobstore = require('./index');


var store = blobstore.createFileBlobStore('tmp/.bs');

var filesToAdd = [];

function collectFilesToAdd(cb) {
    fswalk.walk('node_modules', function (folder, name, stat, next) {
        if (stat.isFile()) {
            filesToAdd.push({
                name: name,
                path: fspath.join(folder, name)
            });
        }
        next();
    }, cb);
}

function addCollectedFiles(cb) {
    async.eachSeries(
        filesToAdd,
        function (file, cb) {
            store.add(blobstore.FileSource(file.path, file.name), cb);
        },
        cb);
}

function dumpSomeBlob(cb) {
    store.getBlob('index.js', function (err, blob) {
        if (err) {
            return cb(err);
        }
        if (!blob) {
            return cb('blob not found');
        }

        blob.createPipeable()
            .on('end', cb)
            .pipe(process.stdout);

    });
}

function finalWords(err) {
    if (err) {
        return console.error(err);
    }
    console.log('done.');
}
async.series([collectFilesToAdd, addCollectedFiles, dumpSomeBlob], finalWords);