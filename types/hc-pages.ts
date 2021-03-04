import { BrowserLaunchArgumentOptions, Viewport, Page } from 'puppeteer'

export interface HcPagesOptions {
  pagesNum?: number
  pageOptions?: Partial<PageOptions>
  launchOptions?: BrowserLaunchArgumentOptions
}

export interface PageOptions {
  userAgent: string
  pageTimeoutMilliseconds: number
  emulateMediaTypeScreenEnabled: boolean
  acceptLanguage: string
  viewport?: Viewport
}

export type RunOnPageCallback<T> = (page: Page) => Promise<T>
