/*jslint node:true*/
(function (options) {
    'use strict';
    var highlander = require('highlander'),
        classBuilder = require('ryoc'),
        _ = require('lodash');

    var ModelClass = classBuilder()
        .construct(function (){
            this.entries = {};
        })
        .method('getEntry', function (key){
            return this.entries[key] || null;
        })
        .method('getAllEntries', function (){
            return _(this.entries).values().value();
        })
        .toClass();
    

    module.exports.create = function (options) {
        options.model = ModelClass();
        return highlander.repository(options)
            .registerCommand('blobstore-add', {
                validate: function (ctx, callback){
                    callback();
                },
                execute: function (ctx, callback) {
                    var model = ctx.model;
                    var entry = ctx.args;
                    model.entries[entry.key] = entry;
                    callback(null, entry);
                }
            });
    };

})(module);