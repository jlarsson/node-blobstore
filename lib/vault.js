(function (module) {
    'use strict';

    var Vault = function () {};

    var proto = Vault.prototype;

    proto.add = function (source, callback) {
        throw new TypeError('add is not implemented');
    };
    proto.getBlob = function (entry, callback) {
        throw new TypeError('getBlob is not implemented');
    };

    module.exports = Vault;
})(module);