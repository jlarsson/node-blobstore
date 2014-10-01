(function (module) {
    'use strict';

    var Vault = function () {};

    var proto = Vault.prototype;

    proto.isInitialized = function (callback) {
        throw new TypeError('isInitialized is not implemented');
    };
    proto.initialize = function (callback) {
        throw new TypeError('initialize is not implemented');
    };
    proto.add = function (source, callback) {
        throw new TypeError('add is not implemented');
    };
    proto.getBlob = function (entry, callback) {
        throw new TypeError('getBlob is not implemented');
    };

    module.exports = Vault;
})(module);