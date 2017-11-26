var util = require('util')

var Writer = require('./writer')

function Request (reader, response) {
    this._response = response
    Writer.call(this, reader)
}
util.inherits(Request, Writer)

Request.prototype.abort = function () {
    // Mark as aborted.
    this.emit('abort')
    this.aborted = Date.now()

    // Any writes to the client request will now be dumped.
    this._reader._dump = true

    // Get the server response which is going to receive our cancel.
    this._response._dump = true

    // Hmm… What do we do if we have already ended?
    if (!this._reader._ended) {
        this._reader.emit('aborted')
        this._reader.emit('close')
    }

    // If the response has sent headers, it means we created a client response.
    // That client response is going to need to get a close (or something.)
    if (this._response._headersSent && !this._response._ended) {
        this._response.emit('aborted')
        this._response.emit('end')
        this._response.emit('close')
    }
}

module.exports = Request
