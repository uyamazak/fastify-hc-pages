[![npm version](https://badge.fury.io/js/%40uyamazak%2Ffastify-hc-pages.svg)](https://badge.fury.io/js/%40uyamazak%2Ffastify-hc-pages)
[![ci](https://github.com/uyamazak/fastify-hc-pages/workflows/ci/badge.svg)](https://github.com/uyamazak/fastify-hc-pages/actions?query=workflow%3Aci)
[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](LICENSE)
# fastify-hc-pages
A plugin that allows you to use Headless Chrome Pages from [Fastify](https://www.fastify.io/) by [Puppeteer](https://pptr.dev/).

Native TypeScript is supportted.

This plugin was derived from the following repository.

https://github.com/uyamazak/hc-pdf-server

# Getting started
```
npm i @uyamazak/fastify-hc-pages

# OR

yarn add @uyamazak/fastify-hc-pages
```

# Usage

```
import fastify from 'fastify'
import { hcPages } from '@uyamazak/fastify-hc-pages'

const app = async () => {
  // Register this plugin
  server.register(hcPages)
  
  // Work together with Puppeteer's Page in callback function.
  server.get('/gettitle', async (_, reply) => {
    // Make result you need in callback function with Page
    const result = await server.runOnPage<string>(async (page: Page) => {
      await page.goto('https://example.com')
      return await page.title()
    })
    reply.send(result)
  })
}
```

# Contributing
Pull requests, Issues, [GitHub Sponsors](https://github.com/sponsors/uyamazak/) are welcome.

# Contributors ✨
Thanks!

[salos1982](https://github.com/salos1982) ([Pull Request](https://github.com/uyamazak/hc-pdf-server/pull/96))

# Author
[uyamazak](https://github.com/uyamazak)

