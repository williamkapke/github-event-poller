# github-event-poller
This module polls GitHub Events APIs while obeying GitHub's polling rules.

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

## Install It...
```
$ npm install --save github-event-poller
```

## Use it..

### poller(url, callback, customInterval)
**`url`**:
- It does not make much of an effort to validate the url you provide.
- Insert your API token in the URL to get the increased rate limit.
- Use a url from:
https://developer.github.com/v3/activity/events

**`callback`**:

The callback will be called with the results each time the url is polled. If 
there are no changes (`304 Not Modified`) the result data will be an empty array.

**`customInterval`**:

An optional function that is passed GitHub's requested interval limit and returns the number of seconds until the next poll.
e.g.: `(interval) => 60 // seconds`

### Example
```javascript
const poller = require('github-event-poller');
const url = `https://api.github.com/repos/nodejs/node/events?per_page=10`

poller(url, ({data, limit, remaining, reset, interval}) => {
  console.log('Rate Limit:', JSON.stringify({limit, remaining, reset, interval}))
  console.log(data) // will be empty if the API returns a 304 Not Modified
})

// override the default error handler
poller.onerror = (error) => {
  console.log(error)
  return 60 // the number of seconds to wait before trying again
}
```

## License
MIT
