// Node.js API.
var stream = require('stream')
var util = require('util')

// Control-flow utilities.
var cadence = require('cadence')

function Writer (reader) {
    stream.Writable.call(this)
    this._reader = reader
    this.once('finish', function () { reader._write(null) })
}
util.inherits(Writer, stream.Writable)

Writer.prototype._write = cadence(function (async, chunk, encoding) {
    async(function () {
        if (this._reader._paused) {
            this._reader._signal.wait(async())
        }
    }, function () {
        this._reader._write(chunk)
    })
})

module.exports = Writer
