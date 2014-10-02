#!/usr/bin/env node

var program = require('commander'),
    glob = require('glob'),
    minimatch = require('minimatch'),
    async = require('async'),
    blobstore = require('./index');


function collect(val, memo) {
    memo.push(val);
    return memo;
};

function execute(tasks) {
    async.series(tasks,
        function (err) {
            if (err) {
                console.log(err);
            }
        });
}

program
    .version('0.0.1')
    .option('-l, --list [spec]', 'Echo blob listing to stdout')
    .option('-f, --fetch <spec>', 'Echo blobs to stdout')
    .option('-h, --header <text>', 'If specified, header is prepended to each echoed blob.')
    .option('-nh, --noheader', 'If specified, headers are omitted.')
    .option('-a, --add <spec>', 'Add files to blobstore', collect, [])
    .option('-i, --init', 'Initialize blobstore')
    .on('--help', function () {
        console.log('Example specifications:');
        console.log();
        console.log('\t\'*.txt\' - match txt-files');
        console.log('\t\'bin/**/*.txt\' - match txt-files recursively in bin');
        console.log();
        console.log('Default header is \'## blob:{name}\'');
        console.log();
    })
    .on('list', function (spec) {
        var state = {};

        function createStore(cb) {
            state.store = blobstore.createFileBlobStore('.blobstore');
            cb();
        }

        function getIndex(cb) {
            state.store.getIndex(function (err, index) {
                state.index = index;
                cb(err);
            });
        }

        function list(cb) {
            //console.log(state.index);
            spec = '**/*.js';
            var filter = spec ? function (n) {
                return minimatch(n, spec);
            } : function () {
                return true;
            }
            var names = Object.getOwnPropertyNames(state.index).filter(filter);
            for (var i in names) {
                var path = names[i];
                console.log(path);
            }
            cb();
        }
        execute([createStore, getIndex, list]);
    })
    .on('fetch', function (spec) {
        var state = {};

        function createStore(cb) {
            state.store = blobstore.createFileBlobStore('.blobstore');
            cb();
        }

        function getIndex(cb) {
            state.store.getIndex(function (err, index) {
                state.index = index;
                cb(err);
            });
        }

        function getBlobs(cb) {
            var filter = spec ? function (n) {
                return minimatch(n, spec);
            } : function () {
                return true;
            }
            var paths = Object.getOwnPropertyNames(state.index).filter(filter);

            async.map(paths,
                state.store.getBlob.bind(state.store),
                function (err, blobs) {
                    state.blobs = blobs;
                    cb(err);
                });
        }

        function dumpBlobs(cb) {
            async.eachSeries(state.blobs.filter(function (b) {
                return !!b;
            }), function (blob, cb) {
                if (!program.noheader) {
                    var header =
                        (program.header || '## blob: {name}').replace('{name}', blob.getKey());
                    process.stdout.write(header + '\n');
                }
                blob.createPipeable()
                    .on('end', cb)
                    .pipe(process.stdout);

            }, cb);
        }
        execute([createStore, getIndex, getBlobs, dumpBlobs]);
    })
    .on('init', function () {
        var state = {};

        function createStore(cb) {
            state.store = blobstore.createFileBlobStore('.blobstore');
            cb();
        }

        function initialize(cb) {
            state.store.initialize(cb);
        }

        function report(cb) {
            console.log('blobstore is initialized');
            cb();
        }
        execute([createStore, initialize, report]);
    })
    .on('add', function (spec) {

        var state = {};

        function createStore(cb) {
            state.store = blobstore.createFileBlobStore('.blobstore');
            cb();
        }

        function checkInitialized(cb) {
            state.store.isInitialized(function (err, i) {
                cb(i ? null : 'Blobstore is not initialized');
            });
        }

        function collectFiles(cb) {
            glob(spec, {
                mark: true
            }, function (err, files) {
                state.files = files;
                cb(err);
            });

        }

        function importFiles(cb) {
            async.eachSeries(
                state.files,
                function (path, cb) {
                    if (path.match(/.*\/$/)) {
                        return cb();
                    }   
                    console.log('adding %s', path);
                    
                    var key = path.split('/')
                        .filter(function (n) { return n && (n !== '.') && (n != '..'); })
                        .join('/');
                    state.store.add(blobstore.FileSource(key, path), cb);

                },
                cb);
        }
        execute([
            createStore,
            checkInitialized,
            collectFiles,
            importFiles
        ]);
    })
    .parse(process.argv)



//if (program.args.length === 0) program.help();