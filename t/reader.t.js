require('proof')(5, require('cadence')(prove))

function prove (async, okay) {
    var Writer = require('../writer')
    var Reader = require('../reader')
    var reader = new Reader({ highWaterMark: 1 })
    var writer = new Writer(reader)
    var buffer
    buffer = reader.read()
    okay(buffer, null, 'empty')
    reader.once('readable', function () {
        var buffer
        buffer = reader.read(1)
        okay(buffer.toString(), 'x', 'read')
        buffer = reader.read(1)
        okay(buffer, null, 'read empty')
    })
    async(function () {
        writer.write(new Buffer('x'), async())
    }, function () {
        writer.write(new Buffer('y'), async())
    }, function () {
        writer.write(new Buffer('z'), async())
        buffer = reader.read(1)
        okay(buffer.toString(), 'y', 'read')
    }, function () {
        okay(true, 'resumed')
    })
}
