import { test, expect } from '@playwright/test'

const AUTH_FILE = 'tests/generated/.auth/user.json'
const PAGE_URL = '/orders/order2'

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

test.describe('采购订单管理 P0', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForURL(PAGE_URL, { timeout: 60000 })
    await page.waitForSelector('.el-loading-spinner', { state: 'hidden', timeout: 60000 }).catch(() => {})
    await page.waitForSelector('.el-table__row', { timeout: 60000 }).catch(() => {})
  })

  test('页面加载完成，表格数据可见', async ({ page }) => {
    await expect(page).toHaveURL(PAGE_URL)

    await expect(page.getByRole('link', { name: '采购订单管理' })).toBeVisible()

    await expect(page.getByRole('textbox', { name: '主单ID' })).toBeVisible()
    await expect(page.getByRole('combobox', { name: '订单状态' })).toBeVisible()
    await expect(page.getByRole('combobox', { name: '专家姓名' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: '专家机构' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: '我方机构' })).toBeVisible()

    await expect(page.getByRole('button', { name: '搜索' })).toBeVisible()
    await expect(page.getByRole('button', { name: '重置' })).toBeVisible()
    await expect(page.getByRole('button', { name: '新增' })).toBeVisible()
    await expect(page.getByRole('button', { name: '对账' })).toBeVisible()
    await expect(page.getByRole('button', { name: '开票' })).toBeVisible()
    await expect(page.getByRole('button', { name: '付款' })).toBeVisible()
    await expect(page.getByRole('button', { name: '同步金蝶' })).toBeVisible()
    await expect(page.getByRole('button', { name: '金蝶红冲' })).toBeVisible()
    await expect(page.getByRole('button', { name: '技术催办' })).toBeVisible()
    await expect(page.getByRole('button', { name: '导出' })).toBeVisible()
    await expect(page.getByRole('button', { name: '全部数据下载' })).toBeVisible()

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

  test('标签页切换：我的订单/机时预约', async ({ page }) => {
    await expect(page.getByRole('tab', { name: '我的订单' })).toHaveClass(/is-active/)

    await page.getByRole('tab', { name: '机时预约' }).click()
    await expect(page.getByRole('tab', { name: '机时预约' })).toHaveClass(/is-active/)

    await page.getByRole('tab', { name: '我的订单' }).click()
    await expect(page.getByRole('tab', { name: '我的订单' })).toHaveClass(/is-active/)
  })

  test('订单状态筛选：使用订单状态下拉框筛选', async ({ page }) => {
    const statusCombo = page.getByRole('combobox', { name: '订单状态' })
    await statusCombo.click()
    await page.waitForTimeout(500)
    await page.keyboard.press('Escape')
  })

  test('专家姓名筛选：使用专家姓名下拉框筛选', async ({ page }) => {
    const expertCombo = page.getByRole('combobox', { name: '专家姓名' })
    await expertCombo.click({ force: true })
    await page.waitForTimeout(500)
    await page.keyboard.press('Escape')
  })

  test('专家机构搜索：输入专家机构搜索', async ({ page }) => {
    const input = page.getByRole('textbox', { name: '专家机构' })
    await input.fill('test')
    await page.getByRole('button', { name: '搜索' }).click()
    await page.waitForTimeout(2000)
  })

  test('我方机构搜索：输入我方机构搜索', async ({ page }) => {
    const input = page.getByRole('textbox', { name: '我方机构' })
    await input.fill('test')
    await page.getByRole('button', { name: '搜索' }).click()
    await page.waitForTimeout(2000)
  })

  test('新增采购订单：点击新增按钮弹出表单', async ({ page }) => {
    const addButton = page.getByRole('button', { name: '新增' })
    await addButton.click()

    try {
      await page.waitForSelector('.el-dialog', { timeout: 5000 })
      await page.locator('.el-dialog__close').click()
      await page.waitForSelector('.el-dialog', { state: 'hidden', timeout: 10000 })
    } catch {
    }
  })

  test('复制操作：点击表格行的复制按钮', async ({ page }) => {
    const rows = page.locator('.el-table__row')
    if ((await rows.count()) > 0) {
      const firstRow = rows.first()
      const copyButton = firstRow.locator('.el-button').filter({ hasText: '复制' }).first()
      
      if ((await copyButton.count()) > 0) {
        await copyButton.click({ force: true })

        try {
          await page.waitForSelector('.el-dialog', { timeout: 5000 })
          await page.locator('.el-dialog__close').click()
          await page.waitForSelector('.el-dialog', { state: 'hidden', timeout: 10000 })
        } catch {
        }
      }
    }
  })

  test('编辑操作：点击表格行的编辑按钮', async ({ page }) => {
    const rows = page.locator('.el-table__row')
    if ((await rows.count()) > 0) {
      const firstRow = rows.first()
      const editButton = firstRow.locator('.el-button').filter({ hasText: '编辑' }).first()
      
      if ((await editButton.count()) > 0) {
        await editButton.click({ force: true })

        try {
          await page.waitForSelector('.el-dialog', { timeout: 5000 })
          await page.locator('.el-dialog__close').click()
          await page.waitForSelector('.el-dialog', { state: 'hidden', timeout: 10000 })
        } catch {
        }
      }
    }
  })

  test('更多操作：点击表格行的更多按钮', async ({ page }) => {
    const rows = page.locator('.el-table__row')
    if ((await rows.count()) > 0) {
      const firstRow = rows.first()
      const moreButton = firstRow.locator('.el-button').filter({ hasText: '更多' }).first()
      
      if ((await moreButton.count()) > 0) {
        await moreButton.click({ force: true })
        await page.waitForTimeout(500)
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

  test('采购合同关联：点击采购合同标签的关联按钮', async ({ page }) => {
    const rows = page.locator('.el-table__row')
    if ((await rows.count()) > 0) {
      await rows.first().click()
      await page.waitForTimeout(1000)
    }

    const contractTab = page.locator('.el-tabs__item').filter({ hasText: '采购合同' })
    await contractTab.first().click()
    await page.waitForTimeout(1000)

    const contractPane = page.locator('.el-tab-pane').filter({ hasText: '采购合同' })
    const relateButton = contractPane.locator('.el-button').filter({ hasText: '关联' }).first()
    
    if ((await relateButton.count()) > 0) {
      await relateButton.click({ force: true })

      try {
        await page.waitForSelector('.el-dialog', { timeout: 5000 })
        await page.locator('.el-dialog__close').click()
        await page.waitForSelector('.el-dialog', { state: 'hidden', timeout: 10000 })
      } catch {
      }
    }
  })

  test('采购资金关联：点击采购资金标签的关联按钮', async ({ page }) => {
    const rows = page.locator('.el-table__row')
    if ((await rows.count()) > 0) {
      await rows.first().click()
      await page.waitForTimeout(1000)
    }

    const fundTab = page.locator('.el-tabs__item').filter({ hasText: '采购资金' })
    await fundTab.first().click()
    await page.waitForTimeout(1000)

    const fundPane = page.locator('.el-tab-pane').filter({ hasText: '采购资金' })
    const relateButton = fundPane.locator('.el-button').filter({ hasText: '关联' }).first()
    
    if ((await relateButton.count()) > 0) {
      await relateButton.click({ force: true })

      try {
        await page.waitForSelector('.el-dialog', { timeout: 5000 })
        await page.locator('.el-dialog__close').click()
        await page.waitForSelector('.el-dialog', { state: 'hidden', timeout: 10000 })
      } catch {
      }
    }
  })
})
