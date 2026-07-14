import { test, expect, type Page } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

/**
 * 登录页 P0 测试
 * 页面地图：tests/context/pages/login.md
 * 测试策略：tests/context/TEST_POLICY.md
 *
 * 定位器说明：
 * - 用户名输入框 placeholder：请输入用户名（src/locales/zh-CN.ts login.usernamePlaceholder）
 * - 密码输入框 placeholder：请输入密码（login.passwordPlaceholder）
 *   ⚠️ ForgetPasswordForm 也使用「请输入密码」placeholder，故所有 getByPlaceholder 均用 .first()
 * - 登录按钮文案：登录（login.login），使用 exact 避免误匹配「手机登录」「二维码登录」
 * - 必填校验提示：该项为必填项（common.required）
 * - 返回按钮文案：返回（login.backLogin），用于从其它登录模式切回密码登录
 */

// 测试数据（可通过环境变量覆盖）
const USERNAME = process.env.E2E_USERNAME ?? 'ZHUJY'
const PASSWORD = process.env.E2E_PASSWORD ?? '123456'
const WRONG_PASSWORD = 'wrongpassword'

// 登录态持久化文件，供 index.spec.ts 复用
const AUTH_FILE = 'tests/generated/.auth/user.json'

/**
 * 确保处于「密码登录」模式。
 *
 * 本项目登录页没有「密码登录/手机登录」切换标签，登录方式通过表单底部的按钮切换：
 *   - 密码登录为默认模式（useLogin.ts 中 currentState 默认 LOGIN）
 *   - 其它模式（手机/二维码/注册/忘记密码）各自带「返回」按钮，点击可回到密码登录
 *
 * 逻辑：等待「用户名输入框」或「返回按钮」任一可见后，
 *   - 若用户名输入框可见 → 已在密码登录模式
 *   - 否则点击「返回」按钮切回密码登录模式
 */
async function ensurePasswordLoginMode(page: Page) {
  const usernameInput = page.getByPlaceholder('请输入用户名').first()
  const backButton = page.getByRole('button', { name: '返回', exact: true })

  // 等待密码登录表单或返回按钮出现（兼容页面加载时序与非常规模式）
  await expect(usernameInput.or(backButton)).toBeVisible()

  // 已在密码登录模式则直接返回
  if (await usernameInput.isVisible()) return

  // 点击可见的「返回」按钮切回密码登录（getByRole 自动过滤隐藏元素）
  await backButton.click()
  await expect(usernameInput).toBeVisible()
}

/**
 * 自动完成滑块验证码（若出现）。
 * 测试环境开启了安全验证，点击登录后会弹出滑块验证弹窗。
 * 验证码特征：标题"请完成安全验证"，滑块下方有"向右滑动完成验证"文字
 * 滑块是一个带拼图图案的白色方块，需要从左拖到右
 */
async function solveCaptcha(page: Page) {
  try {
    // 等待验证码弹窗出现（5秒超时，没出现就跳过）
    const captchaTitle = page.getByText('请完成安全验证').first()
    await captchaTitle.waitFor({ timeout: 5000 })
    console.log('Captcha found, attempting to solve...')

    // 查找滑块轨道（包含"向右滑动完成验证"文字的元素）
    const track = page.locator('div').filter({ hasText: '向右滑动完成验证' }).first()
    const trackBox = await track.boundingBox()
    
    // 查找滑块按钮（轨道内的可拖动元素）
    // 滑块通常是轨道内的一个子元素，可能有特定样式
    const slider = track.locator('div').first()
    const sliderBox = await slider.boundingBox()
    
    if (sliderBox && trackBox) {
      // 计算拖动距离：从滑块左侧到轨道右侧，减去滑块宽度
      const startX = sliderBox.x + sliderBox.width / 2
      const startY = sliderBox.y + sliderBox.height / 2
      const endX = trackBox.x + trackBox.width - sliderBox.width / 2
      const dragDistance = endX - startX
      
      console.log(`Slider position: (${startX}, ${startY}), drag distance: ${dragDistance}`)
      
      // 拖动滑块
      await page.mouse.move(startX, startY)
      await page.mouse.down()
      
      // 缓慢拖动到目标位置
      await page.mouse.move(endX, startY, { steps: 40 })
      await page.mouse.up()
      
      // 等待验证完成
      await page.waitForTimeout(2000)
      console.log('Captcha slider dragged')
    }

    // 等待验证码弹窗消失（不阻塞，超时后继续）
    try {
      await captchaTitle.waitFor({ state: 'hidden', timeout: 5000 })
      console.log('Captcha solved successfully')
    } catch {
      console.log('Captcha not hidden after solve, trying to close...')
      // 尝试关闭弹窗
      const closeBtn = page.locator('.verifybox-close').first().or(page.getByRole('button', { name: '关闭' }).first())
      if (await closeBtn.isVisible()) {
        await closeBtn.click()
      }
    }
  } catch (e) {
    // 没有验证码或验证失败，继续执行
    console.log('No captcha or captcha skipped:', e.message)
  }
}

test.describe('登录页 P0', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    // 填写账号密码前，先确保处于密码登录模式
    await ensurePasswordLoginMode(page)
  })

  test('用正确账号密码登录，跳转到首页', async ({ page }) => {
    // 确保登录态目录存在
    const dir = dirname(AUTH_FILE)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

    await page.getByPlaceholder('请输入用户名').first().fill(USERNAME)
    await page.getByPlaceholder('请输入密码').first().fill(PASSWORD)

    // 页面上有两个登录按钮（密码登录和手机登录），确保点击蓝色的密码登录按钮
    // 通过获取所有登录按钮并选择第一个可见且可用的
    const loginButtons = page.getByRole('button', { name: '登录', exact: true })
    const loginButton = loginButtons.first()
    await expect(loginButton).toBeVisible()
    await expect(loginButton).toBeEnabled()
    await loginButton.click()

    // 处理滑块验证码（若出现）
    await solveCaptcha(page)

    // 验证码解决后，等待一小段时间让前端处理验证结果
    await page.waitForTimeout(2000)

    // 验证码解决后，可能需要重新点击登录按钮才能真正登录
    // 检查是否还在登录页，如果是则重新点击登录
    if (page.url().includes('/login')) {
      // 重新获取登录按钮（可能已重新渲染）
      const newLoginButton = page.getByRole('button', { name: '登录', exact: true }).first()
      await newLoginButton.click()
    }

    // 登录成功后跳转到首页（路由 / 重定向到 /index）
    await page.waitForURL(/\/(index|dashboard)/, { timeout: 30000 })
    await expect(page).toHaveURL(/\/(index|dashboard)/)

    // 保存登录态，供首页测试复用（storageState）
    await page.context().storageState({ path: AUTH_FILE })
  })

  test('用错误密码登录，显示错误提示', async ({ page }) => {
    await page.getByPlaceholder('请输入用户名').first().fill(USERNAME)
    await page.getByPlaceholder('请输入密码').first().fill(WRONG_PASSWORD)

    await page.getByRole('button', { name: '登录', exact: true }).click()

    // 处理滑块验证码（若出现）
    await solveCaptcha(page)

    // 登录失败：验证仍在登录页（不跳转即为失败）
    await expect(page).toHaveURL(/\/login/)

    // 等待页面加载稳定后检查错误提示
    await page.waitForTimeout(2000)

    // 错误提示可能以多种形式出现，兼容所有情况
    const errorHint = page.locator('.el-message--error').or(
      page.locator('.el-form-item__error').or(
        page.getByText(/错误|失败|不正确|不存在|密码错误/)
      )
    )
    await expect(errorHint).toBeVisible({ timeout: 10000 })
  })

  test('账号或密码为空时提示必填', async ({ page }) => {
    // 清空可能由「记住我」缓存或环境变量预填的值
    await page.getByPlaceholder('请输入用户名').first().fill('')
    await page.getByPlaceholder('请输入密码').first().fill('')

    await page.getByRole('button', { name: '登录', exact: true }).click()

    // 表单校验触发，出现必填提示（common.required = 该项为必填项）
    await expect(page.getByText('该项为必填项').first()).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })
})
