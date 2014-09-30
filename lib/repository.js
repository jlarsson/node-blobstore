/*jslint node:true*/
(function (options) {
    'use strict';
    var highlander = require('highlander');

    module.exports.create = function (options) {
        options.model = {blob: {}};
        return highlander.repository(options)
            .registerCommand('blobstore-add', {
                execute: function (ctx, callback) {
                    var model = ctx.model,
                        entry = ctx.args;

                    (model.blob || (model.blob = {}))[entry.key] = entry;

                    callback(null, entry);
                }
            });
    };

})(module);