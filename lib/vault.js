(function (module) {
    'use strict';

    var classBuilder = require('ryoc');
 
    var Vault = classBuilder()
        .abstract('isInitialized'/*, function (callback) {}*/)
        .abstract('initialize' /*, function (callback) {}*/ )
        .abstract('add' /*, function (blob, callback) {}*/ )
        .abstract('getBlob' /*, function (options, callback) {}*/ )
        .toClass();

    module.exports = Vault;
})(module);