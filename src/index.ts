import fp from 'fastify-plugin'
import { HCPages } from './hc-pages'
import { FastifyInstance } from 'fastify'
import { HcPagesOptions, RunOnPageCallback } from '../types/hc-pages'

declare module 'fastify' {
  interface FastifyInstance {
    runOnPage<T>(callback: RunOnPageCallback<T>): Promise<T>
    destroyPages(): Promise<void>
  }
}

export const plugin = async (
  fastify: FastifyInstance,
  options: HcPagesOptions,
  next: (err?: Error) => void
): Promise<void> => {
  const { pagesNum, pageOptions, launchOptions } = options
  const hcPages = await HCPages.init(pagesNum, pageOptions, launchOptions)

  fastify.decorate(
    'runOnPage',
    async (callback: RunOnPageCallback<unknown>) => {
      return await hcPages.runOnPage(callback)
    }
  )
  fastify.decorate('destroyPages', async () => {
    await hcPages.destroy()
  })
  fastify.addHook('onClose', async (instance, done) => {
    await instance.destroyPages()
    done()
  })
  next()
}

export const hcPages = fp(plugin, {
  fastify: '^4.0.0',
  name: 'hc-pages-plugin',
})

export default hcPages
