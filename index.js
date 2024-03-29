var
  util = require('util')
  EventEmitter = require('events').EventEmitter
  assert = require('assert')

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

record.findOne({min: {$exists: true}}, function (err, data) {
  var min;
  if (!data) {
    min = undefined;
  } else {
    min = data.min;
  }
  get_status_less_than(min);
});

var params = {
  screen_name: settings.screen_name,
  trim_user: true,
  count: settings.count,
  exclude_replies: true,
  contributor_details: false,
};

// start running
function get_status_less_than(max_id) {
  console.log('\n\nit starts at max id = ', max_id, (max_id - 1));
  var min_id = Infinity;
  if (max_id !== undefined) {
    params['max_id'] = (max_id - 1);
  }
  twitter.get('/statuses/user_timeline.json',
    params,
    function (data) {
      console.log('data length: ', data.length);
      var promise = new EventEmitter();
      var i;
      promise.count = 0;
      promise.on('end', function () {
        console.log('it ends now! min id = ', min_id, '\n\n');
        /*
        if (data.length < settings.count) {
          console.error('[ERROR]It doesn\'t contain ', settings.count, ' tweets this request! Exit!');
          return;
        }
        */
        record.update({min: {$exists: true}}, {$set: {min: min_id}}, {upsert: true}, function () {
          get_status_less_than(min_id);
        });
      });

      // insert every data into db
      for (i in data) {
        var tweet = data[i];
        tweet._id = tweet.id;
        console.log('Dealing with id ', tweet.id);
        if (tweet.id < min_id) {
          min_id = tweet.id;
        }
        tweets.insert(tweet, function (err, docs) {
          if (err) throw err;
          console.log('Done with id ', tweet.id, ', now counts = ', promise.count);
          ++promise.count;
          if (promise.count === data.length) {
            promise.emit('end');
          }
        });
      }
    }
  );
}

