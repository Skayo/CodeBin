import axios from 'axios'
import notie from 'notie'

export default async function({ method = 'GET', endpoint, token, data, errCb = () => {}}) {
  let headers = {};
  if (token) {
    headers.Authorization = 'token ' + token;
  }

  try {
    return await axios(`https://api.github.com/${endpoint}`, {
      method,
      headers,
      data
    }).then(res => res.data)
  } catch (err) {
    errCb()
    if (err.response) {
      const { headers, status } = err.response
      if (!token && status === 403 && headers['x-ratelimit-remaining'] === '0') {
        notie.confirm({
          text: 'API rate limit exceeded, do you want to login?',
          submitCallback() {
            Event.$emit('showLogin')
          }
        })
      } else {
        notie.alert({
          type: 'error',
          text: err.response.data.message,
          time: 5
        })
      }
    } else {
      notie.alert({
        type: 'error',
        text: err.message || 'GitHub API Error'
      })
    }
  }

  return {}
}
