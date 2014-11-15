var blobstore = require('../'),
  async = require('async'),
  uuid = require('uuid'),
  assert = require('assert'),
  fs = require('fs'),
  path = require('path'),
  mkdirp = require('mkdirp'),
  rmrf = require('rimraf');

describe('fileBlobStore: add() / getBlob()', function() {

  it('Buffer', function(done) {
    runTest(new Buffer(EXPECTED), done);
  });
  it('BufferBlob', function(done) {
    runTest(blobstore.BufferBlob(new Buffer(EXPECTED)), done);
  });
  it('FileBlob', function(done) {
    runTest(blobstore.FileBlob(testSourcePath), done);
  });
  it('path', function(done) {
    runTest(testSourcePath, done);
  });
  it('same file added multiple times in sequence', function(done) {
    var counter = 50;
    next();
    function next(err) {
      if (err) {
        done(err);
      }
      --counter;
      if (counter === 0) {
        return done();
      }
      runTest(testSourcePath, next);
    }
  });
  it('same file added multiple times in parallel', function(done) {

    var tasks = [];
    for (var i = 0; i < 50; ++i) {
      tasks.push(function(cb) {
        runTest(testSourcePath, cb);
      })
    }

    async.parallel(tasks, done);
  });

  var testFolder;
  var testSourcePath;
  var store;

  var EXPECTED = 'Actual contents of buffer/file added to blobstore';

  beforeEach(function(next) {
    // Setup a temporary test folder for our blobstore under test
    testFolder = './tmp/test/' + uuid.v4();
    testSourcePath = path.join(testFolder, 'sample.txt');
    var storeFolder = path.join(testFolder, 'bs');

    // Create folders + sample content
    mkdirp(testFolder, function(err) {
      store = blobstore.createFileBlobStore(storeFolder);
      fs.writeFile(testSourcePath, EXPECTED, next);
    });
  });
  afterEach(function(next) {
    rmrf(testFolder, next);
  });

  function runTest(sourceBlob, done) {
    async.seq(
      function addSomethingToBlobStore(cb) {
        store.addBlob(sourceBlob, cb);
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
