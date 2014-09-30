var fs = require('fs'),
    fspath = require('path'),
    fswalk = require('fs-walk'),

    blobstore = require('./index');


var store = blobstore.createFileBlobStore('tmp/.bs');



function whenAll(action)
{
    var triggered = false;
    var count = 0;
    function test(){
        if (!triggered){
            setImmediate(function (){
                if ((!triggered) && (count == 0)){
                    triggered = true;
                    action();
                }
            })
        }
    }
    return {
        enter: function () { ++count; },
        leave: function (msg) { --count; if (msg) { console.log('%s (%d)', msg, count); } test(); },
    };
}

var t = whenAll(
    function () {
        store.getBlob('index.js', function (err, blob) {
            if (err) {
                return console.error(err);
            }
            if (!blob) {
                return console.error('blob not found');
            }

            blob.pipe(process.stdout);
        });
    }
);

fswalk.walk('node_modules', function (folder, name, stat, next) {
        if (stat.isFile()) {
            var p = fspath.join(folder, name);
            console.log('adding %s', name);
            t.enter();
            store.add(blobstore.FileSource(p, name), function (error, data) {
                //console.log('added %j',data);
                if (error) {
                    return t.leave(error);
                }
                t.leave('done with ' + data.key);
                //t.leave();
            });
            
        }
        next();
    },
    function (err) {
    });
