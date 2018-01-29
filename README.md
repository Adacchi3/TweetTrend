# TweetTrend

A simple client for the Twitter [REST](https://dev.twitter.com/rest/public) and [Streaming](https://dev.twitter.com/streaming/overview) API's.

## Instrallation

`npm install`

## Quick Start

You will need valid Twitter developer credentials in the form of a set of consumer and access tokens/keys.

```javascript
var Twitter = require('twitter');
var client = new Twitter({
  consumer_key: '***',
  consumer_secret: '***',
  access_token_key: '***',
  access_token_secret: '***'
});
module.exports = client;
```

You could start this server after you make an above `.js` file.

`node app.js`
