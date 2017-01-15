var stream = require('stream')
var util = require('util')
var assert = require('assert')

function Response (options) {
    this._events = options.events
    this._stream = options.stream
    this._stream.statusCode = 200
    this._stream.statusMessage = null
    this._stream.headers = {}
    this._stream.trailers = null
    this.headersSent = false
    this.once('finish', this._finished.bind(this))
    this.once('error', this._erroneous.bind(this))
    stream.Writable.call(this)
}
util.inherits(Response, stream.Writable)

Response.prototype._sendHeaders = function () {
    if (!this.headersSent) {
        this._events.emit('response', this._stream)
        this.headersSent = true
    }
}

Response.prototype._write = function (chunk, encoding, callback) {
    this._sendHeaders()
    assert(encoding == 'buffer', 'strings not encoded')
    if (this._stream.write(chunk)) {
        callback()
    } else {
        this._stream.once('drain', callback)
    }
}

Response.prototype._finished = function () {
    this._stream.emit('end')
}

Response.prototype._erroneous = function (error) {
    this._stream.emit('error', error)
}

Response.prototype.addTrailers = function (trailers) {
    this._stream.trailers = trailers
}

Response.prototype.getHeader = function (name) {
    return this._stream.headers[name.toLowerCase()]
}

Response.prototype.removeHeader = function (name) {
    delete this._stream.headers[name.toLowerCase()]
}

Response.prototype.setHeader = function (name, value) {
    this._stream.headers[name.toLowerCase()] = value
}

Response.prototype.setTimeout = function () {
}

Response.prototype.writeContinue = function () {
    this._events.emit('continue')
}

Response.prototype.writeHead = function () {
    var vargs = Array.prototype.slice.call(arguments)
    this._stream.statusCode = vargs.shift()
    var statusMessage = vargs.shift()
    if (statusMessage != null) {
        this._stream.statusMessage = statusMessage
    }
    var headers = vargs.shift() || {}
    for (var name in headers) {
        this._stream.headers[name] = headers[name]
    }
}

module.exports = Response
