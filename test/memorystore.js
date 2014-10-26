var blobstore = require('../'),
    async = require('async'),
    uuid = require('uuid'),
    assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    rmrf = require('rimraf');

describe('memoryBlobStore: add() / getBlob()', function () {
    
    it('Buffer', function (done) {
        runTest(new Buffer(EXPECTED), done);
    });/*
    it('BufferBlob', function (done) {
        runTest(blobstore.BufferBlob(new Buffer(EXPECTED)), done);
    });*/

    var store;
    
    var EXPECTED = 'Actual contents of buffer/file added to blobstore';
    
    beforeEach(function () {
        store = blobstore.createMemoryBlobStore();
    });

    function runTest(sourceBlob, done){
        async.seq(
            function addSomethingToBlobStore(cb) {
                store.addBlob(sourceBlob,cb);
            },
            function getBlob(addedBlob, cb) {
                store.getBlob(addedBlob.key, cb);
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