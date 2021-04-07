import { test } from 'tap'
import fastify from 'fastify'
import { Page } from 'puppeteer'
import { InjectOptions } from 'light-my-request'
import { hcPages } from '../src/index'

const titleString = 'this is a test title'
const contentHtml = `<html><head><title>${titleString}</title></head><body></body></html>`

interface Test {
  teardown(cb: unknown): unknown
}

async function build(t: Test) {
  const server = fastify()
  server.register(hcPages)
  server.get('/gettitle', async (_, reply) => {
    const result = await server.runOnPage<string>(async (page: Page) => {
      await page.setContent(contentHtml, { waitUntil: 'domcontentloaded' })
      return await page.title()
    })
    reply.send(result)
  })
  t.teardown(server.close.bind(server))
  return server
}

test('runOnPage get title', async (t) => {
  const server = await build(t)
  const res = await server.inject({
    method: 'GET',
    url: '/gettitle',
  } as InjectOptions)
  t.equal(res.payload, titleString)
})
