#!/usr/bin/env node
/**
 * AI PR 审查脚本
 * ──────────────────────────────────────────────────────────
 * 读取 /tmp/pr.diff，调用通义千问 API 生成结构化审查报告
 * 支持大 PR 自动分块处理（防止 token 超限）
 * 输出通过 GITHUB_OUTPUT 传递给后续步骤
 * ──────────────────────────────────────────────────────────
 */

const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
const DASHSCOPE_BASE_URL = process.env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const PR_TITLE = process.env.PR_TITLE || 'Untitled PR';
const PR_NUMBER = process.env.PR_NUMBER || '0';
const PR_AUTHOR = process.env.PR_AUTHOR || 'unknown';
const MAX_DIFF_LINES = 400; // 单块最大行数，超出则分块

// ── 读取 diff ──────────────────────────────────────────────
function readDiff() {
  const diffPath = '/tmp/pr.diff';
  if (!fs.existsSync(diffPath)) {
    return '';
  }
  return fs.readFileSync(diffPath, 'utf8');
}

// ── 分块处理大 PR ─────────────────────────────────────────
function splitDiffIntoChunks(diff) {
  const lines = diff.split('\n');
  const chunks = [];
  let current = [];

  for (const line of lines) {
    current.push(line);
    if (current.length >= MAX_DIFF_LINES && line.startsWith('diff --git')) {
      chunks.push(current.join('\n'));
      current = [];
    }
  }
  if (current.length > 0) {
    chunks.push(current.join('\n'));
  }
  return chunks.length > 0 ? chunks : [''];
}

// ── 构建审查 Prompt ───────────────────────────────────────
function buildPrompt(diff, chunkIndex, totalChunks) {
  const chunkInfo = totalChunks > 1
    ? `（第 ${chunkIndex + 1}/${totalChunks} 块）`
    : '';

  return `你是一位资深代码审查专家，请对以下 PR 代码变更${chunkInfo}进行专业审查。

**PR 信息：**
- 标题：${PR_TITLE}
- 编号：#${PR_NUMBER}
- 作者：${PR_AUTHOR}

**审查要求（按优先级）：**
1. 🐛 **Bug 风险**：空指针解引用、资源泄露、边界条件、并发问题
2. 🔒 **安全漏洞**：SQL 注入、硬编码密钥、XSS、权限校验缺失
3. ⚡ **性能问题**：N+1 查询、冗余循环、不必要的同步操作
4. 🏗️ **可维护性**：命名规范、魔法数字、代码重复、函数过长
5. ✅ **测试覆盖**：关键路径是否有测试、边界情况是否覆盖

**输出格式（Markdown）：**

## 🤖 AI 代码审查报告 ${chunkInfo}

### 总体评分
| 维度 | 评分 | 说明 |
|------|------|------|
| 代码质量 | X/10 | ... |
| 安全性 | X/10 | ... |
| 可维护性 | X/10 | ... |

### 发现的问题
（如无问题请写"✅ 未发现明显问题"）

### 改进建议
（具体、可操作的建议，附代码示例）

### 总结
（一句话总结是否建议合并）

---
**代码变更：**
\`\`\`diff
${diff}
\`\`\``;
}

// ── 调用 OpenAI API ───────────────────────────────────────
async function callOpenAI(prompt) {
  return new Promise((resolve, reject) => {
    const baseUrl = DASHSCOPE_BASE_URL.replace(/\/$/, '');
    const url = new URL(`${baseUrl}/chat/completions`);

    const body = JSON.stringify({
      model: 'qwen3.5-35b-a3b',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.2,
    });

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.message?.content;
          resolve(content || '⚠️ API 返回内容为空');
        } catch {
          reject(new Error(`API 响应解析失败: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── 写入 GitHub Output ────────────────────────────────────
function setOutput(name, value) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    const delimiter = `EOF_${Date.now()}`;
    fs.appendFileSync(outputFile, `${name}<<${delimiter}\n${value}\n${delimiter}\n`);
  } else {
    console.log(`[OUTPUT] ${name}:\n${value}`);
  }
}

// ── 主流程 ────────────────────────────────────────────────
async function main() {
  if (!DASHSCOPE_API_KEY) {
    const msg = '⚠️ **AI 审查跳过**：未配置 `DASHSCOPE_API_KEY` Secret，请在仓库 Settings > Secrets 中添加。';
    setOutput('review_result', msg);
    console.log(msg);
    return;
  }

  const diff = readDiff();
  if (!diff.trim()) {
    const msg = 'ℹ️ **AI 审查**：未检测到 TypeScript/JavaScript 文件变更，跳过审查。';
    setOutput('review_result', msg);
    return;
  }

  const chunks = splitDiffIntoChunks(diff);
  console.log(`共 ${chunks.length} 个 diff 块，开始逐块审查...`);

  const results = [];
  for (let i = 0; i < chunks.length; i++) {
    console.log(`正在审查第 ${i + 1}/${chunks.length} 块...`);
    const prompt = buildPrompt(chunks[i], i, chunks.length);
    const result = await callOpenAI(prompt);
    results.push(result);
  }

  const finalReport = results.join('\n\n---\n\n');
  setOutput('review_result', finalReport);
  console.log('✅ AI 审查完成');
}

main().catch((err) => {
  console.error('AI 审查脚本执行失败:', err);
  setOutput('review_result', `❌ **AI 审查执行失败**：${err.message}`);
  process.exit(0); // 不阻断 CI 流程
});