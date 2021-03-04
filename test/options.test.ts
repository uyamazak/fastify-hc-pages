import { test } from 'tap'
import fastify from 'fastify'
import { hcPages } from '../src/index'

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
