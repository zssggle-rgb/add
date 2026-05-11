# 界面设计：Web 加法器 REQ-20260507-001

> 本文档补充 deep-design.md 中的界面规格，为编码阶段提供精确的 UI 约束。

## 1. 页面结构

```
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>加法器</title>
  <style>/* 内联 CSS */</style>
</head>
<body>
  <div class="container">
    <h1>加法器</h1>
    <div class="calculator">
      <label for="a" class="sr-only">第一个数字</label>
      <input id="a" type="text" inputmode="decimal" aria-label="第一个数字" />
      <span class="operator">+</span>
      <label for="b" class="sr-only">第二个数字</label>
      <input id="b" type="text" inputmode="decimal" aria-label="第二个数字" />
      <span class="equals">=</span>
      <span id="result" aria-live="polite" aria-atomic="true">0</span>
    </div>
    <p class="hint">输入数字，实时计算</p>
  </div>
  <script>/* 内联 JS */</script>
</body>
</html>
```

---

## 2. CSS 规格（精确值）

### 颜色系统

| 变量 | 色值 | 用途 |
|------|------|------|
| --bg | `#f8f9fa` | 页面背景 |
| --text | `#1a1a1a` | 主文字 |
| --accent | `#2563eb` | focus 边框、阴影 |
| --error | `#dc2626` | error 边框、文字 |
| --border-default | `#d1d5db` | 输入框默认边框 |
| --border-hover | `#9ca3af` | hover 状态边框 |
| --border-active | `#6b7280` | active 状态边框 |
| --hint-color | `#666666` | 提示文字 |

### 字体

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

### 尺寸规格

| 元素 | 属性 | 值 |
|------|------|-----|
| 容器 | max-width | 400px |
| 容器 | padding | 32px |
| H1 标题 | font-size | 24px |
| H1 标题 | font-weight | 600 |
| 结果数字 | font-size | 32px |
| 结果数字 | font-weight | 700 |
| 提示文字 | font-size | 14px |
| 提示文字 | color | #666 |
| 输入框 | width | 120px |
| 输入框 | height | 44px |
| 输入框 | border-width | 1px |
| 输入框 | border-radius | 6px |
| 输入框 | padding | 12px |

### CSS Reset（内联）

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```

---

## 3. 组件规格

### 输入框 `#a`, `#b`

**Default 状态**
```css
border: 1px solid #d1d5db;
background: #ffffff;
border-radius: 6px;
```

**Hover 状态**
```css
border-color: #9ca3af;
```

**Active 状态**
```css
border-color: #6b7280;
transform: translateY(1px);
```

**Focus 状态**
```css
border-color: #2563eb;
box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
outline: none;
```

**Focus-visible 状态（仅键盘）**
```css
input:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```

**Error 状态**
```css
border-color: #dc2626;
background: #fef2f2;
```

### 结果区 `#result`

**Default 状态**
```css
font-size: 32px;
font-weight: 700;
color: #1a1a1a;
transition: color 150ms ease-out;
```

**Error 状态**
```css
color: #dc2626;
animation: shake 300ms ease-out;
```

### 抖动动画

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-4px); }
  75%       { transform: translateX(4px); }
}
```

### 过渡

```css
transition: all 150ms ease-out;
```

---

## 4. 布局规格

### 容器布局

```css
body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.container {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 32px;
  width: 100%;
  max-width: 400px;
}
```

### 计算器行布局

```css
.calculator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 24px 0;
}

.operator, .equals {
  font-size: 24px;
  font-weight: 600;
  color: #666;
  user-select: none;
}
```

### 响应式断点

```css
@media (max-width: 480px) {
  .container {
    max-width: 100%;
    padding: 24px 16px;
    border-radius: 8px;
    margin: 16px;
  }
  input[type="text"] {
    width: 100px;
  }
  .calculator {
    gap: 8px;
  }
}
```

---

## 5. 无障碍规格

### Label 隐藏

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### ARIA 属性

| 元素 | 属性 | 值 |
|------|------|-----|
| `#a` | `aria-label` | `"第一个数字"` |
| `#b` | `aria-label` | `"第二个数字"` |
| `#result` | `aria-live` | `"polite"` |
| `#result` | `aria-atomic` | `"true"` |
| `.error-icon` | `aria-hidden` | `"true"` |

---

## 6. 组件状态汇总

### 输入框状态

| 状态 | 边框色 | 背景 | 其他 |
|------|--------|------|------|
| Default | #d1d5db | white | — |
| Hover | #9ca3af | white | — |
| Active | #6b7280 | white | translateY(1px) |
| Focus | #2563eb | white | box-shadow |
| Error | #dc2626 | #fef2f2 | — |

### 结果区状态

| 状态 | 文字色 | 图标 | 动画 |
|------|--------|------|------|
| Default | #1a1a1a | 无 | 无 |
| Error | #dc2626 | × | 抖动 300ms |

---

## 7. 错误状态具体表现

错误触发时：
1. 输入框边框变 #dc2626，背景变 #fef2f2
2. `#result` 文字变 #dc2626
3. `#result` 附加 `.error` class，触发 shake 动画
4. 错误图标 × 显示在结果区（通过 JavaScript 控制）