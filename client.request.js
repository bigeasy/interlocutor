var util = require('util')

var Writer = require('./writer')

function Request (response) {
    Writer.call(this, response)
}
util.inherits(Request, Writer)

module.exports = Request
