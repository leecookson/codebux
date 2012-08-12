var codebux = require('../');
var dir = process.argv[2] || process.cwd();
var path = require('path');
var Stream = require('stream');

var s = codebux(dir, function (err, total) {
    if (err) console.error(err)
    else console.log(Array(50).join('—') + '\n' + formatPrice(total))
});

s.on('price', function (price, desc) {
    console.log(formatPrice(price) + '  # ' + desc);
});

function formatPrice (n) {
    var s = String(Math.abs(n)).replace(/(\.\d{,2}|)$/, function (_, x) {
        return ('.' + (x || '') + '00').slice(0,3);
    });
    return (n >= 0 ? '+' : '-')
        + Array(Math.max(2, 8 - s.length)).join(' ') + s
    ;
}
