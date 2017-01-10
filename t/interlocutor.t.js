require('proof/redux')(1, require('cadence')(prove))

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
    })
}
