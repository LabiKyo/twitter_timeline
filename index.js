var
  util = require('util')
  EventEmitter = require('events').EventEmitter

  Twitter = require('twitter')
  mongo = require('mongoskin')

  settings = require('./settings')

// create twitter client
var twitter = new Twitter({
  consumer_key: settings.consumer_key,
  consumer_secret: settings.consumer_secret,
  access_token_key: settings.access_token_key,
  access_token_secret: settings.access_token_secret
});

// create mongodb client
var db = mongo.db('mongo://twitter:twitter@localhost/twitter');
var tweets = db.collection('tweets');
var record = db.collection('record');

// start running
get_status_less_than();

function get_status_less_than(max_id) {
  console.log('it starts at max id = ', max_id);
  var min_id = Infinity;
  var params = {
    screen_name: settings.screen_name,
    trim_user: true,
    count: settings.count,
    exclude_replies: true,
    contributor_details: false,
  };
  if (max_id !== undefined) {
    params['max_id'] = max_id;
  }
  twitter.get('/statuses/user_timeline.json',
    params,
    function (data) {
      var promise = new EventEmitter();
      var i;
      promise.count = 0;
      promise.on('end', function () {
        console.log('it ends now! min id = ', min_id);
        get_status_less_than(min_id);
      });
      for (i in data) {
        var tweet = data[i];
        tweet._id = tweet.id;
        if (tweet.id < min_id) {
          min_id = tweet.id;
        }
        tweets.insert(tweet, function (err, docs) {
          if (err) throw err;
          ++promise.count;
          if (promise.count === settings.count) {
            promise.emit('end');
          }
        });
      }
    }
  );
}
