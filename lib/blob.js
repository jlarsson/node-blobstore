(function (module){
    var Blob = function (){};
    
    var proto = Blob.prototype;
    proto.pipe = function (writable){ throw new TypeError('pipe is not implemented'); };
    module.exports = Blob;
})(module);