const GET = require('get-then')
const headers = {
  // GitHub wants a User-Agent specified
  'User-Agent': 'github-event-poller v' + require('./package.json').version,

  // gets added/updated below
  'If-Modified-Since': ''
}

module.exports = function (url, callback, customInterval) {
  if (!url || !/^https:\/\/([^@]+@)?api\.github\.com\//i.test(url)) throw new Error('You must specify a GitHub API url to poll')

  customInterval = typeof customInterval === 'function'
    ? customInterval
    : (interval) => interval

  function poll () {
    return GET(url, headers)
    .catch((e) =>
      // allow 304s through
      e.statusCode === 304 ? e : Promise.reject(e)
    )
    .then(res => {
      if (res.headers['last-modified']) {
        headers['If-Modified-Since'] = res.headers['last-modified']
      }
      // Get GitHub's desired polling interval
      const interval = +(res.headers['x-poll-interval'] || '60')
      const reset = new Date(parseInt(res.headers['x-ratelimit-reset'] + '000'))
      const minutes = ((reset - Date.now()) / 60000).toFixed(2)
      callback({
        data: JSON.parse(String(res) || '[]'), // 304s will be an empty buffer
        limit: +res.headers['x-ratelimit-limit'],
        remaining: +res.headers['x-ratelimit-remaining'],
        reset: minutes + 'm',
        interval
      })
      return customInterval(interval) || 60
    })
    .catch(module.onerror)
    .then((seconds) => {
      if (seconds > 0) {
        setTimeout(poll, seconds * 1000)
      }
    })
    .catch(console.error) // catch complete failure scenario
  }

  poll()
}

// allow override
module.onerror = function logError (e) {
  console.error('Error getting events from GitHub')
  if (e) {
    console.error(e.headers)
    console.error(Buffer.isBuffer(e) ? String(e) : e)
  }
  // retry in 2 minutes
  return 120
}

