require('proof')(15, require('cadence')(prove))

function prove (async, okay) {
    var delta = require('delta')
    var cadence = require('cadence')
    var Interlocutor = require('..')
    var interlocutor = new Interlocutor(function (request, response) {
        var trailers = null
        switch (request.headers.select) {
        case 'abort':
            request.on('aborted', function () {
                okay('server aborted')
            })
            request.on('close', function () {
                okay('server closed')
                response.write('hello, world!')
                response.end()
            })
            // TODO Probably need to more liberally use `nextTick`. Put this
            // write at the top, above the hooks and we're not going to fire.
            response.writeHead(200)
            break
        case 'headers':
            okay(request.url, '/headers', 'url')
            response.setHeader('name', 'value')
            okay(response.getHeader('name'), 'value', 'value')
            response.removeHeader('name')
            okay(! response.getHeader('name'), 'not value')
            trailers = { name: 'value' }
            response.setHeader('set', 'value')
        default:
            var message = new Buffer('Hello, World!')
            var vargs = [ 201 ]
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
            if (request.method == 'POST') {
                request.on('data', function (chunk) { okay(chunk.toString(), '123', 'post') })
            }
            response.writeHead.apply(response, vargs)
            response.write(new Buffer('Hello, '))
            response.write(new Buffer('World!'))
            if (trailers) {
                response.addTrailers(trailers)
            }
            response.end()
        }
    })

    var fetch = cadence(function (async, request) {
        async(function () {
            delta(async()).ee(request).on('response')
        }, function (response) {
            async(function () {
                delta(async()).ee(response).on('data', []).on('end')
            }, function (data) {
                return [ Buffer.concat(data), response ]
            })
        })
    })

    async(function () {
        var request = interlocutor.request({
            method: 'POST',
            headers: { 'content-length': '3' }
        })
        fetch(request, async())
        request.write('123')
        request.end()
    }, function (buffer, response) {
        okay(buffer.toString(), 'Hello, World!', 'hello')
        okay(response.statusCode, 201, 'no headers')
        okay(response.headers, { 'content-length': '3' }, 'content length')
        okay(response.trailers, null, 'null trailers')
        var request = interlocutor.request({
            path: '/headers',
            headers: { select: 'headers', 'status-message': 'OK', key: 'value' }
        })
        fetch(request, async())
        request.end()
    }, function (buffer, response) {
        okay(buffer.toString(), 'Hello, World!', 'hello')
        okay(response.headers, {
            set: 'value', key: 'value', select: 'headers', 'transfer-encoding': 'chunked'
        }, 'headers')
        okay(response.trailers, { name: 'value' }, 'add trailers')
        var request = interlocutor.request({
            path: '/abort',
            headers: { select: 'abort', 'status-message': 'OK', key: 'value' }
        })
        delta(async()).ee(request).on('abort')
        request.end()
        request.abort()
    }, function () {
        okay('abort before request')
        var request = interlocutor.request({
            path: '/abort',
            headers: { select: 'abort', 'status-message': 'OK', key: 'value' }
        })
        async(function () {
            delta(async()).ee(request).on('response')
        }, function (response) {
            delta(async()).ee(response).on('aborted')
            request.abort()
        })
    }, function () {
        okay('abort after response')
    })
}
