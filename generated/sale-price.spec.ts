import { test, expect } from '@playwright/test'

const AUTH_FILE = 'tests/generated/.auth/user.json'
const PAGE_URL = '/orders/sale-price'

async function ensureAuthState(browser: any) {
  const fs = require('fs')
  if (!fs.existsSync(AUTH_FILE)) {
    throw new Error(`认证文件不存在: ${AUTH_FILE}`)
  }
}

test.beforeAll(async ({ browser }) => {
  await ensureAuthState(browser)
})
test.use({ storageState: AUTH_FILE })

test.describe('销售定价管理 P0', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForURL(PAGE_URL, { timeout: 60000 })
    await page.waitForSelector('.el-loading-spinner', { state: 'hidden', timeout: 60000 }).catch(() => {})
    await page.waitForSelector('.el-table__row', { timeout: 60000 }).catch(() => {})
  })

  test('页面加载完成，表格数据可见', async ({ page }) => {
    await expect(page).toHaveURL(PAGE_URL)

    await expect(page.getByRole('link', { name: '销售定价管理' })).toBeVisible()

    await expect(page.getByRole('textbox', { name: 'id' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: '名称' })).toBeVisible()
    await expect(page.getByRole('combobox', { name: '合同' })).toBeVisible()

    await expect(page.getByRole('button', { name: '搜索' })).toBeVisible()
    await expect(page.getByRole('button', { name: '重置' })).toBeVisible()
    await expect(page.getByRole('button', { name: '新增' })).toBeVisible()
    await expect(page.getByRole('button', { name: '导出' })).toBeVisible()

    await expect(page.locator('.el-table').first()).toBeVisible()
  })

  test('搜索功能：输入名称搜索', async ({ page }) => {
    const searchInput = page.getByRole('textbox', { name: '名称' })
    await searchInput.fill('test')

    await page.getByRole('button', { name: '搜索' }).click()

    await page.waitForTimeout(2000)
    await expect(page.locator('.el-table').first()).toBeVisible()
  })

  test('重置功能：搜索后点击重置，表单清空', async ({ page }) => {
    const searchInput = page.getByRole('textbox', { name: '名称' })
    await searchInput.fill('test')

    await page.getByRole('button', { name: '搜索' }).click()
    await page.waitForTimeout(2000)

    await page.getByRole('button', { name: '重置' }).click()
    await page.waitForTimeout(1000)

    const value = await searchInput.inputValue()
    expect(value).toBe('')
  })

  test('新增按钮可点击', async ({ page }) => {
    const addButton = page.getByRole('button', { name: '新增' })
    await expect(addButton).toBeVisible()
    await expect(addButton).toBeEnabled()
  })

  test('标签页切换：关联采购价格', async ({ page }) => {
    await expect(page.getByRole('tab', { name: '关联采购价格' })).toHaveClass(/is-active/)
  })
})
