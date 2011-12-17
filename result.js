var
  util = require('util')
  assert = require('assert')

  mongo = require('mongoskin')

// create mongodb client
var db = mongo.db('mongo://twitter:twitter@localhost/twitter');
var tweets = db.collection('tweets');
var result = db.collection('result');

tweets.find().toArray(function (err, arr) {
  for (i in arr) {
    var elem = arr[i];
    result.insert({_id: elem._id, created_at: elem.created_at, text: elem.text});
  }
});
