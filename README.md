## node-blobstore
Store blobs. Retreive blobs. Do blobby stuff with blobs.

## Features
- additional headers can be specified
- blobs share same physical file if content is identical
- fast as your filesystem
- index kept in memory for fast lookup

## Sample
```javascript
var blobstore = require('blobstore')

var store = blobstore.createFileBlobStore('./data');

store.addBlob(new Buffer('...'), function (err, addedBlob){});
store.addBlob('./README.md', function (err, addedBlob){});
store.addBlob(
  blobstore.FileBlob('./README.md',{key:'123',headers:{author:'@me'}}), 
  function (err, addedBlob){});

store.getBlob('123',function (err, blob){
  if (blob){
    blob.createReadStream().pipe(...)
  }
});

```
