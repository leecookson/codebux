module.exports = function (src) {
    return { lines : lines(src) };
};

function lines (src) {
    var n = src.split('\n').filter(function (line) {
        return /\S/.test(line);
    }).length
    return -Math.pow(n, 1.2) / 50;
}
