var blobstore = require('../'),
    assert = require('assert');

describe('blob', function () {
        it('can be initialized with a key', function () {
            var blob = blobstore.createBlob(
                new Buffer('hello blobstore'), {
                    key: 'myfirstblob'
                });
            assert.equal(blob.key, 'myfirstblob');
        });
        it('can be initialized with headers', function () {
            var headers = {
                contentType: 'text/plain'
            };
            var blob = blobstore.createBlob(
                new Buffer('hello blobstore'), {
                    headers: headers
                });
            assert.equal(blob.headers, headers);
        });
        it('can calculate its hash', function (done) {
            blobstore.createBlob(
                new Buffer('hello blobstore')
            )
                .getHash(done);
        });
        it('can be read', function (done) {
            blobstore.createBlob(
                new Buffer('hello blobstore')
            )
                .read(done);
        });
});