(function (module){
    var debug = require('debug')('blobstore:vault'),
        fs = require('fs'),
        fspath = require('path'),
        mkdirp = require('mkdirp'),
        zlib = require('zlib'),
        inherits = require('inherits'),
        Vault = require('./vault'),
        FileBlob = require('./fileblob');
    
    var FileVault = function (path){
        if (!(this instanceof FileVault)){
            return new FileVault(path);
        }
        Vault.call(this);
        
        this.path = path;
    };
    
    inherits(FileVault, Vault);
    
    var proto = FileVault.prototype;

    proto.add = function(source, callback){
        var self = this;
        source.getHash(function (error, hash){
            if (error){
                return callback(error);
            }
            
            var blobPath = fspath.join(self.path, hash.substring(0,2), hash.substring(2));
            
            fs.exists(blobPath, function (exist){
                if (exist){
                    debug('blob %s already exists', blobPath);
                    return callback(null, hash);
                }
                
                
                mkdirp(fspath.dirname(blobPath), function (error){
                    if (error){
                        return callback(error);
                    }
                    debug('blob %s is being created', blobPath);
                    source.createReadableStream()
                        .on('error', function (error) {
                            return callback(error);
                        })
                        .on('done', function (){
                            return callback(null, hash);
                        })
                        .pipe(zlib.createGzip()).pipe(fs.createWriteStream(blobPath));
                });
            });
        });
    }
    
    proto.getBlob = function (entry, callback){ 
        var self = this;
        var blobPath = fspath.join(self.path, entry.hash.substring(0,2), entry.hash.substring(2));
        
        return callback(null, new FileBlob(blobPath, entry));
    };    
    
    module.exports = FileVault;
})(module);