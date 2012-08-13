var detective = require('detective');
var resolve = require('resolve');
var fs = require('fs');
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var complexityCost = require('./lib/complexity');
var syntaxError = require('syntax-error');
var commondir = require('commondir');

module.exports = function (dirs, cb) {
    if (!Array.isArray(dirs)) dirs = [ dirs ];
    
    dirs = dirs.map(function (d) {
        return path.resolve(d);
    });
    var dir = commondir(dirs);
    
    var emitter = new EventEmitter;
    
    emitter.total = 0;
    
    if (typeof cb === 'function') {
        var gotErrors = false;
        emitter.once('error', function (err) {
            gotErrors = true;
            cb(err);
        });
        
        emitter.on('end', function () {
            if (!gotErrors) cb(null, emitter.total);
        });
    }
    
    function record (price, desc) {
        emitter.total += price;
        emitter.emit('price', price, desc);
        emitter.emit('total', emitter.total);
    }
    
    var files = dirs.map(function (d) {
        return require.resolve(/\.js$/.test(d) ? d : d + '/')
    });
    
    process.nextTick(function (file) {
        record(100, 'initial stipend');
        
        (function next () {
            if (files.length === 0) {
                emitter.emit('end', emitter.total);
            }
            else walk(files.shift(), next)
        })();
    });
    
    var walked = {};
    
    function walk (file, fn) {
        walked[file] = true;
        
        fs.readFile(file, 'utf8', function (err, src) {
            if (err) return emitter.emit('error', err);
            src = src.replace(/^#![^\n]*/, '');
            
            var e = syntaxError(src, file);
            if (e) return emitter.emit('error', e);
            
            var rel = path.relative(dir, file);
            var costs = complexityCost(src);
            
            var sum = Object.keys(costs).sort().reduce(function (acc, key) {
                record(costs[key], key + ' cost for ' + rel);
                return acc + costs[key];
            }, 0);
            
            var deps = detective.find(src);
            
            deps.expressions.forEach(function (s) {
                record(-10, 'require(' + s + ') in ' + rel);
                emitter.emit('error', 'expression: require(' + s + ')'
                    + ' in file ' + file
                );
            });
            
            emitter.emit('file', sum, rel);
            
            var ds = deps.strings
                .filter(function (s) { return /^[\.\/]/.test(s) })
                .map(function (s) {
                    try {
                        return resolve.sync(s, {
                            basedir : path.dirname(file)
                        });
                    }
                    catch (err) {
                        emitter.emit('error', err + ' in file ' + file);
                        record(-100, 'path resolution error for '
                            + s + ' in ' + rel
                        );
                        return;
                    }
                })
                .filter(Boolean)
                .filter(function (s) { return !walked[s] })
            ;
            (function next () {
                if (ds.length === 0) fn()
                else walk(ds.shift(), next);
            })();
        });
    }
    
    return emitter;
};
