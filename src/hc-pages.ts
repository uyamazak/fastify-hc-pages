import { launch, ChromeArgOptions, Page, Browser } from 'puppeteer'
import { PageOptions, RunOnPageCallback } from './types/hc-pages'

const defaultPageOptions: PageOptions = {
  pagesNum: 3,
  userAgent: '',
  pageTimeoutMilliseconds: 10000,
  emulateMediaTypeScreenEnabled: false,
  acceptLanguage: '',
}

const defaultLaunchOptions: ChromeArgOptions = {
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
  ],
}

export class HCPages {
  private pages: Page[]
  private readyPages: Page[]
  private currentPromises: Promise<unknown>[]
  private options: PageOptions
  private browser: Browser

  constructor(
    browser: Browser,
    options = {} as Partial<PageOptions> | undefined
  ) {
    this.options = { ...defaultPageOptions, ...options }
    this.browser = browser
    this.pages = []
    this.readyPages = []
    this.currentPromises = []
  }

  public static init = async (
    pageOptions: Partial<PageOptions> | undefined,
    launchOptions: ChromeArgOptions | undefined = undefined
  ): Promise<HCPages> => {
    const browser = await launch(launchOptions ?? defaultLaunchOptions)
    console.log(`browser.verison is ${await browser.version()}`)
    const hcPages = new HCPages(browser, pageOptions)
    hcPages.pages = await hcPages.createPages()
    hcPages.readyPages = hcPages.pages
    return hcPages
  }

  public async destroy(): Promise<void> {
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

  public async runOnPage<T>(callback: RunOnPageCallback<T>): Promise<T> {
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

  private async createPages(): Promise<Page[]> {
    const pages = []
    for (let i = 0; i < this.options.pagesNum; i++) {
      const page = await this.browser.newPage()
      await this.applyPageConfigs(page)
      console.log(`page number ${i} is created`)
      pages.push(page)
    }
    return pages
  }

  private async applyPageConfigs(page: Page): Promise<void> {
    const {
      pageTimeoutMilliseconds,
      userAgent,
      emulateMediaTypeScreenEnabled,
      acceptLanguage,
      viewport,
    } = this.options
    if (pageTimeoutMilliseconds) {
      page.setDefaultNavigationTimeout(pageTimeoutMilliseconds)
      console.log(`defaultNavigationTimeout set ${pageTimeoutMilliseconds}`)
    }
    if (viewport) {
      await page.setViewport(viewport)
      console.log(`viewport set ${JSON.stringify(page.viewport())}`)
    }
    if (userAgent) {
      await page.setUserAgent(userAgent)
      console.log(`user agent set ${userAgent}`)
    }
    if (emulateMediaTypeScreenEnabled) {
      await page.emulateMediaType('screen')
      console.log('emulateMediaType screen')
    }
    if (acceptLanguage) {
      await page.setExtraHTTPHeaders({
        'Accept-Language': acceptLanguage,
      })
      console.log(`Accept-Language set: ${acceptLanguage}`)
    }
  }

  private async closePages(): Promise<void> {
    for (let i = 0; i < this.options.pagesNum; i++) {
      await this.pages[i].close()
      console.log(`page number ${i} is closed`)
    }
  }

  private async closeBrowser(): Promise<void> {
    await this.browser.close()
    console.log('browser is closed')
  }
}
