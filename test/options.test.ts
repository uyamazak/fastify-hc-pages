import { test } from 'tap'
import fastify from 'fastify'
import { hcPages } from '../src/index'

interface Test {
  teardown(cb: unknown): unknown
}

test('set options', async (t: Test) => {
  const server = fastify()
  const options = {
    pagesNum: 5,
    pageOptions: {
      pageTimeoutMilliseconds: 30000,
      userAgent: 'testUserAgentString',
      emulateMediaTypeScreenEnabled: true,
      acceptLanguage: 'ja',
      viewport: { width: 1920, height: 1080 },
    },
  }
  await server.register(hcPages, options)
  t.teardown(() => server.close())
})
