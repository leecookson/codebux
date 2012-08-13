#!/usr/bin/env node

var codebux = require('../');
var path = require('path');
var Stream = require('stream');

var dirs = process.argv.slice(2);
if (dirs.length === 0) {
    return console.error([
        'usage: codebux [files or directories...]',
        '',
        'Recursively trace the static require() dependency graph for every file'
        + 'or directory provided.',
        ''
    ].join('\n'));
}

console.log(formatPrice(100) + '  # initial stipend');

var s = codebux(dirs);

var errors = [];

s.on('end', function (total) {
    console.log(Array(50).join('—') + '\n' + formatPrice(total))
});

s.on('error', function (err) {
    console.error('# error: ' + err);
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
