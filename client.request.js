var util = require('util')

var Writer = require('./writer')

function Request (response) {
    Writer.call(this, response)
}
util.inherits(Request, Writer)

Request.prototype.abort = function () {
    this._abort()
}

module.exports = Request
