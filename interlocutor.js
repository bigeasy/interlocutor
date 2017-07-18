var util = require('util')
var Client = {
    Request: require('./client.request'),
    Response: require('./client.response')
}
var Server = {
    Request: require('./request'),
    Response: require('./response')
}
var stream = require('stream')
var events = require('events')
var coalesce = require('extant')

function Interlocutor (middleware) {
    this._middleware = middleware
}
util.inherits(Interlocutor, events.EventEmitter)

Interlocutor.prototype._rawHeaders = function (headers) {
    var rawHeaders = []
    for (var name in headers) {
        rawHeaders.push(name, headers[name])
    }
    return rawHeaders
}

Interlocutor.prototype.request = function (options) {
    var headers = coalesce(options.headers, {})
    var input = new stream.PassThrough
    var server = { request: null, response: null }
    var client = { request: null, response: null }
    server.request = new Server.Request({
        httpVersion: coalesce(options.httpVersion, '1.1'),
        method: coalesce(options.method, 'GET'),
        // TODO Should be `path`.
        url: coalesce(options.url || '/'),
        headers: headers,
        rawHeaders: coalesce(options.rawHeaders, this._rawHeaders(headers))
    })
    client.request = new Client.Request(server.request)
    client.response = new Client.Response
    server.response = new Server.Response(client.request, client.response)
    process.nextTick(this._middleware.bind(null, server.request, server.response))
    return client.request
}

module.exports = Interlocutor
