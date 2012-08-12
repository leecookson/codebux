#!/usr/bin/env node

var codebux = require('../');
var dir = process.argv[2];
var path = require('path');
var Stream = require('stream');

if (process.argv.length === 2) {
    return console.error('usage: codebux [file or directory]');
}

console.log(formatPrice(100) + '  # initial stipend');

var s = codebux(dir, function (err, total) {
    if (err) console.error(err)
    else console.log(Array(50).join('—') + '\n' + formatPrice(total))
});

s.on('file', function (price, file) {
    console.log(formatPrice(price) + '  # ' + file);
});

function formatPrice (n) {
    var s = String(Math.abs(n));
    if (!/\./.test(s)) s += '.';
    s += '00';
    s = s.replace(/(\.\d{2})\d+/, '$1');
    return (n >= 0 ? '+' : '-')
        + Array(Math.max(2, 10 - s.length)).join(' ') + s
    ;
}
