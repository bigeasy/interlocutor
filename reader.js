// Base class for Server Request and Client Response. Perhaps it is analogous to
// IncomingMessage in the Node.js API.

// Node.js API.
var util = require('util')
var stream = require('stream')

// An evented semaphore.
var Signal = require('signal')

var coalesce = require('extant')

function Reader (options) {
    this._signal = new Signal
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
    this._signal.notify()
}

Reader.prototype._write = function (chunk) {
    this._paused = ! this.push(chunk)
}

module.exports = Reader
