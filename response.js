var stream = require('stream')
var util = require('util')
var assert = require('assert')
var http = require('http')
var Writer = require('./writer')
var coalesce = require('extant')

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
    if (!this.headersSent) {
        this.statusCode = this.statusCode
        this.statusMessage = coalesce(this.statusMessage, http.STATUS_CODES[this.statusCode])
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
    this._reader.statusCode = vargs.shift()
    if (typeof vargs[0] == 'string') {
        this._reader.statusMessage = vargs.shift()
    }
    var headers = vargs.shift() || {}
    for (var name in headers) {
        this._reader.headers[name] = headers[name]
    }
}

module.exports = Response
