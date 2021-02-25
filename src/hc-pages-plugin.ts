import { FastifyInstance } from 'fastify'
import { launch, ChromeArgOptions, Page, Browser } from 'puppeteer'
import fp from 'fastify-plugin'
import { HcPageConfig, RunOnPageCallback } from './types/hc-pages-plugin'

const defaultHcPageConfig = {
  pagesNum: 3,
  userAgent: '',
  pageTimeoutMilliseconds: 10000,
  emulateMediaTypeScreenEnabled: false,
  acceptLanguage: ''
}
export class HCPages {
  private pages: Page[]
  private readyPages: Page[]
  private currentPromises: Promise<unknown>[]
  private config: HcPageConfig
  private browser: Browser

  constructor(browser: Browser, config: Partial<HcPageConfig>) {
    this.config = {...defaultHcPageConfig, ...config}
    this.browser = browser
    this.pages = []
    this.readyPages = []
    this.currentPromises = []
  }

  public static init = async (config: Partial<HcPageConfig>): Promise<HCPages> => {
    const launchOptions = HCPages.generateLaunchOptions()
    const browser = await launch(launchOptions)
    console.log(`browser.verison is ${(await browser.version())}`)
    const hcPages = new HCPages(browser, config)
    hcPages.pages = await hcPages.createPages()
    hcPages.readyPages = hcPages.pages
    return hcPages
  }

  async destroy(): Promise<void> {
    await this.closePages()
    await this.closeBrowser()
  }

  private async runCallback<T>(
    page: Page,
    callback: RunOnPageCallback<T>
  ): Promise<T> {
    const result = await callback(page)
    this.readyPages.push(page)
    return result
  }

  async runOnPage<T>(callback: RunOnPageCallback<T>): Promise<T> {
    let page = this.readyPages.pop()
    while (!page) {
      await Promise.race(this.currentPromises)
      page = this.readyPages.pop()
    }

    const promise = this.runCallback(page, callback)
    this.currentPromises.push(promise)
    const result = await promise
    this.currentPromises.splice(this.currentPromises.indexOf(promise), 1)

    return result
  }

  static generateLaunchOptions(): ChromeArgOptions {
    return {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
      ],
    }
  }

  async createPages(): Promise<Page[]> {
    const pages = []
    for (let i = 0; i < this.config.pagesNum; i++) {
      const page = await this.browser.newPage()
      await this.applyPageConfigs(page)
      console.log(`page number ${i} is created`)
      pages.push(page)
    }
    return pages
  }

  async applyPageConfigs(page: Page): Promise<void> {
    const {
      pageTimeoutMilliseconds,
      userAgent,
      emulateMediaTypeScreenEnabled,
      acceptLanguage,
      viewport,
    } = this.config
    page.setDefaultNavigationTimeout(pageTimeoutMilliseconds)
    if (viewport) {
      await page.setViewport(viewport)
      console.log(`viewport set ${JSON.stringify(page.viewport())}`)
    }
    if (userAgent) {
      console.log(`user agent set ${userAgent}`)
      await page.setUserAgent(userAgent)
    }
    if (emulateMediaTypeScreenEnabled) {
      console.log('emulateMediaType screen')
      await page.emulateMediaType('screen')
    }
    if (acceptLanguage) {
      console.log(`Accept-Language set: ${acceptLanguage}`)
      await page.setExtraHTTPHeaders({
        'Accept-Language': acceptLanguage,
      })
    }
  }

  async closePages(): Promise<void> {
    for (let i = 0; i < this.config.pagesNum; i++) {
      await this.pages[i].close()
      console.log(`page number ${i} is closed`)
    }
  }

  async closeBrowser(): Promise<void> {
    await this.browser.close()
    console.log('browser is closed')
  }
}

async function plugin(
  fastify: FastifyInstance,
  options: Partial<HcPageConfig>,
  next: (err?: Error) => void
) {
  const hcPages = await HCPages.init(options)
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
