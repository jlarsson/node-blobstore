var blobstore = require('../'),
    async = require('async'),
    asyncTestHelper = require('./async-test-helper'),
    uuid = require('uuid'),
    assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp');

describe('blobstore', function () {
    it('added content can be read back', function (done) {

        var tempRoot = './tmp/test-' + uuid.v4();
        var tempFile = path.join(tempRoot, 'testfile.txt');
        var tempRepoPath = path.join(tempRoot, 'bs');

        var store = blobstore.createFileBlobStore(tempRepoPath);
        var testHelper = asyncTestHelper();
        async.series([
            testHelper.mkdirp(tempRoot),
            testHelper.writeFile(tempFile, 'hello world'),
            testHelper.addFileToBlobStore(store, 'test', tempFile),

            testHelper.saveBlobContentIntoVar(store, 'test', 'contents-of-test'),
            testHelper.rmrf(tempRoot)
        ],
            function (err) {
                assert(!err, err);
                assert.equal('hello world', testHelper.getVar('contents-of-test'));
                done();
            });
    });
});