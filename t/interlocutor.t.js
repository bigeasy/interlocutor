require('proof/redux')(6, require('cadence')(prove))

function prove (async, assert) {
    var delta = require('delta')
    var cadence = require('cadence')
    var Interlocutor = require('..')
    var interlocutor = new Interlocutor(function (request, response) {
        switch (request.headers.select) {
        default:
            var message = new Buffer('Hello, World!')
            var vargs = [ 200 ]
            var headers = {}
            for (var name in request.headers) {
                if (name == 'status-message') {
                    vargs.push(request.headers[name])
                } else {
                    headers[name] = request.headers[name]
                }
            }
            if (Object.keys(headers).length != 0) {
                vargs.push(headers)
            }
            response.writeHead.apply(response, vargs)
            response.write(new Buffer('Hello, '))
            response.write(new Buffer('World!'))
            response.end()
        }
    })

    var fetch = cadence(function (async, options) {
        async(function () {
            var request = interlocutor.request(options)
            delta(async()).ee(request).on('response')
            request.end()
        }, function (response) {
            async(function () {
                delta(async()).ee(response).on('data', []).on('end')
            }, function (data) {
                return [ Buffer.concat(data), response ]
            })
        })
    })

    async(function () {
        fetch({}, async())
    }, function (buffer, response) {
        assert(buffer.toString(), 'Hello, World!', 'hello')
        assert(response.headers, {}, 'no headers')
        assert(response.trailers, null, 'null trailers')
        fetch({ headers: { 'status-message': 'OK', key: 'value' } }, async())
    }, function (buffer, response) {
        assert(buffer.toString(), 'Hello, World!', 'hello')
        assert(response.headers, { key: 'value' }, 'no headers')
        assert(response.trailers, null, 'null trailers')
    })
}
