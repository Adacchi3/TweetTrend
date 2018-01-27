var express = require('express');
var app = express();
var http = require('http').Server(app);
var PORT = process.env.PORT || 10080;
var MeCab = new require('mecab-async');
var mecab = new MeCab();
var jaccard = require('./jaccard'); 
var dice = require('./dice'); 
var simpson = require('./simpson');
var T = []; var k = 50; var n = 0; var c = {};
var gT = [];

var jac_idx = 0;
var dic_idx = 0;
var sim_idx = 0;

var client = require('./twitter');
var fs = require('fs');
var filename = "log"+Date.now()+".tsv";
fs.appendFileSync('./logs/'+filename, "time\t jaccard\t dice\t simpson\n");

MeCab.command = "mecab -d /usr/local/mecab/lib/mecab/dic/mecab-ipadic-neologd";
http.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.get("/", function(req, res, next){
    res.render("index",{});
})

var io = require('socket.io')(http);
io.sockets.on('connection', function(socket){
    socket.on('msg', function(data){
        io.sockets.emit('msg', data);
    });
});

//過去tweetを取得
app.get("/api/statuses/home_timeline", function(req, res, next){
    client.get('statuses/home_timeline', {}, function(error, tweets, response){
        if(!error){
            tweets.reverse().forEach(tweet => {
                io.sockets.emit('msg', tweet);
                //console.log(tweet);
                var text;
                if("retweeted_status" in tweet){
                    text = tweet.retweeted_status.text;
                    tweet.retweeted_status.entities.urls.forEach(url => {
                        text = text.replace(url.url,"");
                    });
                    if("extended_entities" in tweet.retweeted_status){
                        if("media" in tweet.retweeted_status.extended_entities){
                            tweet.retweeted_status.extended_entities.media.forEach(media => {
                                text = text.replace(media.url, "")
                            });
                        }
                    }
                }else{
                    text = tweet.text;
                    tweet.entities.urls.forEach(url => {
                        text = text.replace(url.url,"");
                    });
                    if("extended_entities" in tweet){
                        if("media" in tweet.extended_entities){
                            tweet.extended_entities.media.forEach(media => {
                                text = text.replace(media.url, "")
                            });
                        }
                    }
                }
                MeCab.parseFormat(text, function(err, morphs){
                    if(err) console.log(err);
                    morphs.map(function(morph){
                        //console.log(morph);
                        if(morph.lexical === '名詞'){
                            updateFrequency(morph.original);
                        }
                    });
                });
            });
        }else{
            console.log(error);
        }
    });
});

//トレンドの取得
app.get("/api/trends/grobal", function(req, res, next){
    client.get("trends/place.json", {"id": 23424856}, function(error, trends, response){
        if(!error){
            //console.log(trends);
            gT = [];
            res.json(trends);
            trends[0].trends.forEach( trend =>{
                MeCab.parseFormat(trend.name, function(err, morphs){
                    if(err) console.log(err);
                    morphs.map(function(morph){
                        if(morph.lexical === '名詞'){
                            addGrobalTrend(morph.original);
                        }
                    });
                });
            });
        }else{
            console.log(error);
        }
    });
});

//自身のTLのトレンドを取得
app.get("/api/trends/my", function(req, res, next){
    var json = [];
    T.forEach(word => {
        var obj = {"name": word, "url": "http://twitter.com/search?q="+encodeURIComponent(word)}
        json.push(obj);
    });
    res.json(json);
})

app.get("/api/score", function(req, res, next){
    var json = {"score": score};
    res.json(json);
})

//Stremingでtweetを取得
client.stream('user',function (stream) {
    stream.on('data',function (tweet) {
        io.sockets.emit('msg', tweet);
        //console.log(tweet);
        var text;
        if("retweeted_status" in tweet){
            text = tweet.retweeted_status.text;
            tweet.retweeted_status.entities.urls.forEach(url => {
                text = text.replace(url.url,"");
            });
            if("extended_entities" in tweet.retweeted_status){
                if("media" in tweet.retweeted_status.extended_entities){
                    tweet.retweeted_status.extended_entities.media.forEach(media => {
                        text = text.replace(media.url, "")
                    });
                }
            }
        }else{
            text = tweet.text;
            tweet.entities.urls.forEach(url => {
                text = text.replace(url.url,"");
            });
            if("extended_entities" in tweet){
                if("media" in tweet.extended_entities){
                    tweet.extended_entities.media.forEach(media => {
                        text = text.replace(media.url, "")
                    });
                }
            }
        }

        MeCab.parseFormat(tweet.text, function(err, morphs){
            if(err) console.log(err);
            morphs.map(function(morph){
                //console.log(morph);
                if(morph.lexical === '名詞'){
                    updateFrequency(morph.original);
                }
            });
        });
    });
    stream.on('error',function (e) {
        console.log(e);
    });
});

function addGrobalTrend(word){
    gT.push(word);
}

//Frequency Algorithm
function updateFrequency(word){ 
    n = n + 1;
    if(T.indexOf(word) >= 0){
        c[word] = c[word]+1;
    }else if(T.length<k-1){
        T.push(word);
        c[word] = 1;
    }else{
        T.forEach(w => {
            c[w] = c[w]-1;
            if(c[w]==0){
                var idx = T.indexOf(w);
                T.splice(idx,1);
            }
        });
    }
    jac_idx = jaccard(T,gT);
    dic_idx = dice(T,gT);
    sim_idx = simpson(T,gT);
    console.log(new Date()+", "+jac_idx+", "+dic_idx+", "+sim_idx);
    fs.appendFileSync('./logs/'+filename, new Date()+"\t "+jac_idx+"\t "+dic_idx+"\t "+sim_idx+"\t "+T+"\t "+gT+"\n");
}