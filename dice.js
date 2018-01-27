var dice = function(a, b){
    return 2*(intersection(a,b).length) / (a.length + b.length)
}

var intersection = function(a, b){
    var x = [];
    var check = function(e, cb){
        if(~b.indexOf(e))x.push(e);
        if(cb && typeof cb == 'function')cb(null);
    };
    a.forEach(check);
    return x;
}

module.exports = dice;