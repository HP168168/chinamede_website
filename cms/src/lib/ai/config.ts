import { envInt, envString } from '../env';
import type { AiConfig } from './types';

/** 从环境变量（含 .env）装配内容工厂配置 */
export function loadAiConfig(): AiConfig {
  return {
    provider: envString('AI_PROVIDER', 'openai-compatible'),
    baseUrl: envString('AI_BASE_URL', 'https://api.deepseek.com/v1'),
    model: envString('AI_MODEL', 'deepseek-chat'),
    apiKey: envString('AI_API_KEY', ''),
    dailyLimit: envInt('AI_DAILY_LIMIT', 3),
    maxRetries: envInt('AI_MAX_RETRIES', 2),
    timeoutMs: envInt('AI_TIMEOUT_MS', 120000),
    strapiUrl: envString('STRAPI_URL', 'http://localhost:1337').replace(/\/+$/, ''),
    readToken: envString('STRAPI_READONLY_TOKEN', ''),
    writeToken: envString('STRAPI_WRITE_TOKEN', ''),
    siteUrl: envString('PUBLIC_SITE_URL', 'https://www.chinamede.com').replace(/\/+$/, ''),
  };
}

/** 生成内容前必须配置模型密钥；未配置时给出可操作的提示而不是直接崩溃 */
export function assertAiReady(config: AiConfig): void {
  if (config.apiKey) return;
  throw new Error(
    [
      '未配置 AI_API_KEY，无法调用模型生成内容。',
      '',
      '请编辑 cms/.env 填入密钥后重试：',
      `  AI_BASE_URL=${config.baseUrl}`,
      `  AI_MODEL=${config.model}`,
      '  AI_API_KEY=<你的密钥>',
      '',
      '如果想先确认提示词与素材是否正确，可运行：npm run ai:preview（不需要密钥）',
    ].join('\n'),
  );
}

/** 写入 Strapi 需要具备写权限的 API Token */
export function assertStrapiWriteReady(config: AiConfig): void {
  if (config.writeToken) return;
  throw new Error(
    [
      '未配置 STRAPI_WRITE_TOKEN，无法写回草稿与任务状态。',
      '',
      '请在后台「设置 → API 令牌 → 新建令牌」创建一个 Full access 令牌，',
      '把令牌填入 cms/.env 的 STRAPI_WRITE_TOKEN。',
    ].join('\n'),
  );
}
