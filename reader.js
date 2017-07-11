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


Reader.prototype._read = function () {
    this._paused = false
    this._signal.notify()
}

Reader.prototype._write = function (chunk) {
    this._paused = ! this.push(chunk)
}

module.exports = Reader
