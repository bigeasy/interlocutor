// Node.js API.
var stream = require('stream')
var util = require('util')

function Writer (reader) {
    stream.Writable.call(this)
    this.aborted = null
    this._reader = reader
    this._chunks = []
    this.once('finish', function () { reader._write(null) })
}
util.inherits(Writer, stream.Writable)

// Write is simply an async write of the given buffer. The only asynchronous
// action in our implementation it to wait for a notification from our reader if
// it is paused.
Writer.prototype._write = function (chunk, encoding, callback) {
    const write = () => {
        while (this._chunks.length != 0) {
            const { chunk, callback } = this._chunks.shift()
            this._reader._write(chunk)
            callback()
        }
    }
    this._chunks.push({ chunk: chunk, callback: callback })
    if (this._reader._paused) {
        this._reader._unpaused = write
    } else {
        write()
    }
}

module.exports = Writer
