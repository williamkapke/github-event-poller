require('dotenv').load({ silent: true })
const org = process.env.ORG
const auth = process.env.GITHUB_TOKEN

const poller = require('./poll.js');
// const url = `https://api.github.com/events?per_page=1`
const url = `https://api.github.com/repos/nodejs/node/events?per_page=1`
// const url = `https://api.github.com/repos/nodejs/node/issues/events?per_page=1`
// const url = `https://api.github.com/networks/nodejs/node/events?per_page=1`
// const url = `https://api.github.com/users/trott/received_events?per_page=1`
// const url = `https://api.github.com/users/trott/events?per_page=1`
// const url = `https://${auth}@api.github.com/orgs/${org}/events?per_page=1`

poller(url, ({data, limit, remaining, reset, interval}) => {
  console.log('Rate Limit:', JSON.stringify({limit, remaining, reset, interval}))
  console.log(data) // will be empty if the API returns a 304 Not Modified
})
