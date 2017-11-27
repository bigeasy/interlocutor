var util = require('util')
var Reader = require('./reader')

function Response () {
    this.headers = {}
    this.rawHeaders = []
    this.trailers = null
    this._trailers = null
    this.once('end', function () { this.trailers = this._trailers }.bind(this))
    Reader.call(this)
}
util.inherits(Response, Reader)

module.exports = Response
