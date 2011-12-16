var
  assert = require('assert')

exports = module.exports = settings = {
  consumer_key: undefined,
  consumer_secret: undefined,
  access_token_key: undefined,
  access_token_secret: undefined,
  screen_name: undefined,
  count: undefined,
}

assert(settings.consumer_key, 'You MUST define your consumer key');
assert(settings.consumer_secret, 'You MUST define your consumer secret');
assert(settings.access_token_key, 'You MUST define your access token key');
assert(settings.access_token_secret, 'You MUST define your access token secret');
assert(settings.screen_name, 'You MUST define the destination screen name');
assert(settings.count, 'You MUST define the count of tweets of each request');
assert(settings.count <= 200, 'The count MUST less equal to 200');
