import { test, expect, type Browser } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

/**
 * 首页 P0 测试
 * 页面地图：tests/context/pages/index.md
 * 测试策略：tests/context/TEST_POLICY.md
 *
 * 登录态复用：使用 storageState（由 login.spec.ts 成功用例保存）
 * 为保证首页用例可独立运行（不依赖 login.spec.ts 执行顺序），
 * beforeAll 会在登录态文件缺失时自动通过 UI 登录生成一份。
 *
 * 定位器说明：
 * - 侧边栏菜单：role="menuitem"，如 getByRole('menuitem', { name: '首页' }).first()
 * - 用户头像：.el-avatar（Element Plus 头像组件）
 * - 用户姓名：页面右上角显示的当前登录用户名
 * - 页脚：北京聚睿众邦科技有限公司、让连接更简单，让服务更贴心
 * - 顶部导航栏：.v-tool-header
 */

const USERNAME = process.env.E2E_USERNAME ?? 'ZHUJY'
const PASSWORD = process.env.E2E_PASSWORD ?? '123456'
const AUTH_FILE = 'tests/generated/.auth/user.json'

/**
 * 确保登录态文件存在；若不存在则通过 UI 登录生成。
 * 这样每个首页测试用例都能独立运行，互不依赖其它 spec 的执行顺序。
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

// 所有用例复用登录态（storageState）
test.beforeAll(async ({ browser }) => {
  await ensureAuthState(browser)
})
test.use({ storageState: AUTH_FILE })

test.describe('首页 P0', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index')
    await page.waitForURL('/index')
    // 等待页面加载完成（等待加载动画消失）
    await page.waitForSelector('.el-loading-spinner', { state: 'hidden', timeout: 30000 }).catch(() => {})
    // 等待页脚出现作为加载完成标志
    await page.waitForSelector('text=北京聚睿众邦科技有限公司', { timeout: 30000 })
  })
  test('登录后自动跳转到首页，页面加载完成', async ({ page }) => {
    await expect(page).toHaveURL('/index')

    // 页脚公司信息可见，表明整体布局已加载完成
    await expect(page.getByText('北京聚睿众邦科技有限公司')).toBeVisible({ timeout: 30000 })
    await expect(page.getByText('让连接更简单，让服务更贴心')).toBeVisible({ timeout: 30000 })
  })

  test('侧边栏菜单可见且可点击', async ({ page }) => {
    await expect(page).toHaveURL('/index')

    // 侧边栏「首页」菜单项可见
    const homeMenu = page.getByRole('menuitem', { name: '首页' }).first()
    await expect(homeMenu).toBeVisible({ timeout: 30000 })

    // 侧边栏核心菜单项可见（验证权限加载正常）
    await expect(page.getByRole('menuitem', { name: '订单管理' }).first()).toBeVisible({ timeout: 30000 })
    await expect(page.getByRole('menuitem', { name: '实验室管理' }).first()).toBeVisible({ timeout: 30000 })
    await expect(page.getByRole('menuitem', { name: '供应商' }).first()).toBeVisible({ timeout: 30000 })
    await expect(page.getByRole('menuitem', { name: '财务中心' }).first()).toBeVisible({ timeout: 30000 })

    // 点击「首页」菜单项，确认可交互
    await homeMenu.click()
    await expect(page).toHaveURL('/index')
  })

  test('顶部导航栏用户信息可见', async ({ page }) => {
    await expect(page).toHaveURL('/index')

    // 用户头像可见（Element Plus 头像组件）
    await expect(page.locator('.el-avatar')).toBeVisible({ timeout: 30000 })

    // 用户姓名可见（当前登录用户）
    await expect(page.locator('.v-user-info')).toBeVisible({ timeout: 30000 })
  })

  test('页面布局完整（侧边栏 + 导航栏 + 页脚）', async ({ page }) => {
    await expect(page).toHaveURL('/index')

    // 左侧侧边栏可见
    await expect(page.locator('[class*="left-menu"]').first()).toBeVisible({ timeout: 30000 })

    // 顶部导航栏可见
    await expect(page.locator('.v-tool-header')).toBeVisible({ timeout: 30000 })

    // 面包屑可见
    await expect(page.getByText('首页').first()).toBeVisible({ timeout: 30000 })

    // 页脚可见
    await expect(page.getByText('北京聚睿众邦科技有限公司')).toBeVisible({ timeout: 30000 })
  })
})
