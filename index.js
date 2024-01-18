const SlashtagsURL = require('@synonymdev/slashtags-url')
const Noise = require('noise-handshake')
const edCurve = require('noise-curve-ed')
const fetch = require('./fetch/fetch.js')
const b4a = require('b4a')
const { TextDecoder } = require('util')

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
  prologue = b4a.alloc(0)
}) {
  const initiator = new Noise('IK', true, keypair, { curve })
  const parsed = SlashtagsURL.parse(url)

  initiator.initialise(prologue, parsed.key)
  const buffer = initiator.send(b4a.from(JSON.stringify(params)))
  const payload = b4a.toString(buffer, 'hex');

  const res = await fetch(parsed.query.relay + parsed.path, {
    headers,
    method: 'POST',
    body: JSON.stringify({ method, params: payload })
  })

  let body = await res.json()
  if (body.error) throw new Error(body.error.message)
  if (!body.result) throw new Error('No result in response')

  const result = b4a.from(body.result, 'hex');

  const payloadEncrypted = initiator.recv(result);

  const decoder = new TextDecoder();
  const decoded = decoder.decode(payloadEncrypted);

  return JSON.parse(decoded)
}
module.exports = {
  sendRequest
}
