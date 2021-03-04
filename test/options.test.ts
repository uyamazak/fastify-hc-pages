import { test } from 'tap'
import fastify from 'fastify'
import { Page } from 'puppeteer'
import { InjectOptions } from 'light-my-request'
import { hcPages } from '../src/index'

const titleString = 'this is a test title'
const contentHtml = `<html><head><title>${titleString}</title></head><body></body></html>`

/**
 *   pagesNum: number
  userAgent: string
  pageTimeoutMilliseconds: number
  emulateMediaTypeScreenEnabled: boolean
  acceptLanguage: string
  viewport?: Viewport
  */
async function build(t) {
  const server = fastify()
  server.register(hcPages)
  server.get('/gettitle', async (_, reply) => {
    const result = await server.runOnPage<string>(async (page: Page) => {
      await page.setContent(contentHtml, { waitUntil: 'domcontentloaded' })
      return await page.title()
    })
    reply.send(result)
  })
  t.tearDown(server.close.bind(server))
  return server
}

test('set pageNum 5', async (t) => {
  const server = fastify()
  const options = { pagesNum: 5 }
  await server.register(hcPages, options)
  t.tearDown(server.close.bind(server))
})

test('set pageTimeoutMilliseconds', async (t) => {
  const server = fastify()
  const options = { pageOptions: { pageTimeoutMilliseconds: 30000 } }
  await server.register(hcPages, options)
  t.tearDown(server.close.bind(server))
})

test('set userAgent', async (t) => {
  const server = fastify()
  const options = { pageOptions: { userAgent: 'testUserAgentString' } }
  await server.register(hcPages, options)
  t.tearDown(server.close.bind(server))
})

test('set emulateMediaTypeScreenEnabled', async (t) => {
  const server = fastify()
  const options = { pageOptions: { emulateMediaTypeScreenEnabled: true } }
  await server.register(hcPages, options)
  t.tearDown(server.close.bind(server))
})

test('set acceptLanguage', async (t) => {
  const server = fastify()
  const options = { pageOptions: { acceptLanguage: 'ja' } }
  await server.register(hcPages, options)
  t.tearDown(server.close.bind(server))
})

test('set viewport', async (t) => {
  const server = fastify()
  const options = { pageOptions: { viewport: { width: 1920, height: 1080 } } }
  await server.register(hcPages, options)
  t.tearDown(server.close.bind(server))
})
