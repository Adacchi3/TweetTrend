var simpson = function(a, b){
    return intersection(a,b).length / Math.min(a.length,b.length)
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

module.exports = simpson;