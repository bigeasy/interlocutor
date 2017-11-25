var util = require('util')

var Writer = require('./writer')

function Request (response) {
    Writer.call(this, response)
}
util.inherits(Request, Writer)

Request.prototype.abort = function () {
    // Mark as aborted.
    this.emit('abort')
    this.aborted = Date.now()

    // Any writes to the client request will now be dumped.
    this._reader.dump = true

    // Get the server response which is going to receive our cancel.
    var response = this._reader.response
    response._reader.dump = true

    // Hmm… What do we do if we have already ended?
    if (!this._reader._ended) {
        this._reader.emit('aborted')
        this._reader.emit('close')
    }

    // If the response has sent headers, it means we created a client response.
    // That client response is going to need to get a close (or something.)
    if (response.sentHeaders) {
        response._reader.emit('aborted')
        response._reader.emit('end')
        response._reader.emit('close')
    }
}

module.exports = Request
