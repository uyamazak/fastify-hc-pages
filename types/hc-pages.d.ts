import { ChromeArgOptions, Viewport, Page } from 'puppeteer'

export interface HcPagesPluginOptions {
  pageOptions?: PageOptions
  launchOptions?: ChromeArgOptions
}

export interface PageOptions {
  pagesNum: number
  userAgent: string
  pageTimeoutMilliseconds: number
  emulateMediaTypeScreenEnabled: boolean
  acceptLanguage: string
  viewport?: Viewport
}

export type RunOnPageCallback<T> = (page: Page) => Promise<T>

declare module 'fastify' {
  interface FastifyInstance {
    runOnPage<T>(callback: RunOnPageCallback<T>): Promise<T>
    destroyPages(): Promise<void>
  }
}
