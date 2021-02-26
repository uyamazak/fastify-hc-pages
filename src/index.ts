import fp from 'fastify-plugin'
import { HCPages } from './hc-pages'
import { FastifyInstance } from 'fastify'
import { HcPagesPluginOptions, RunOnPageCallback } from '../types/hc-pages'

async function plugin(
  fastify: FastifyInstance,
  options: HcPagesPluginOptions,
  next: (err?: Error) => void
) {
  const { pageOptions, launchOptions } = options
  const hcPages = await HCPages.init(pageOptions, launchOptions)
  fastify.decorate(
    'runOnPage',
    async (callback: RunOnPageCallback<unknown>) => {
      return await hcPages.runOnPage(callback)
    }
  )
  fastify.decorate('destroyPages', async () => {
    await hcPages.destroy()
  })
  next()
}

export const hcPagesPlugin = fp(plugin, {
  fastify: '^3.0.0',
  name: 'hc-pages-plugin',
})

export default hcPagesPlugin
