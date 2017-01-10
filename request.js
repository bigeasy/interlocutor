var util = require('util')
var stream = require('stream')

function Request (options) {
    this.headers = options.headers
    this.httpVersion = options.httpVersion
    this.method = options.method
    this.url = options.url
    this.rawHeaders = options.rawHeaders
    this._stream = options.stream
    this._stream.on('readable', this.read.bind(this, 0))
    this._stream.on('end', this.push.bind(this, null))
    stream.Readable.call(this)
}
util.inherits(Request, stream.Readable)

Request.prototype._read = function (n) {
    for (;;) {
        var chunk = this._stream.read(0)
        if (chunk == null) {
            this.push(new Buffer(0))
            break
        } else if (!this.push(chunk)) {
            break
        }
    }
}

Request.prototype.setTimeout = function (msecs, callback) {
}

module.exports = Request
