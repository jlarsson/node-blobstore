(function (module) {
    'use strict';
    
    var Blob = function () {};

    var proto = Blob.prototype;
    
    proto.createPipeable = function () {
        throw new TypeError('createPipeable is not implemented');
    };
    
    module.exports = Blob;
})(module);