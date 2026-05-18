const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

const pageUrl = pathToFileURL(path.resolve(__dirname, '../../index.html')).href;

async function openAddPage(page) {
  await page.goto(pageUrl);
  await expect(page.locator('h1')).toHaveText('加法器');
}

async function fillNumbers(page, a, b) {
  await page.locator('#a').fill(a);
  await page.locator('#b').fill(b);
}

async function expectNoError(page) {
  await expect(page.locator('#result')).not.toHaveClass(/error/);
  await expect(page.locator('#a')).not.toHaveClass(/error/);
  await expect(page.locator('#b')).not.toHaveClass(/error/);
  await expect(page.locator('.error-icon')).not.toBeVisible();
}

async function expectError(page) {
  await expect(page.locator('#result')).toHaveText('×');
  await expect(page.locator('#result')).toHaveClass(/error/);
  await expect(page.locator('#a')).toHaveClass(/error/);
  await expect(page.locator('#b')).toHaveClass(/error/);
  await expect(page.locator('.error-icon')).toBeVisible();
}

test.describe('PROC-001 本地功能验收', () => {
  test.beforeEach(async ({ page }) => {
    await openAddPage(page);
  });

  test('TC-DELIVERY-001 页面可本地打开', async ({ page }) => {
    await expect(page).toHaveTitle('加法器');
    await expect(page.locator('.calculator')).toBeVisible();
  });

  test('TC-UI-STRUCT-001 两个输入框存在', async ({ page }) => {
    await expect(page.locator('#a')).toBeVisible();
    await expect(page.locator('#b')).toBeVisible();
    await expect(page.locator('#a')).toBeEditable();
    await expect(page.locator('#b')).toBeEditable();
  });

  test('TC-CALC-001 正整数实时相加', async ({ page }) => {
    await fillNumbers(page, '3', '5');
    await expect(page.locator('#result')).toHaveText('8');
    await expectNoError(page);
  });

  test('TC-CALC-002 负数相加', async ({ page }) => {
    await fillNumbers(page, '-3', '5');
    await expect(page.locator('#result')).toHaveText('2');
    await expectNoError(page);
  });

  test('TC-CALC-003 小数相加', async ({ page }) => {
    await fillNumbers(page, '1.5', '2.5');
    await expect(page.locator('#result')).toHaveText('4');
    await expectNoError(page);
  });

  test('TC-CALC-004 空输入按 0 处理', async ({ page }) => {
    await fillNumbers(page, '', '5');
    await expect(page.locator('#result')).toHaveText('5');
    await expectNoError(page);

    await fillNumbers(page, '3', '');
    await expect(page.locator('#result')).toHaveText('3');
    await expectNoError(page);

    await fillNumbers(page, '', '');
    await expect(page.locator('#result')).toHaveText('0');
    await expectNoError(page);
  });
});

test.describe('PROC-002 输入验证验收', () => {
  test.beforeEach(async ({ page }) => {
    await openAddPage(page);
  });

  test('TC-VALID-001 非数字字符显示错误', async ({ page }) => {
    await fillNumbers(page, 'a', '5');
    await expectError(page);
  });

  test('TC-VALID-002 重复负号显示错误', async ({ page }) => {
    await fillNumbers(page, '--5', '3');
    await expectError(page);
  });

  test('TC-VALID-003 多小数点显示错误', async ({ page }) => {
    await fillNumbers(page, '1..2', '3');
    await expectError(page);
  });

  test('TC-VALID-004 前缀解析风险显示错误', async ({ page }) => {
    await fillNumbers(page, '5.', '3');
    await expectError(page);
    await expect(page.locator('#result')).not.toHaveText('8');
  });

  test('TC-VALID-005 科学计数法不作为合法输入', async ({ page }) => {
    await fillNumbers(page, '1e5', '2');
    await expectError(page);
    await expect(page.locator('#result')).not.toHaveText('100002');
  });

  test('TC-STATE-001 错误状态可恢复', async ({ page }) => {
    await fillNumbers(page, 'a', '5');
    await expectError(page);

    await fillNumbers(page, '3', '5');
    await expect(page.locator('#result')).toHaveText('8');
    await expectNoError(page);
  });
});

test.describe('PROC-003 交互和可访问性验收', () => {
  test.beforeEach(async ({ page }) => {
    await openAddPage(page);
  });

  test('TC-UI-FOCUS-001 Focus 视觉反馈', async ({ page }) => {
    await page.keyboard.press('Tab');
    await expect(page.locator('#a')).toBeFocused();

    await expect.poll(async () => page.locator('#a').evaluate((el) => window.getComputedStyle(el).borderColor))
      .toBe('rgb(37, 99, 235)');

    const focusStyle = await page.locator('#a').evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        borderColor: styles.borderColor,
        boxShadow: styles.boxShadow,
        outlineStyle: styles.outlineStyle,
      };
    });

    expect(focusStyle.boxShadow === 'none' && focusStyle.outlineStyle === 'none').toBe(false);

    await page.keyboard.press('Tab');
    await expect(page.locator('#b')).toBeFocused();
  });

  test('TC-UI-RESP-001 移动端布局不溢出', async ({ page }) => {
    for (const viewport of [
      { width: 320, height: 640 },
      { width: 480, height: 800 },
    ]) {
      await page.setViewportSize(viewport);
      await fillNumbers(page, '3', '5');
      await expect(page.locator('#result')).toHaveText('8');

      const metrics = await page.evaluate(() => ({
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(metrics.scrollWidth, `${viewport.width}px 视口不应出现横向溢出`).toBeLessThanOrEqual(metrics.innerWidth);
    }
  });

  test('TC-UI-TRANSITION-001 结果变化具备过渡反馈', async ({ page }) => {
    await fillNumbers(page, '3', '5');
    await expect(page.locator('#result')).toHaveText('8');

    await fillNumbers(page, '7', '2');
    await expect(page.locator('#result')).toHaveText('9');

    const transition = await page.locator('#result').evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        property: styles.transitionProperty,
        duration: styles.transitionDuration,
      };
    });

    expect(transition.property).not.toBe('none');
    expect(transition.duration).toContain('0.15s');
  });

  test('TC-UI-SELECT-001 双击结果区选中文本', async ({ page }) => {
    await fillNumbers(page, '3', '5');
    await expect(page.locator('#result')).toHaveText('8');

    // 程序化选中验证：selectNodeContents 选中数字不含"元"
    const selection = await page.evaluate(() => {
      const result = document.getElementById('result');
      const range = document.createRange();
      range.selectNodeContents(result);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      return sel.toString();
    });
    expect(selection).toBe('8');
  });

  test('TC-A11Y-001 基础可访问性属性', async ({ page }) => {
    await expect(page.locator('label[for="a"]')).toHaveText('第一个金额（元）');
    await expect(page.locator('label[for="b"]')).toHaveText('第二个金额（元）');
    await expect(page.locator('#a')).toHaveAttribute('aria-label', '第一个金额（元）');
    await expect(page.locator('#b')).toHaveAttribute('aria-label', '第二个金额（元）');
    await expect(page.locator('#result')).toHaveAttribute('aria-live', 'polite');
    await expect(page.locator('#result')).toHaveAttribute('aria-atomic', 'true');
  });

  test('TC-UI-ALIGN-001 输入框数字右对齐', async ({ page }) => {
    await fillNumbers(page, '3', '5');

    const inputAAlignment = await page.locator('#a').evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.textAlign;
    });
    expect(inputAAlignment).toBe('right');

    const inputBAlignment = await page.locator('#b').evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.textAlign;
    });
    expect(inputBAlignment).toBe('right');
  });
});
