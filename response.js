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

Response.prototype.addTrailers = function () {
}

Response.prototype.getHeader = function () {
}

Response.prototype.removeHeader = function () {
}

Response.prototype.setHeader = function () {
}

Response.prototype.setTimeout = function () {
}

Response.prototype.writeContinue = function () {
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
