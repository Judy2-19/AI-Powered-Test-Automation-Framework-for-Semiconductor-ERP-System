# 页面：登录页

- 路由：/login
- 入口：直接访问测试环境 URL
- 前置：未登录状态

## 关键区域与精确定位器

| 区域 | 定位器 | 说明 |
|------|--------|------|
| 用户名输入框 | `getByPlaceholder('请输入用户名').first()` | placeholder 来自 i18n `login.usernamePlaceholder` |
| 密码输入框 | `getByPlaceholder('请输入密码').first()` | placeholder 来自 i18n `login.passwordPlaceholder` |
| 登录按钮 | `getByRole('button', { name: '登录', exact: true })` | 文案来自 i18n `login.login`，必须 `exact` 以排除「手机登录」「二维码登录」 |
| 返回按钮 | `getByRole('button', { name: '返回', exact: true })` | 文案来自 i18n `login.backLogin`，用于从其它登录模式切回密码登录 |
| 必填校验提示 | `getByText('该项为必填项').first()` | 来自 i18n `common.required` |
| 错误 toast | `page.locator('.el-message--error')` | Element Plus 全局消息，登录失败时出现 |

## 登录模式切换机制

本项目登录页**没有**「密码登录/手机登录」切换标签，登录方式通过各表单底部的按钮切换：

- **密码登录**为默认模式（`useLogin.ts` 中 `currentState` 默认 `LoginStateEnum.LOGIN`）
- 其它模式（手机登录 / 二维码登录 / 注册 / 忘记密码）各自带「返回」按钮，点击可回到密码登录
- 所有表单同时存在于 DOM 中，通过 `v-show`（`display:none`）控制显隐

**填写账号密码前必须确保处于密码登录模式**，推荐做法：

```ts
async function ensurePasswordLoginMode(page) {
  const usernameInput = page.getByPlaceholder('请输入用户名').first()
  const backButton = page.getByRole('button', { name: '返回', exact: true })
  // 等待密码登录表单或返回按钮出现
  await expect(usernameInput.or(backButton)).toBeVisible()
  // 已在密码登录模式则直接返回
  if (await usernameInput.isVisible()) return
  // 否则点击「返回」按钮切回密码登录
  await backButton.click()
  await expect(usernameInput).toBeVisible()
}
```

## placeholder 冲突说明（必须用 .first()）

- `getByPlaceholder('请输入用户名')` —— 仅 [LoginForm.vue](../../../mige-vue-master/src/views/Login/components/LoginForm.vue) 使用，但仍建议 `.first()` 保持一致
- `getByPlaceholder('请输入密码')` —— **存在冲突**：[ForgetPasswordForm.vue:81](../../../mige-vue-master/src/views/Login/components/ForgetPasswordForm.vue) 也使用「请输入密码」placeholder。虽在密码登录模式下隐藏（`v-show`），但 `getByPlaceholder` 会匹配 DOM 中所有元素（含隐藏），导致严格模式报错。**所有 `getByPlaceholder` 必须加 `.first()`**
- LoginForm 在 [Login.vue](../../../mige-vue-master/src/views/Login/Login.vue) 中第一个渲染，`.first()` 始终命中密码登录表单的输入框

## P0 场景

1. 用正确的账号密码登录，跳转到首页
2. 用错误的密码登录，显示错误提示
3. 账号或密码为空时，提示必填

## 测试数据

- 正确账号：`e2e_admin` / `E2E_Admin@123`（需提前在测试环境创建，可用 `E2E_USERNAME` / `E2E_PASSWORD` 环境变量覆盖）
- 错误密码：`wrongpassword`

## 成功标准（断言口径）

- 登录成功 → URL 变为 `/index` 或 `/dashboard`（路由 `/` 重定向到 `/index`）
- 登录失败 → 出现错误 toast（`.el-message--error`）或包含「错误 / 失败 / 不正确 / 不存在」的提示信息，且 URL 仍在 `/login`
- 空字段提交 → 出现「该项为必填项」校验提示，且 URL 仍在 `/login`

## 已知坑

- 登录按钮在输入完整前可能禁用，用 `expect(button).toBeEnabled()` 等待
- 登录后跳转，用 `page.waitForURL(/\/(index|dashboard)/)` 等待，不要用 `waitForTimeout`
- **验证码**：`VITE_APP_CAPTCHA_ENABLE=true` 时点击登录会弹出滑块验证码，测试环境建议关闭；若开启需额外处理验证码弹窗
- **placeholder 冲突**：所有 `getByPlaceholder` 必须加 `.first()`（ForgetPasswordForm 共用「请输入密码」placeholder）
- **登录模式**：填写前需确保处于密码登录模式（默认即是，但建议调用 `ensurePasswordLoginMode` 防御）
- **记住我缓存**：表单可能被「记住我」缓存预填值，空字段测试用例需先 `fill('')` 清空
- **租户**：租户由域名自动识别（`getTenantByWebsite`），无需手动输入租户名
