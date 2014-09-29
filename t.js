var fs = require('fs'),
    blobstore = require('./index');


var store = blobstore.createFileBlobStore('tmp/.bs');

/*
var path = 'D:\\github\\angular.js\\CHANGELOG.md';
//var path = 'package.json';
store.add(blobstore.FileSource(path, 'changelog.md'), function (error, data) {
    if (error) {
        return console.error(error);
    }
    //console.log(data);
});
*/


fs.readdir('.', function (err, files) {

    for (var i = 0; i < files.length; ++i) {
        store.add(blobstore.FileSource(files[i], files[i]), function (error, data) {
            if (error) {
                return console.error(error);
            }
            //console.log(data);
        });
        store.add(blobstore.FileSource(files[i], 'x-' + files[i]), function (error, data) {
            if (error) {
                return console.error(error);
            }
            //console.log(data);
        });
    }

});



store.getIndex(function (err, index) {
    console.log(index);
});


store.getBlob('index.js', function (err, blob){
    if (err){
        return console.error(err);
    }
    if (!blob){
        return console.error('blob not found');
    }

    blob.pipe(process.stdout);
});