var stream = require('stream')
var util = require('util')

function Response (options) {
    this._events = options.events
    this._stream = new stream.PassThrough
    this._stream.statusCode = 200
    this._stream.statusMessage = 'OK'
    this._stream.headers = {}
    this._stream.trailers = null
    this.headersSent = false
    this.once('finish', this._finished.bind(this))
    this.once('error', this._erroneous.bind(this))
    stream.Writable.call(this)
}
util.inherits(Response, stream.Writable)

Response.prototype._write = function (chunk, encoding, callback) {
    if (!this.headersSent) {
        this._events.emit('response', this._stream)
    }
    if (encoding != 'buffer') {
        chunk = chunk.toString(encoding)
    }
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
}

module.exports = Response
