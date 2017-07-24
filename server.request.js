var util = require('util')
var Reader = require('./reader')

function Request (options) {
    this.headers = options.headers
    this.httpVersion = options.httpVersion
    this.method = options.method
    this.url = options.url
    this.rawHeaders = options.rawHeaders
    this._stream = options.stream
    Reader.call(this)
}
util.inherits(Request, Reader)

module.exports = Request
