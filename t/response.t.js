require('proof')(4, require('cadence')(prove))

function prove (async, assert) {
    var util = require('util')
    var stream = require('stream')
    var Response = require('../response')

    function Congested () {
        stream.Writable.call(this, { highWaterMark: 1 })
        this.buffers = []
    }

    util.inherits(Congested, stream.Writable)

    Congested.prototype._write = function (chunk, encoding, callback) {
        this.buffers.push(chunk)
        callback()
    }

    var congested = new Congested
    var response = new Response({
        events: new stream.PassThrough(),
        stream: congested
    })

    assert(response.getHeader('name') == null, 'get null header')
    response.setHeader('name', 'value')
    assert(response.getHeader('name'), 'value', 'set header')
    response.removeHeader('name')
    assert(response.getHeader('name') == null, 'header removed')

    async(function () {
        response.write(new Buffer('Hello, World!'), async())
    }, function () {
        assert(Buffer.concat(congested.buffers).toString(), 'Hello, World!', 'waited')
    })
}
