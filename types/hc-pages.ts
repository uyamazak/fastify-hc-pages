import { BrowserLaunchArgumentOptions, Viewport, Page } from 'puppeteer'

export interface HcPagesOptions {
  pageOptions?: PageOptions
  launchOptions?: BrowserLaunchArgumentOptions
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
