# fastify-hc-pages-plugin
A plugin that allows you to use Headless Chrome Pages with Puppeteer from Fastify

This plugin was derived from the following repository.

https://github.com/uyamazak/hc-pdf-server

# Getting started
Preparing.

# Usage

```
import fastify from 'fastify'
import { hcPagesPlugin } from '@uyamazak/fastify-hc-pages-plugin'

const app = async () => {
  server.register(hcPagesPlugin)
  // Work together with Page in callback function of runOnPage.
  server.get('/gettitle', async (_, reply) => {
    const result = await server.runOnPage<string>(async (page: Page) => {
      await page.setContent(contentHtml, { waitUntil: 'domcontentloaded' })
      return await page.title()
    })
    reply.send(result)
  })
}
```
