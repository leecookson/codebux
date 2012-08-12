var detective = require('detective');
var fs = require('fs');
var path = require('path');
var Stream = require('stream');

module.exports = function (dir, cb) {
    var stream = new Stream;
    stream.readable = true;
    
    var total = 0;
    
    if (typeof cb === 'function') {
        stream.once('error', function (err) {
            cb(err);
        });
        
        stream.on('end', function () {
            cb(null, total);
        });
    }
    
    function record (price, desc) {
        total += price;
        stream.emit('data', {
            price : price,
            description : desc,
            total : total
        });
    }
    
    process.nextTick(function () {
        record(100, 'initial stipend');
    });
    
    var pending = 0;
    (function walk (file) {
        pending ++;
        fs.readFile(file, function (err, src) {
            if (err) return stream.emit('error', err);
            
            var deps = detective(src);
            console.dir(deps);
            
            if (--pending === 0) stream.emit('end');
        });
    })(require.resolve(dir + '/'));
    
    return stream;
};
