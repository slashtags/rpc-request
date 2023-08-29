# Noise RPC request


```
sendRequest ({
  method, // rpc method
  url, // slashtags url
  params, // request params
  keypair, // slashtags keypair
  serverPublicKey, // server public key
  headers = { 'Content-Type': 'application/json'},
  curve = edCurve, // key type
  prologue = Buffer.alloc(0) // handshake prologue
})
```
