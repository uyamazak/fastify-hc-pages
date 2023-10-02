import { test } from 'tap'
import fastify from 'fastify'
import { Page } from 'puppeteer'
import { InjectOptions, Response } from 'light-my-request'
import { hcPages } from '../src/index'

const titleString = 'this is a test title'
const contentHtml = `<html><head><title>${titleString}</title></head><body></body></html>`

interface Test {
  teardown(cb: unknown): unknown
}

async function build(t: Test) {
  const server = fastify()
  server.register(hcPages)
  server.get('/rejected', async (_, reply) => {
    const result = await server.runOnPage(async () => {
      throw Error('rejected')
    })
    reply.send(result)
  })
  server.get('/success', async (_, reply) => {
    const result = await server.runOnPage<string>(async (page: Page) => {
      await page.setContent(contentHtml, { waitUntil: 'domcontentloaded' })
      return await page.title()
    })
    reply.send(result)
  })
  t.teardown(server.close.bind(server))
  return server
}

test('runOnPage success after many rejected', async (t) => {
  const server = await build(t)
  const rejectPromises: Promise<Response>[] = []
  for (let i = 0; i < 10; i++) {
    rejectPromises.push(
      server.inject({
        method: 'GET',
        url: '/rejected',
      } as InjectOptions)
    )
  }
  const rejectResults = await Promise.all(rejectPromises)
  for (const re of rejectResults) {
    console.log(re.payload)
    t.equal(re.statusCode, 500)
  }
  const res = await server.inject({
    method: 'GET',
    url: '/success',
  } as InjectOptions)
  t.equal(res.statusCode, 200)
  t.end()
})
