require('proof')(3, prove)

async function prove (okay) {
    const callback = require('comeuppance')
    var Writer = require('../writer')
    var Reader = require('../reader')
    var reader = new Reader({ highWaterMark: 1 })
    var writer = new Writer(reader)
    var buffer
    buffer = reader.read()
    okay(buffer, null, 'empty')
    const gathered = []
    function read () {
        for (;;) {
            const buffer = reader.read(1)
            if (buffer == null) {
                break
            }
            gathered.push(String(buffer))
        }
    }
    reader.on('readable', function () {
        read()
    })
    const promise = {}
    const end = new Promise(resolve => promise.end = resolve)
    reader.on('end', function () {
        okay('ended')
        promise.end.call()
    })
    writer.write(Buffer.from('x'))
    writer.write(Buffer.from('y'))
    const wrote = callback(callback => writer.write(Buffer.from('z'), callback))
    read()
    await wrote
    writer.end()
    await end
    okay(gathered, [ 'x', 'y', 'z' ], 'gathered')
}
