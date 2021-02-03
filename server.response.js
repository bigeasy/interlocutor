var stream = require('stream')
var util = require('util')
var assert = require('assert')
var http = require('http')
var Writer = require('./writer')
var { coalesce } = require('extant')

function Response (request, response) {
    this._request = request
    this.statusCode = 200
    this._headers = {}
    this._trailers = null
    this.headersSent = false
    Writer.call(this, response)
}
util.inherits(Response, Writer)

Response.prototype._sendHeaders = function () {
    if (!this.headersSent && !this._reader._dump) {
        this._reader._headersSent = true
        this._reader.statusCode = this.statusCode
        this._reader.statusMessage = coalesce(this.statusMessage, http.STATUS_CODES[this.statusCode])
        for (var name in this._headers) {
            this._reader.headers[name] = this._headers[name]
            this._reader.rawHeaders.push(name, this._headers[name])
        }
        this._request.emit('response', this._reader)
        this.headersSent = true
    }
}

Response.prototype._write = function (chunk, encoding, callback) {
    this._sendHeaders()
    Writer.prototype._write.call(this, chunk, encoding, callback)
}

Response.prototype.addTrailers = function (trailers) {
    this._reader._trailers = trailers
}

Response.prototype.getHeader = function (name) {
    return this._headers[name.toLowerCase()]
}

Response.prototype.removeHeader = function (name) {
    delete this._headers[name.toLowerCase()]
}

Response.prototype.setHeader = function (name, value) {
    this._headers[name.toLowerCase()] = value
}

Response.prototype.writeHead = function () {
    var vargs = Array.prototype.slice.call(arguments)
    this.statusCode = vargs.shift()
    if (typeof vargs[0] == 'string') {
        this.statusMessage = vargs.shift()
    }
    var headers = coalesce(vargs.shift(), {})
    for (var name in headers) {
        this._headers[name] = headers[name]
    }
    this._sendHeaders()
}

module.exports = Response
