require('proof')(8, prove)

async function prove (okay) {
    const callback = require('prospective/callback')
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
    const promise = {}
    const end = new Promise(resolve => promise.end = resolve)
    reader.on('end', function () {
        okay('ended')
        promise.end.call()
    })
    await callback(callback => writer.write(Buffer.from('x'), callback))
    await callback(callback => writer.write(Buffer.from('y'), callback))
    const wrote = callback(callback => writer.write(Buffer.from('z'), callback))
    buffer = reader.read(1)
    okay(buffer.toString(), 'y', 'read')
    await wrote
    okay(reader.read(1).toString(), 'z', 'last')
    okay(reader.read(1), null, 'past last')
    writer.end()
    okay(reader.read(1), null, 'read end')
    await end
}
