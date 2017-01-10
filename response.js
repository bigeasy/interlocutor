var stream = require('stream')
var util = require('util')

function Response (options) {
    this._events = options.events
    this._stream = new stream.PassThrough
    this.statusCode = 200
    this.statusMessage = 'OK'
    this._headers = {}
    this.headersSent = false
    stream.Writable.call(this)
}
util.inherits(Response, stream.Writable)

Response.prototype._write = function (chunk, encoding, callback) {
    if (!this.headersSent) {
        this._stream.headers = this._headers
        this._stream.statusCode = this.statusCode
        this._stream.statusMessage = this.statusMessage
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
