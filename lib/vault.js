(function (module) {
    'use strict';

    var classBuilder = require('ryoc');
 
    var Vault = classBuilder()
        .abstract('isInitialized')
        .abstract('initialize' /*, function (callback) {}*/ )
        .abstract('add' /*, function (source, callback) {}*/ )
        .abstract('getBlob' /*, function (entry, callback) {}*/ )
        .toClass();

    module.exports = Vault;
})(module);