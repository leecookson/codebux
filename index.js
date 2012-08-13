var detective = require('detective');
var resolve = require('resolve');
var fs = require('fs');
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var complexityCost = require('./lib/complexity');
var syntaxError = require('syntax-error');

module.exports = function (dir, cb) {
    dir = path.resolve(dir);
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
    
    process.nextTick(function (file) {
        record(100, 'initial stipend');
        walk(file, function () {
            emitter.emit('end', emitter.total);
        });
    }.bind(null, require.resolve(/\.js$/.test(dir) ? dir : dir + '/')));
    
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
                emitter.emit('error', 'expression: require(' + s + ')'
                    + ' in file ' + file
                );
            });
            
            emitter.emit('file', sum, rel);
            
            var ds = deps.strings
                .filter(function (s) { return /^[\.\/]/.test(s) })
                .map(function (s) {
                    return resolve.sync(s, {
                        basedir : path.dirname(file)
                    });
                })
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
