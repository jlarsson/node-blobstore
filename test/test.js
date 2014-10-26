var blobstore = require('../'),
    async = require('async'),
    uuid = require('uuid'),
    assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    rmrf = require('rimraf');

describe('blobstore:add() / getBlob()', function () {
    it('Buffer', function (done) {
        runTest(new Buffer(EXPECTED), done);
    });
    it('BufferSource', function (done) {
        runTest(blobstore.BufferSource(new Buffer(EXPECTED)), done);
    });
    it('FileSource', function (done) {
        runTest(blobstore.FileSource(testSourcePath), done);
    });
    it('path', function (done) {
        runTest(testSourcePath, done);
    });

    var testFolder;
    var testSourcePath;
    var store;
    
    var EXPECTED = 'Actual contents of buffer/file added to blobstore';
    
    beforeEach(function (next) {
        // Setup a temporary test folder for our blobstore under test
        testFolder = './tmp/test/' + uuid.v4();
        testSourcePath = path.join(testFolder, 'sample.txt');
        var storeFolder = path.join(testFolder, 'bs');
        
        // Create folders + sample content 
        mkdirp(testFolder, function (err) {
            store = blobstore.createFileBlobStore(storeFolder);
            fs.writeFile(testSourcePath, EXPECTED, next);
        });
    });
    afterEach(function (next) {
        rmrf(testFolder, next);
    });

    function runTest(source, done){
        async.seq(
            function addSomethingToBlobStore(cb) {
                store.addBlob(source, {
                    key: 'test'
                }, cb);
            },
            function getBlob(addedBlob, cb) {
                store.getBlob('test', cb);
            },
            function getBlobContent(blob, cb) {
                blob.read(cb);
            },
            function verify(buffer, cb) {
                assert.equal(EXPECTED, buffer.toString('utf8'));
                cb();
            }
        )(done);
    }
});