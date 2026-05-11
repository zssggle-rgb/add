# 深化设计：Web 加法器 REQ-20260507-001

## 元信息

| 字段 | 值 |
|------|-----|
| 需求 | REQ-20260507-001 |
| 分支 | bootstrap/add |
| 深化设计日期 | 2026-05-07 |
| 依据文档 | requirement.md, reviewed-plan.md, engineering-review.md, delivery-plan.md, product-design.md, system-architecture-design.md, test-plan.md |

---

## 1. 适用性判断

| 设计文档 | 是否适用 | 理由 |
|---------|---------|------|
| deep-design.md（本文） | 必填 | 编码前冻结实现契约 |
| api-design.md | **不适用** | 无 API、后端服务、路由或外部接口。纯前端单文件，无网络请求 |
| data-model-design.md | **不适用** | 无数据库、持久化数据、schema、模型、本地存储或缓存。应用状态在 DOM 中，无独立数据模型 |
| ui-design.md | 适用 | 存在页面、组件、交互状态、设计稿要求（精致实用风格） |
| data-flow-design.md | **不适用** | 无文件处理、文档解析、异步流程、外部 IO 或多步数据转换。输入→验证→计算→显示为同步简单流 |

---

## 2. 编码入口

### 入口文件

| 文件 | 路径 | 职责 |
|------|------|------|
| index.html | `/Users/sjs/add/index.html` | 唯一编码对象，包含 HTML 结构、CSS 样式、JS 逻辑 |

### 编码顺序

1. **HTML 结构**：容器、两个 input、运算符、等号、结果区、提示文字
2. **CSS 基础样式**：容器居中、字体、重置
3. **JS 骨架**：DOM 引用、事件绑定
4. **JS 核心逻辑**：验证→计算→显示
5. **CSS 交互状态**：focus、hover、active、error（含抖动动画）

### 关键约束

- **单文件**：所有代码（HTML/CSS/JS）在 `index.html` 内，不拆分
- **无外部依赖**：不使用 npm、框架、CDN
- **local_only CI**：不设自动化测试，人工验收

---

## 3. 接口契约摘要

> 本项目无外部 API 接口，以下为内部模块间合约。

### DOM 元素 ID 约定

| ID / 类名 | 类型 | 用途 |
|-----------|------|------|
| `#a` | `<input type="text">` | 第一个数字输入框 |
| `#b` | `<input type="text">` | 第二个数字输入框 |
| `#result` | `<span>` | 计算结果展示区 |
| `.error-icon` | `<span>` | 错误状态图标（×） |
| `.container` | `<div>` | 页面主容器 |
| `.hint` | `<p>` | 底部提示文字 |

### 事件合约

| 事件源 | 事件类型 | 处理器 | 触发条件 |
|--------|---------|-------|---------|
| `#a` | `input` | `handleInput` | 用户在输入框 A 输入任意字符 |
| `#b` | `input` | `handleInput` | 用户在输入框 B 输入任意字符 |

### 函数契约

| 函数名 | 入参 | 返回 | 副作用 |
|--------|------|------|--------|
| `validate(value)` | `string` | `boolean` — 是否为有效数字字符串 | 无 DOM 操作 |
| `calculate(a, b)` | `number, number` | `number` — 相加结果 | 无 |
| `showResult(value)` | `number` | `void` | 设置 `#result` textContent，清除 error 状态 |
| `showError()` | `void` | `void` | 设置 `#result` 为错误状态（文字 + 图标），触发抖动动画 |

### 双重验证策略

```
用户输入字符串
  → 正则验证: /^%-?\d*\.?\d*$/
  → 若正则失败 → showError()
  → 若正则通过 → parseFloat() 二次验证
  → 若 parseFloat 结果为 NaN → showError()
  → 若有效 → showResult(a + b)
```

---

## 4. 数据模型摘要

> 本项目无持久化数据模型。运行时状态完全存在于 DOM 中。

### 运行时状态

| 状态 | DOM 位置 | 说明 |
|------|---------|------|
| 输入框 A 值 | `input#a.value` | 字符串，用户输入 |
| 输入框 B 值 | `input#b.value` | 字符串，用户输入 |
| 结果区内容 | `span#result.textContent` | 数字字符串或 "×" 错误图标 |
| 错误状态 | CSS class `error` on `#result` | 布尔切换，控制红色文字和抖动 |

### 状态转换

```
输入框状态:
  Default: 边框 #d1d5db，白底
  Hover:   边框 #9ca3af
  Active:   边框 #6b7280，轻微下沉
  Focus:    边框 #2563eb，阴影 0 0 0 3px rgba(37,99,235,0.2)
  Error:    边框 #dc2626，背景微红

结果区状态:
  Default: 文字 #1a1a1a，32px/700
  Error:   文字 #dc2626 + × 图标 + 抖动动画
  Empty:   显示 "0"
```

---

## 5. 界面规格摘要

### 视觉规格（已冻结）

| 属性 | 值 |
|------|-----|
| 背景色 | `#f8f9fa` |
| 主文字色 | `#1a1a1a` |
| 蓝色 accent（focus） | `#2563eb` |
| 红色（error） | `#dc2626` |
| 边框色（default） | `#d1d5db` |
| 标题 H1 | 24px / 600 |
| 结果数字 | 32px / 700 |
| 提示文字 | 14px / #666 |
| 容器宽度 | max 400px |
| 输入框宽度 | 120px |
| 输入框高度 | 44px |
| 容器 padding | 32px |

### 交互规格

| 交互 | 行为 |
|------|------|
| Focus | 蓝色边框 + 3px 阴影 |
| Hover | 边框色加深至 #9ca3af |
| Active | 边框色更深 #6b7280 + translateY(1px) |
| Error | 红色边框 + 抖动动画 300ms |
| 结果过渡 | CSS transition 150ms ease-out |
| Tab 导航 | 在两个输入框之间切换 |

### 无障碍规格

| 规格 | 实现 |
|------|------|
| label | 视觉隐藏 label 关联 #a / #b |
| aria-label | `aria-label="第一个数字"` / `aria-label="第二个数字"` |
| aria-live | `#result` 设置 `aria-live="polite" aria-atomic="true"` |
| error 图标 | `aria-hidden="true"` |
| focus-visible | 键盘 focus 显示 2px outline（鼠标 focus 不显示） |

### 响应式规格

```css
@media (max-width: 480px) {
  .container { max-width: 100%; padding: 24px 16px; }
  input[type="text"] { width: 100px; }
}
viewport meta: <meta name="viewport" content="width=device-width, initial-scale=1">
```

---

## 6. 数据流摘要

### 同步数据流（4 条路径）

```
Happy path:
  用户输入 → input 事件 → validate() → parseFloat() →
  calculate(a,b) → showResult() → DOM 更新

Error path 1（正则失败）:
  用户输入 → input 事件 → validate() → 正则不匹配 → showError() → DOM 更新

Error path 2（parseFloat 失败）:
  用户输入 → input 事件 → validate() → 正则匹配 → parseFloat() → NaN → showError()

Empty/Nil path:
  空输入 → input 事件 → validate() → parseFloat('') = NaN →
  isNaN check → showResult(0)
```

### 关键数据转换

| 步骤 | 输入 | 输出 |
|------|------|------|
| 正则验证 | 字符串 | boolean |
| parseFloat | 字符串 | number \| NaN |
| isNaN check | number \| NaN | boolean |
| calculate | number, number | number |
| showResult | number | void（DOM side effect） |

---

## 7. 验收映射

### 验收标准 → 实现检查点

| 验收标准 | 实现检查点 |
|---------|-----------|
| 页面可以打开 | 双击 index.html 在浏览器直接打开，无服务器依赖 |
| 有两个数字输入框 | `<input id="a">` 和 `<input id="b">` 存在 |
| 输入数字后实时显示相加结果 | `input` 事件监听 → `handleInput()` → `showResult()` 实时执行 |
| 非法输入有错误提示 | 正则 `/^-?\d*\.?\d*$/` + parseFloat 双重验证 → `showError()` |
| 空输入不报错，按 0 处理 | `parseFloat('')` = NaN → `isNaN` → `showResult(0)` |
| Focus 状态有视觉反馈 | CSS `:focus` → 蓝色边框 + 阴影 |

### 测试矩阵（来自 test-plan.md）

| # | 场景 | 输入 A | 输入 B | 预期结果 |
|---|-----|-------|-------|---------|
| 1 | 正常相加 | 3 | 5 | 8 |
| 2 | 负数相加 | -3 | 5 | 2 |
| 3 | 小数相加 | 1.5 | 2.5 | 4 |
| 4 | 空 + 数字 | (空) | 5 | 5 |
| 5 | 数字 + 空 | 3 | (空) | 3 |
| 6 | 双空 | (空) | (空) | 0 |
| 7 | 非法字符 | a | 5 | 错误提示 |
| 8 | 边界 --5 | --5 | 3 | 错误提示 |
| 9 | 边界 1..2 | 1..2 | 3 | 错误提示 |

### 交互验收清单

| # | 场景 | 预期 |
|---|-----|------|
| 1 | Tab 切换焦点 | Focus 视觉效果正常切换 |
| 2 | 点击输入框 | 蓝色边框 + 阴影 |
| 3 | 输入非法字符 'a' | 红色边框 + 抖动动画 |
| 4 | 结果变化 | 数字平滑过渡（150ms） |
| 5 | 双击结果区 | 选中结果文本 |

---

## 8. 风险和未决项

### 已识别风险

| 风险 | 等级 | 缓解措施 |
|------|------|---------|
| 正则 `/^-?\d*\.?\d*$/` 对科学计数法（如 `1e10`）的匹配行为未明确 | 低 | 人工验收矩阵不包含科学计数法；若用户输入科学计数法显示为错误，可接受 |
| 极大/极小数的显示格式（JavaScript 科学计数法）未指定 | 低 | MVP 阶段接受默认 JavaScript 数字显示格式，不做特殊处理 |

### 未决项

| 未决项 | 状态 | 说明 |
|--------|------|------|
| 超大数字显示格式 | 开放 | 不在测试矩阵中；接受 JavaScript 默认行为（科学计数法或普通数字） |
| 科学计数法输入处理 | 开放 | 规划阶段未涉及；MVP 不支持科学计数法输入作为合法数字 |

### 边界约束

- **禁止在实现阶段发明新契约**：所有实现必须严格遵循本文档约束
- **不添加测试矩阵外的功能**：如多数字连加、历史记录、键盘快捷键
- **不引入外部依赖**：不使用任何 npm 包、框架或 CDN

---

## 9. 实现里程碑

```
M1: index.html 骨架 + HTML 结构
M2: CSS 基础样式（容器居中、字体、颜色）
M3: JS DOM 引用 + 事件绑定
M4: validate() + calculate() + showResult() + showError()
M5: CSS 交互状态（focus/hover/active/error + 动画）
M6: 无障碍属性（label, aria, focus-visible）
M7: 响应式断点
M8: 人工验收所有 9 个测试矩阵场景 + 5 个交互场景
```