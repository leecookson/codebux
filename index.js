var detective = require('detective');
var resolve = require('resolve');
var fs = require('fs');
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var complexityCost = require('./lib/complexity');

module.exports = function (dir, cb) {
    dir = path.resolve(dir);
    var emitter = new EventEmitter;
    
    var total = 0;
    
    if (typeof cb === 'function') {
        emitter.once('error', function (err) {
            cb(err);
        });
        
        emitter.on('end', function () {
            cb(null, total);
        });
    }
    
    function record (price, desc) {
        total += price;
        emitter.emit('price', price, desc);
        emitter.emit('total', total);
    }
    
    process.nextTick(function (file) {
        record(100, 'initial stipend');
        walk(file, function () {
            emitter.emit('end');
        });
    }.bind(null, require.resolve(/\.js$/.test(dir) ? dir : dir + '/')));
    
    var walked = {};
    
    function walk (file, fn) {
        walked[file] = true;
        emitter.emit('file', file);
        
        fs.readFile(file, 'utf8', function (err, src) {
            if (err) return emitter.emit('error', err);
            
            var rel = path.relative(dir, file);
            var costs = complexityCost(src);
            Object.keys(costs).sort().forEach(function (key) {
                record(costs[key], key + ' cost for ' + rel);
            });
            
            var deps = detective.find(src);
            
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
