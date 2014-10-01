(function (module) {
    'use strict';
    
    var Blob = function (key) {
        this.key = key;
    };

    var proto = Blob.prototype;
    
    proto.getKey = function () { return this.key; }; 
    proto.createPipeable = function () {
        throw new TypeError('createPipeable is not implemented');
    };
    
    module.exports = Blob;
})(module);