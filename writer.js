// Node.js API.
var stream = require('stream')
var util = require('util')

// Control-flow utilities.
var cadence = require('cadence')

function Writer (reader) {
    this._reader = reader
    stream.Writable.call(this)
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
