var jaccard = function(a, b){
    return intersection(a,b).length / union(a,b).length
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

var union = function(a, b){
    var x = [];
    var check = function(e, cb){
        if(!~x.indexOf(e))x.push(e);
        if(cb && typeof cb == 'function')cb(null);
    }
    a.forEach(check);
    b.forEach(check);
    return x;
}

module.exports = jaccard;