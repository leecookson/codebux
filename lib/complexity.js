var falafel = require('falafel');

module.exports = function (src) {
    return {
        lines : lines(src),
        nested : nested(src)
    };
};

function lines (src) {
    var n = src.split('\n').filter(function (line) {
        return /\S/.test(line);
    }).length
    return -Math.pow(n, 1.2) / 50;
}

function nested (src) {
    var costs = {
        FunctionDeclaration : 4,
        FunctionExpression : 4,
        ForStatement : 5,
        WhileStatement : 5,
        Literal : 2,
        IfStatement : 3,
        SwitchStatement : 20
    };
    
    var sum = 0;
    falafel(src, function (node) {
        sum -= parents(node)
            .slice(1)
            .reduce(function (sum, p) {
                return sum * (costs[p.type] || 1.05);
            }, 0.1)
            / 500
        ;
    });
    return sum;
}

function parents (node) {
    for (var res = []; node.parent; node = node.parent) {
        res.push(node.parent);
    }
    return res;
}
