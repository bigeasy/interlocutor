import { IncomingMessage, ServerResponse } from 'http'
import { Readable, Writable } from 'stream'

class Interlocutor {
  constructor(middleware: (req: IncomingMessage, res: ServerResponse) => void)

  request(options: {
    /** @default "/" */
    path?: string
    /** @default "GET" */
    method?: string
    headers?: Record<string, string>
    rawHeaders?: string[]
    /** @default "1.1" */
    httpVersion?: string
  }): ClientRequest
}

abstract class ClientRequest extends Writable {
  on(event: 'response', handler: (response: ClientResponse) => void): this
  abort(): void
}

abstract class ClientResponse extends Readable {
  headers: Record<string, string>
  rawHeaders: string[]
  trailers: Record<string, string> | null
  on(event: 'data', listener: (chunk: any) => void): this
  on(event: 'end', listener: () => void): this
  on(event: 'aborted', handler: () => void): this
}

export = Interlocutor
