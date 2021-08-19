// Base class for Server Request and Client Response. Perhaps it is analogous to
// IncomingMessage in the Node.js API.

// Node.js API.
var util = require('util')
var stream = require('stream')
const noop = require('nop')

// Return the first non-null-like value.
var { coalesce } = require('extant')

function Reader (options) {
    this._dump = false
    this._unpaused = noop
    stream.Readable.call(this, coalesce(options, {}))
}
util.inherits(Reader, stream.Readable)


// The `_read` method is supposed to asynchronously import from the underlying
// data source by reading and calling `push` with the data. It is supposed to
// stop when `push` returns `false`. You can imagine `_read` asynchronously
// pulling data off the file system but we're not going to do that. We instead
// signal our paired `Writer` to write to our `_write` method below.
Reader.prototype._read = function () {
    this._paused = false
    this._unpaused.call()
    this._unpaused = noop
}

Reader.prototype._write = function (chunk) {
    if (! this._dump) {
        this._ended = chunk == null
        this._paused = ! this.push(chunk)
    }
}

module.exports = Reader
