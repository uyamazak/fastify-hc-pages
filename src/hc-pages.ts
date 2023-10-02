import puppeteer from 'puppeteer'
import { BrowserLaunchArgumentOptions, Page, Browser } from 'puppeteer'
import { PageOptions, RunOnPageCallback } from '../types/hc-pages'

const defaultPagesNum = 3

const defaultPageOptions: PageOptions = {
  userAgent: '',
  pageTimeoutMilliseconds: 10000,
  emulateMediaTypeScreenEnabled: false,
  acceptLanguage: '',
}

const defaultLaunchOptions: BrowserLaunchArgumentOptions = {
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
  ],
}

export class HCPages {
  private pagesNum: number
  private pages: Page[]
  private readyPages: Page[]
  private currentPromises: Promise<unknown>[]
  private pageOptions: PageOptions
  private browser: Browser

  constructor(
    browser: Browser,
    pagesNum: number,
    pageOptions = {} as Partial<PageOptions> | undefined
  ) {
    this.pagesNum = pagesNum
    this.pageOptions = { ...defaultPageOptions, ...pageOptions }
    this.browser = browser
    this.pages = []
    this.readyPages = []
    this.currentPromises = []
  }

  public static init = async (
    pagesNum = defaultPagesNum,
    pageOptions: Partial<PageOptions> | undefined = undefined,
    launchOptions?: BrowserLaunchArgumentOptions
  ): Promise<HCPages> => {
    console.debug('launchOptions', launchOptions ?? defaultLaunchOptions)
    const browser = await puppeteer.launch(
      launchOptions ?? defaultLaunchOptions
    )
    console.debug(`browser.verison is ${await browser.version()}`)
    const hcPages = new HCPages(browser, pagesNum, pageOptions)
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
    try {
      const result = await callback(page)
      return result
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      this.readyPages.push(page)
    }
  }

  public async runOnPage<T>(callback: RunOnPageCallback<T>): Promise<T> {
    let page = this.readyPages.pop()
    while (!page) {
      await Promise.race(this.currentPromises)
      page = this.readyPages.pop()
    }

    const promise = this.runCallback(page, callback)
    this.currentPromises.push(promise)
    try {
      return await promise
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      this.currentPromises.splice(this.currentPromises.indexOf(promise), 1)
    }
  }

  private async createPage(): Promise<Page> {
    const page = await this.browser.newPage()
    await this.applyPageConfigs(page)
    return page
  }

  private async createPages(): Promise<Page[]> {
    const pages = []
    for (let i = 0; i < this.pagesNum; i++) {
      const page = await this.createPage()
      console.debug(`page number ${i} is created`)
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
    } = this.pageOptions
    if (pageTimeoutMilliseconds) {
      page.setDefaultTimeout(pageTimeoutMilliseconds)
      console.debug(`defaultTimeout set ${pageTimeoutMilliseconds}`)
    }
    if (viewport) {
      await page.setViewport(viewport)
      console.debug(`viewport set ${JSON.stringify(page.viewport())}`)
    }
    if (userAgent) {
      await page.setUserAgent(userAgent)
      console.debug(`user agent set ${userAgent}`)
    }
    if (emulateMediaTypeScreenEnabled) {
      await page.emulateMediaType('screen')
      console.debug('emulateMediaType screen')
    }
    if (acceptLanguage) {
      await page.setExtraHTTPHeaders({
        'Accept-Language': acceptLanguage,
      })
      console.debug(`Accept-Language set: ${acceptLanguage}`)
    }
  }

  private async closePages(): Promise<void> {
    for (let i = 0; i < this.pagesNum; i++) {
      await this.pages[i].close()
      console.debug(`page number ${i} is closed`)
    }
  }

  private async closeBrowser(): Promise<void> {
    await this.browser.close()
    console.log('browser is closed')
  }
}
