var codebux = require('../');
var dir = process.argv[2] || process.cwd();
var Stream = require('stream');

var priceStream = new Stream;
priceStream.writable = true;
priceStream.write = function (rec) {
    var p = formatPrice(rec.price);
    console.log(
        Array(10 - p.length).join(' ')
        + p + '  # ' + rec.description
    );
};
priceStream.end = function () {};
priceStream.destroy = function () {};

var s = codebux(dir, function (err, total) {
    if (err) console.error(err)
    else console.log('\ntotal: ' + formatPrice(total))
});
s.pipe(priceStream);

function formatPrice (n) {
    return (n >= 0 ? '+' : '') + String(n)
        .replace(/(\.\d{,2}|)$/, function (_, x) {
            return ('.' + (x || '') + '00').slice(0,3);
        })
    ;
}
