# AI-Powered Test Automation Framework for Semiconductor ERP System

基于 Playwright 的半导体 ERP 系统自动化测试框架，包含完整的端到端测试脚本和测试文档。

## 项目结构

```
tests/
├── context/                    # 测试上下文
│   ├── TEST_POLICY.md         # 测试策略文档
│   └── pages/                 # 页面地图文档
│       ├── login.md           # 登录页
│       ├── index.md           # 首页
│       ├── customer-demand-sop.md    # 客户SOP管理
│       ├── engineer-demand-sop.md    # 采购SOP管理
│       ├── sales-main.md      # 销售主单
│       ├── sales-sub.md       # 销售子单
│       ├── purchase-order.md  # 采购订单
│       ├── sale-price.md      # 销售价格
│       ├── purchase-price.md  # 采购价格
│       ├── customer-bill.md   # 客户账单
│       └── engineer-bill.md   # 工程师账单
├── generated/                 # 测试脚本
│   ├── .auth/                 # 认证状态缓存
│   ├── login.spec.ts          # 登录测试
│   ├── index.spec.ts          # 首页测试
│   ├── customer-demand-sop.spec.ts
│   ├── engineer-demand-sop.spec.ts
│   ├── sales-main.spec.ts
│   ├── sales-sub.spec.ts
│   ├── purchase-order.spec.ts
│   ├── sale-price.spec.ts
│   ├── purchase-price.spec.ts
│   ├── customer-bill.spec.ts
│   └── engineer-bill.spec.ts
└── README.md                  # 本文件
```

## 环境要求

- Node.js >= 16.0.0
- pnpm >= 8.6.0
- Playwright >= 1.61.1

## 安装步骤

### 1. 安装依赖

```bash
pnpm install
```

### 2. 安装 Playwright 浏览器

```bash
npx playwright install chromium
```

### 3. 创建配置文件

由于安全和路径原因，以下文件未上传到仓库，需要手动创建：

#### `playwright.config.ts`

项目根目录下的 Playwright 配置文件：

```typescript
/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: 1,
  timeout: 60000,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: 'https://admin.&&&&.com',
    actionTimeout: 30000,
    navigationTimeout: 60000,
    expect: {
      timeout: 15000,
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

#### `package.json`

项目根目录下的依赖配置文件：

```json
{
  "name": "******",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {},
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "devDependencies": {
    "@playwright/test": "^1.61.1",
    "@types/node": "^26.1.1"
  }
}
```

#### `.gitignore`

建议添加以下忽略规则：

```
node_modules/
playwright-report/
test-results/
*.log
.DS_Store
```

## 未上传的文件说明

由于安全、路径依赖或项目结构原因，以下文件未包含在本仓库中：

| 文件 | 说明 |
|------|------|
| `playwright.config.ts` | Playwright 配置文件，包含测试环境地址和路径配置，需根据本地环境调整 |
| `package.json` | 项目依赖配置，包含 `@playwright/test` 等依赖 |
| `node_modules/` | Node.js 依赖目录，体积大且可通过 `pnpm install` 重新安装 |
| `playwright-report/` | 测试报告目录，由测试运行时自动生成 |
| `test-results/` | 测试结果目录，包含 JUnit 和 JSON 格式报告 |
| `tests/generated/.auth/user.json` | 认证状态缓存文件（可选，首次运行时自动生成） |

## 运行测试

### 运行所有测试

```bash
npx playwright test
```

### 运行指定测试文件

```bash
npx playwright test tests/generated/login.spec.ts
```

### 运行测试并生成报告

```bash
npx playwright test --reporter=html
```

### 调试模式运行

```bash
npx playwright test tests/generated/login.spec.ts --debug
```

## 测试账号

测试脚本默认使用以下账号：

- 用户名：`ZHUJY`
- 密码：`******`

如需修改，可通过环境变量设置：

```bash
E2E_USERNAME=your_username E2E_PASSWORD=your_password npx playwright test
```

## 测试覆盖范围

| 页面 | 测试内容 |
|------|----------|
| 登录页 | 密码登录、验证码处理、错误提示 |
| 首页 | 导航菜单、用户信息、页面加载 |
| 客户SOP管理 | 搜索、新增、编辑、排序、更多操作 |
| 采购SOP管理 | 搜索、新增、编辑、排序、复制/删除 |
| 销售主单 | 搜索、标签页切换、子单/采购/样品流转操作 |
| 销售子单 | 新增、复制、编辑、搜索、采购订单/样品流转/资金关联 |
| 采购订单 | 搜索、新增、复制、编辑、样品流转/合同/资金关联 |
| 销售价格 | 价格管理相关操作 |
| 采购价格 | 采购价格管理相关操作 |
| 客户账单 | 账单管理相关操作 |
| 工程师账单 | 工程师账单管理相关操作 |

## 技术栈

- **测试框架**: Playwright 1.61.1
- **语言**: TypeScript
- **浏览器**: Chromium
- **报告**: HTML / JUnit / JSON

## 注意事项

1. 首次运行测试时，`tests/generated/.auth/user.json` 文件会自动生成，用于缓存登录状态
2. 测试脚本使用 `storageState` 复用登录状态，提升测试效率
3. 滑块验证码通过模拟鼠标拖拽自动处理
4. 建议在网络稳定的环境下运行测试，避免超时失败
5. 测试超时时间已设置为 60s，可根据实际网络情况调整

## License

MIT
