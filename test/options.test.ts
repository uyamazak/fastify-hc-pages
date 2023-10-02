import { test } from 'tap'
import fastify from 'fastify'
import { hcPages } from '../src/index'

interface Test {
  teardown(cb: unknown): unknown
}

test('set pageNum 5', async (t: Test) => {
  const server = fastify()
  const options = { pagesNum: 5 }
  await server.register(hcPages, options)
  t.teardown(()=> server.close())
})
/*
test('set pageTimeoutMilliseconds', async (t: Test) => {
  const server = fastify()
  const options = { pageOptions: { pageTimeoutMilliseconds: 30000 } }
  await server.register(hcPages, options)
  t.teardown(()=> server.close())
})

test('set userAgent', async (t: Test) => {
  const server = fastify()
  const options = { pageOptions: { userAgent: 'testUserAgentString' } }
  await server.register(hcPages, options)
  t.teardown(()=> server.close())
})

test('set emulateMediaTypeScreenEnabled', async (t: Test) => {
  const server = fastify()
  const options = { pageOptions: { emulateMediaTypeScreenEnabled: true } }
  await server.register(hcPages, options)
  t.teardown(()=> server.close())
})

test('set acceptLanguage', async (t: Test) => {
  const server = fastify()
  const options = { pageOptions: { acceptLanguage: 'ja' } }
  await server.register(hcPages, options)
  t.teardown(()=> server.close())
})

test('set viewport', async (t: Test) => {
  const server = fastify()
  const options = { pageOptions: { viewport: { width: 1920, height: 1080 } } }
  await server.register(hcPages, options)
  t.teardown(()=> server.close())
})
*/
