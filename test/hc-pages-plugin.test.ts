import { test } from 'tap'
import { HCPages } from '../src/hc-pages-plugin'

test('enable options', async (t) => {
  const pagesNum = 5
  const hcPages = await HCPages.init({
    pagesNum: pagesNum,
    userAgent: 'user_agent_test',
    pageTimeoutMilliseconds: 30000,
    emulateMediaTypeScreenEnabled: true,
    acceptLanguage: 'ja',
  })
  t.equal((await hcPages.createPages()).length, pagesNum)
  await hcPages.destroy()
})
