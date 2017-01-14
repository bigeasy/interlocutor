var util = require('util')
var Request = require('./request')
var Response = require('./response')
var stream = require('stream')
var events = require('events')

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
    var headers = options.headers || {}
    var input = new stream.PassThrough
    var request = new Request({
        httpVersion: options.httpVersion || '1.1',
        method: options.method || 'GET',
        url: options.url || '/',
        headers: headers,
        rawHeaders: options.rawHeaders || this._rawHeaders(headers),
        stream: input
    })
    var response = new Response({ events: input, stream: new stream.PassThrough })
    process.nextTick(this._middleware.bind(null, request, response))
    return input
}

module.exports = Interlocutor
