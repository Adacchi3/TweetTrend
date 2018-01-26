var jaccard = require("../jaccard");
var a = ["a","b","c"];
var b = ["a","b","d","e"];
var score = jaccard(a, b);
console.log(score);