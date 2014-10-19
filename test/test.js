var blobstore = require('../'),
    async = require('async'),
    uuid = require('uuid'),
    assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    rmrf = require('rimraf');

describe('blobstore', function () {
    var testFolder;
    var store;

    before(function (next) {
        console.log('::before');
        next();
    });
    beforeEach(function (next) {
        console.log('::beforeEach');
        testFolder = './tmp/test/' + uuid.v4();
        var storeFolder = path.join(testFolder, 'bs');
        mkdirp(testFolder, function (err) {
            store = blobstore.createFileBlobStore(storeFolder);
            next(err);
        });
    });
    afterEach(function (next) {
        console.log('::afterEach');
        next();
    });
    after(function (next) {
        console.log('::after');
        rmrf(testFolder,next);
    });

    it('added content can be read back', function (done) {

        var testFilePath = path.join(testFolder, 'testfile.txt');
        var blob;
        var blobBuffer;
        async.series([
            function createTestFile(cb) {
                    console.log('createTestFile');
                    fs.writeFile(testFilePath, 'hello world', cb);
            },
            function addTestFileToBlobStore(cb) {
                    console.log('addTestFileToBlobStore');
                    store.add(blobstore.FileSource('test', testFilePath), cb);
            },
            function getBlob(cb) {
                    console.log('getBlob');

                    store.getBlob('test', function (err, b) {
                        blob = b;
                        cb(err);
                    });
            },
            function getBlobContent(cb) {
                    console.log('getBlobContent');

                    blob.read(function (err, b) {
                        blobBuffer = b;
                        cb(err);
                    });
            },
            function verify(cb) {
                    console.log(blobBuffer);
                    cb();
            }
        ],
            function (err) {
                if (err){
                    console.dir(err);
                    console.log(err.stack);
                }
                assert(!err, err);
                assert.equal('hello world', blobBuffer.toString());
                done();
            });
    });
});