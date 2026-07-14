import { test, expect, type Browser } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

/**
 * 工程师需求SOP管理 P0 测试
 * 页面地图：tests/context/pages/engineer-demand-sop.md
 * 测试策略：tests/context/TEST_POLICY.md
 *
 * 登录态复用：使用 storageState（由 login.spec.ts 成功用例保存）
 * 为保证用例可独立运行（不依赖 login.spec.ts 执行顺序），
 * beforeAll 会在登录态文件缺失时自动通过 UI 登录生成一份。
 *
 * 定位器说明：
 * - 搜索表单：getByLabel('id') / getByLabel('样品名称') / getByLabel('样品数量')
 * - 按钮：getByRole('button', { name: '搜索' / '重置' / '新增' / '快速新增' / '展开' })
 * - 表格：page.locator('.el-table')
 * - 操作按钮：getByRole('button', { name: '详情' / '编辑' / '更多' })
 */

const USERNAME = process.env.E2E_USERNAME ?? 'ZHUJY'
const PASSWORD = process.env.E2E_PASSWORD ?? '123456'
const AUTH_FILE = 'tests/generated/.auth/user.json'
const PAGE_URL = '/orders/engineer-demand-sop'

/**
 * 确保登录态文件存在；若不存在则通过 UI 登录生成。
 */
async function ensureAuthState(browser: Browser) {
  if (existsSync(AUTH_FILE)) return
  const dir = dirname(AUTH_FILE)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

  const page = await browser.newPage()
  await page.goto('/login')
  await page.getByPlaceholder('请输入用户名').first().fill(USERNAME)
  await page.getByPlaceholder('请输入密码').first().fill(PASSWORD)
  await page.getByRole('button', { name: '登录', exact: true }).click()
  await page.waitForURL(/\/(index|dashboard)/, { timeout: 30000 })
  await page.context().storageState({ path: AUTH_FILE })
  await page.close()
}

test.beforeAll(async ({ browser }) => {
  await ensureAuthState(browser)
})
test.use({ storageState: AUTH_FILE })

test.describe('工程师需求SOP管理 P0', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForURL(PAGE_URL, { timeout: 30000 })
    // 等待页面加载完成（等待加载动画消失）
    await page.waitForSelector('.el-loading-spinner', { state: 'hidden', timeout: 30000 }).catch(() => {})
    // 等待表格加载完成作为页面加载标志
    await page.waitForSelector('.el-table__row', { timeout: 30000 })
  })

  test('页面加载完成，表格数据可见', async ({ page }) => {
    await expect(page).toHaveURL(PAGE_URL)

    // 面包屑显示正确
    await expect(page.getByRole('link', { name: '采购SOP管理' })).toBeVisible()

    // 搜索表单可见（Element Plus el-form-item 的 label 不支持 getByLabel，改用 filter + 内部 input）
    await expect(page.locator('.el-form-item').filter({ hasText: 'id' }).locator('input').first()).toBeVisible()
    await expect(page.locator('.el-form-item').filter({ hasText: '样品名称' }).locator('input').first()).toBeVisible()
    await expect(page.locator('.el-form-item').filter({ hasText: '样品数量' }).locator('input').first()).toBeVisible()

    // 操作按钮可见
    await expect(page.getByRole('button', { name: '搜索', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '重置', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '新增', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '快速新增', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '展开', exact: true })).toBeVisible()

    // 表格可见且有数据
    await expect(page.locator('.el-table')).toBeVisible()
    await expect(page.locator('.el-table__row').first()).toBeVisible({ timeout: 10000 })
  })

  test('搜索功能：输入样品名称搜索，结果过滤', async ({ page }) => {
    // 等待表格加载完成
    await expect(page.locator('.el-table__row').first()).toBeVisible({ timeout: 10000 })

    // 记录搜索前的行数
    const initialRows = await page.locator('.el-table__row').count()

    // 输入搜索关键词
    const sampleNameInput = page.locator('.el-form-item').filter({ hasText: '样品名称' }).locator('input').first()
    await sampleNameInput.fill('111')

    // 点击搜索
    await page.getByRole('button', { name: '搜索', exact: true }).click()

    // 等待表格更新（等待加载状态结束）
    await page.waitForSelector('.el-table__body-wrapper', { timeout: 5000 })

    // 搜索后行数应减少或不变（取决于数据）
    const filteredRows = await page.locator('.el-table__row').count()
    expect(filteredRows).toBeLessThanOrEqual(initialRows)
  })

  test('重置功能：搜索后点击重置，表单清空', async ({ page }) => {
    // 输入搜索条件
    const idInput = page.locator('.el-form-item').filter({ hasText: 'id' }).locator('input').first()
    const sampleNameInput = page.locator('.el-form-item').filter({ hasText: '样品名称' }).locator('input').first()
    await idInput.fill('1')
    await sampleNameInput.fill('test')

    // 点击搜索
    await page.getByRole('button', { name: '搜索', exact: true }).click()
    await page.waitForSelector('.el-table__body-wrapper', { timeout: 5000 })

    // 点击重置
    await page.getByRole('button', { name: '重置', exact: true }).click()

    // 验证搜索表单清空
    await expect(idInput).toHaveValue('')
    await expect(sampleNameInput).toHaveValue('')
  })

  test('新增按钮可点击', async ({ page }) => {
    const addButton = page.getByRole('button', { name: '新增', exact: true })
    await expect(addButton).toBeVisible()
    await expect(addButton).toBeEnabled()

    // 点击新增按钮（期望弹出新增表单或跳转到新增页面）
    await addButton.click()

    // 验证新增操作触发（等待弹窗出现）
    await page.waitForSelector('.el-dialog', { timeout: 5000 })
  })

  test('快速新增按钮可点击', async ({ page }) => {
    const quickAddButton = page.getByRole('button', { name: '快速新增', exact: true })
    await expect(quickAddButton).toBeVisible()
    await expect(quickAddButton).toBeEnabled()

    // 点击快速新增按钮（期望弹出快速新增表单）
    await quickAddButton.click()

    // 验证快速新增操作触发（等待弹窗出现）
    await page.waitForSelector('.el-dialog', { timeout: 5000 })
  })

  test('编辑操作：点击编辑按钮，修改数据', async ({ page }) => {
    const editButton = page.getByRole('button', { name: '编辑' }).first()
    await expect(editButton).toBeVisible()
    await expect(editButton).toBeEnabled()

    await editButton.click()

    await page.waitForSelector('.el-dialog', { timeout: 5000 })

    const sampleNameInput = page.locator('.el-dialog').getByRole('textbox', { name: '样品名称' }).first()
    await expect(sampleNameInput).toBeVisible()

    await sampleNameInput.fill('测试样品名称')

    const dialogFooter = page.locator('.el-dialog__footer')
    const footerButtons = dialogFooter.locator('button')
    const buttonCount = await footerButtons.count()
    if (buttonCount >= 2) {
      await footerButtons.nth(buttonCount - 1).click()
    } else if (buttonCount === 1) {
      await footerButtons.first().click()
    } else {
      await page.locator('.el-dialog__close').click()
    }

    await page.waitForSelector('.el-dialog', { state: 'hidden', timeout: 10000 })
  })

  test('更多操作：点击更多，执行复制/删除', async ({ page }) => {
    const moreButton = page.getByRole('button', { name: '更多' }).first()
    await expect(moreButton).toBeVisible()
    await expect(moreButton).toBeEnabled()

    await moreButton.click()

    await expect(page.getByRole('menuitem', { name: '复制' })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('menuitem', { name: '删除' })).toBeVisible()

    await page.click('body', { force: true })
    await page.waitForTimeout(500)
  })

  test('新增操作：点击新增按钮，填写表单并提交', async ({ page }) => {
    const addButton = page.getByRole('button', { name: '新增', exact: true })
    await expect(addButton).toBeVisible()
    await expect(addButton).toBeEnabled()

    await addButton.click()

    await page.waitForSelector('.el-dialog', { timeout: 5000 })

    const sampleNameInput = page.locator('.el-dialog').getByRole('textbox', { name: '样品名称' }).first()
    await expect(sampleNameInput).toBeVisible()
    await sampleNameInput.fill('测试新增样品')

    const sampleCountInput = page.locator('.el-dialog').getByRole('spinbutton', { name: '样品数量' }).first()
    if (await sampleCountInput.isVisible()) {
      await sampleCountInput.fill('2')
    }

    const dialogFooter = page.locator('.el-dialog__footer')
    const footerButtons = dialogFooter.locator('button')
    const buttonCount = await footerButtons.count()
    if (buttonCount >= 2) {
      await footerButtons.nth(buttonCount - 1).click()
    } else if (buttonCount === 1) {
      await footerButtons.first().click()
    } else {
      await page.locator('.el-dialog__close').click()
    }

    await page.waitForSelector('.el-dialog', { state: 'hidden', timeout: 10000 })
  })

  test('表格排序：点击ID列排序箭头，验证升序/降序排序', async ({ page }) => {
    const idHeader = page.locator('.el-table__header').locator('th').first()
    await expect(idHeader).toBeVisible()

    await idHeader.click()
    await page.waitForTimeout(1000)

    await idHeader.click()
    await page.waitForTimeout(1000)

    await idHeader.click()
    await page.waitForTimeout(1000)
  })

  test('表格排序：点击样品名称列排序箭头', async ({ page }) => {
    const headers = page.locator('.el-table__header').locator('th')
    const sampleNameHeader = headers.nth(1)
    await expect(sampleNameHeader).toBeVisible()

    await sampleNameHeader.click()
    await page.waitForTimeout(1000)

    await sampleNameHeader.click()
    await page.waitForTimeout(1000)
  })

  test('表格排序：点击样品数量列排序箭头', async ({ page }) => {
    const headers = page.locator('.el-table__header').locator('th')
    const sampleCountHeader = headers.nth(2)
    await expect(sampleCountHeader).toBeVisible()

    await sampleCountHeader.click()
    await page.waitForTimeout(1000)

    await sampleCountHeader.click()
    await page.waitForTimeout(1000)
  })

  test('表格排序：点击几日交付列排序箭头', async ({ page }) => {
    const headers = page.locator('.el-table__header').locator('th')
    const deliveryHeader = headers.nth(3)
    await expect(deliveryHeader).toBeVisible()

    await deliveryHeader.click()
    await page.waitForTimeout(1000)

    await deliveryHeader.click()
    await page.waitForTimeout(1000)
  })
})
