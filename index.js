const SlashtagsURL = require('@synonymdev/slashtags-url')
const Noise = require('noise-handshake')
const edCurve = require('noise-curve-ed')
const fetch = require('./fetch/fetch.js')

/**
 * Send request to server
 * @param {string} method
 * @param {string} url
 * @param {object} params
 * @param {object} keypair
 * @param {object} [headers]
 * @param {object} [curve]
 * @param {object} [prologue]
 * @returns {object} response
 */
async function sendRequest ({
  method,
  url,
  params,
  keypair,
  headers = { 'Content-Type': 'application/json'},
  curve = edCurve,
  prologue = Buffer.alloc(0)
}) {
  const initiator = new Noise('IK', true, keypair, { curve })
  const parsed = SlashtagsURL.parse(url)

  initiator.initialise(prologue, parsed.key)
  const payload = initiator.send(Buffer.from(JSON.stringify(params))).toString('hex')

  const res = await fetch(parsed.query.relay + parsed.path, {
    headers,
    method: 'POST',
    body: JSON.stringify({ method, params: payload })
  })

  let body = await res.json()
  if (body.error) throw new Error(body.error.message)
  if (!body.result) throw new Error('No result in response')

  return JSON.parse(initiator.recv(Buffer.from(body.result, 'hex')).toString())
}

module.exports = {
  sendRequest
}
