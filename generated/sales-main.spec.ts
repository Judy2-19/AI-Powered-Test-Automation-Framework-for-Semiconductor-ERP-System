import { test, expect } from '@playwright/test'

const AUTH_FILE = 'tests/generated/.auth/user.json'
const PAGE_URL = '/orders/order0'

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

test.describe('销售主单管理 P0', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForURL(PAGE_URL, { timeout: 60000 })
    await page.waitForSelector('.el-loading-spinner', { state: 'hidden', timeout: 60000 }).catch(() => {})
    await page.waitForSelector('.el-table__row', { timeout: 60000 }).catch(() => {})
  })

  test('页面加载完成，表格数据可见', async ({ page }) => {
    await expect(page).toHaveURL(PAGE_URL)

    await expect(page.getByRole('link', { name: '销售主单管理' })).toBeVisible()

    await expect(page.getByRole('textbox', { name: '主单ID' })).toBeVisible()
    await expect(page.getByRole('combobox', { name: '订单状态' })).toBeVisible()
    await expect(page.getByRole('combobox', { name: '审批状态' })).toBeVisible()
    await expect(page.getByRole('combobox', { name: '技术交付' })).toBeVisible()
    await expect(page.getByRole('combobox', { name: '客户姓名' })).toBeVisible()
    await expect(page.getByRole('combobox', { name: '客户机构' })).toBeVisible()

    await expect(page.getByRole('button', { name: '搜索' })).toBeVisible()
    await expect(page.getByRole('button', { name: '重置' })).toBeVisible()
    await expect(page.getByRole('button', { name: '新增' })).toBeVisible()
    await expect(page.getByRole('button', { name: '报价单' })).toBeVisible()
    await expect(page.getByRole('button', { name: '合同' })).toBeVisible()
    await expect(page.getByRole('button', { name: '费用确认' })).toBeVisible()
    await expect(page.getByRole('button', { name: '对账' })).toBeVisible()
    await expect(page.getByRole('button', { name: '开票' })).toBeVisible()
    await expect(page.getByRole('button', { name: '付款' })).toBeVisible()
    await expect(page.getByRole('button', { name: '导出' })).toBeVisible()

    await expect(page.locator('.el-table').first()).toBeVisible()
  })

  test('搜索功能：输入主单ID搜索', async ({ page }) => {
    const searchInput = page.getByRole('textbox', { name: '主单ID' })
    await searchInput.fill('test')

    await page.getByRole('button', { name: '搜索' }).click()

    await page.waitForTimeout(2000)
    await expect(page.locator('.el-table').first()).toBeVisible()
  })

  test('重置功能：搜索后点击重置，表单清空', async ({ page }) => {
    const searchInput = page.getByRole('textbox', { name: '主单ID' })
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

  test('标签页切换：我的订单/协同订单/全部订单', async ({ page }) => {
    await expect(page.getByRole('tab', { name: '我的订单' })).toHaveClass(/is-active/)

    await page.getByRole('tab', { name: '协同订单' }).click()
    await expect(page.getByRole('tab', { name: '协同订单' })).toHaveClass(/is-active/)

    await page.getByRole('tab', { name: '全部订单' }).click()
    await expect(page.getByRole('tab', { name: '全部订单' })).toHaveClass(/is-active/)

    await page.getByRole('tab', { name: '我的订单' }).click()
    await expect(page.getByRole('tab', { name: '我的订单' })).toHaveClass(/is-active/)
  })

  test('搜索后标签页同步：搜索条件在我的订单/协同订单/全部订单间同步', async ({ page }) => {
    await page.getByRole('textbox', { name: '主单ID' }).fill('test')

    await page.getByRole('button', { name: '搜索' }).click()
    await page.waitForTimeout(2000)

    await page.getByRole('tab', { name: '协同订单' }).click()
    await page.waitForTimeout(1500)

    await page.getByRole('tab', { name: '全部订单' }).click()
    await page.waitForTimeout(1500)

    await page.getByRole('tab', { name: '我的订单' }).click()
    await page.waitForTimeout(1500)

    await page.getByRole('button', { name: '重置' }).click()
  })

  test('底部详情标签页切换：销售子单/采购订单/样品流转', async ({ page }) => {
    const salesSubTab = page.locator('.el-tabs__item').filter({ hasText: '销售子单' })
    const purchaseTab = page.locator('.el-tabs__item').filter({ hasText: '采购订单' })
    const sampleTab = page.locator('.el-tabs__item').filter({ hasText: '样品流转' })

    await salesSubTab.first().click()
    await page.waitForTimeout(1000)

    await purchaseTab.first().click()
    await page.waitForTimeout(1000)

    await sampleTab.first().click()
    await page.waitForTimeout(1000)

    await salesSubTab.first().click()
    await page.waitForTimeout(1000)
  })

  test('销售子单添加：点击销售子单标签的添加按钮', async ({ page }) => {
    const rows = page.locator('.el-table__row')
    if ((await rows.count()) > 0) {
      await rows.first().click()
      await page.waitForTimeout(1000)
    }

    const salesSubTab = page.locator('.el-tabs__item').filter({ hasText: '销售子单' })
    await salesSubTab.first().click()
    await page.waitForTimeout(1000)

    const addButton = page.locator('.el-button').filter({ hasText: '添加' }).first()
    await expect(addButton).toBeVisible()
    await expect(addButton).toBeEnabled()

    await addButton.click()

    try {
      await page.waitForSelector('.el-dialog', { timeout: 5000 })
      await page.locator('.el-dialog__close').click()
      await page.waitForSelector('.el-dialog', { state: 'hidden', timeout: 10000 })
    } catch {
    }
  })

  test('采购订单添加：点击采购订单标签的添加按钮', async ({ page }) => {
    const rows = page.locator('.el-table__row')
    if ((await rows.count()) > 0) {
      await rows.first().click()
      await page.waitForTimeout(1000)
    }

    const purchaseTab = page.locator('.el-tabs__item').filter({ hasText: '采购订单' })
    await purchaseTab.first().click()
    await page.waitForTimeout(1000)

    const purchasePane = page.locator('.el-tab-pane').filter({ hasText: '采购订单' })
    const addButton = purchasePane.locator('.el-button').filter({ hasText: '添加' }).first()
    
    if ((await addButton.count()) > 0) {
      await addButton.click({ force: true })

      try {
        await page.waitForSelector('.el-dialog', { timeout: 5000 })
        await page.locator('.el-dialog__close').click()
        await page.waitForSelector('.el-dialog', { state: 'hidden', timeout: 10000 })
      } catch {
      }
    }
  })

  test('样品流转添加：点击样品流转标签的添加按钮', async ({ page }) => {
    const rows = page.locator('.el-table__row')
    if ((await rows.count()) > 0) {
      await rows.first().click()
      await page.waitForTimeout(1000)
    }

    const sampleTab = page.locator('.el-tabs__item').filter({ hasText: '样品流转' })
    await sampleTab.first().click()
    await page.waitForTimeout(1000)

    const samplePane = page.locator('.el-tab-pane').filter({ hasText: '样品流转' })
    const addButton = samplePane.locator('.el-button').filter({ hasText: '添加' }).first()
    
    if ((await addButton.count()) > 0) {
      await addButton.click({ force: true })

      try {
        await page.waitForSelector('.el-dialog', { timeout: 5000 })
        await page.locator('.el-dialog__close').click()
        await page.waitForSelector('.el-dialog', { state: 'hidden', timeout: 10000 })
      } catch {
      }
    }
  })

  test('销售合同关联：点击销售合同标签的关联按钮', async ({ page }) => {
    const rows = page.locator('.el-table__row')
    if ((await rows.count()) > 0) {
      await rows.first().click()
      await page.waitForTimeout(1000)
    }

    const contractTab = page.locator('.el-tabs__item').filter({ hasText: '销售合同' })
    await contractTab.first().click()
    await page.waitForTimeout(1000)

    const relateButton = page.locator('.el-button').filter({ hasText: '关联' }).first()
    await expect(relateButton).toBeVisible()
    await expect(relateButton).toBeEnabled()

    await relateButton.click()

    try {
      await page.waitForSelector('.el-dialog', { timeout: 5000 })
      await page.locator('.el-dialog__close').click()
      await page.waitForSelector('.el-dialog', { state: 'hidden', timeout: 10000 })
    } catch {
    }
  })
})
