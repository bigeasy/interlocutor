require('proof/redux')(3, require('cadence')(prove))

function prove (async, assert) {
    var delta = require('delta')
    var Interlocutor = require('..')
    var interlocutor = new Interlocutor(function (request, response) {
        var message = new Buffer('Hello, World!')
        response.writeHead(200, 'OK', { 'content-length': message.length })
        response.write(message)
        response.end()
    })
    async(function () {
        var request = interlocutor.request({ url: '/' })
        delta(async()).ee(request).on('response')
        request.end()
    }, function (response) {
        assert(response.headers, {}, 'headers')
        async(function () {
            delta(async()).ee(response).on('data', []).on('end')
        }, function (data) {
            assert(Buffer.concat(data).toString(), 'Hello, World!', 'body')
            assert(response.footers, null, 'null footer')
        })
    })
}
