require('proof')(8, require('cadence')(prove))

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
    var end = async()
    reader.on('end', function () {
        okay('ended')
        end()
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
        okay(reader.read(1).toString(), 'z', 'last')
        okay(reader.read(1), null, 'past last')
        writer.end()
        okay(reader.read(1), null, 'read end')
    })
}
