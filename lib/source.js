(function (module){
    'use strict';
    
    var crypto = require('crypto');
    
    var Source = function (key){
        this.key = key;
    };
    
    
    function abstract(){
        return function (){};
    };
    
    var proto = Source.prototype;

    proto.createReadableStream = function (){ throw new TypeError('createReadableStream is not implemented'); };
    proto.getName = function (){ throw new TypeError('getName is not implemented'); };
    proto.getMeta = function (){ throw new TypeError('getMeta is not implemented'); };
    proto.getKey = function (){ return this.key; };
    proto.getHash = function (callback){
        var sha1 = crypto.createHash('sha1');
        sha1.setEncoding('hex');
        this.createReadableStream()
            .on('error', callback)
            .on('end', function () {
                sha1.end();
                callback(null, sha1.read());
            })
            .pipe(sha1);
    };
    
    
    module.exports = Source;
})(module);