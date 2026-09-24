import { loadDotEnv } from '../env';
import { StrapiClient } from '../strapi-client';
import { loadAiConfig } from './config';
import { expandKeywordsViaRest } from './keyword-expand';
import { KEYWORD_CATEGORIES } from './keywords';
import { checkEnvironment, previewTask, runTasks } from './run-tasks';
import type { KeywordCategory } from './types';

/**
 * AI 内容工厂命令行入口。
 *
 *   npm run ai:run                    # 批量处理待处理任务（受 AI_DAILY_LIMIT / AI_RUN_WINDOW 约束）
 *   npm run ai:run -- --limit 1       # 本轮最多 1 篇
 *   npm run ai:run -- --dry-run       # 演练：调用模型与校验，但不写库
 *   npm run ai:run:once -- --task <id># 手动执行单篇（id 为任务的 documentId）
 *   npm run ai:preview -- --topic "选题"   # 只打印提示词，不调用模型
 *   npm run ai:keywords -- --seed "口腔修复"  # 围绕一个核心词批量扩出五类关键词
 *   npm run ai:check                  # 环境自检（Strapi / Token / 模型 / 知识库）
 *
 * 供 Windows 任务计划、crontab、CI schedule 直接调用，人在后台建任务、机器按点执行。
 */

interface Flags {
  [key: string]: string | boolean | undefined;
}

function parseFlags(argv: string[]): Flags {
  const flags: Flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;

    const body = arg.slice(2);
    const eq = body.indexOf('=');

    if (eq !== -1) {
      flags[body.slice(0, eq)] = body.slice(eq + 1);
      continue;
    }

    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      flags[body] = next;
      i += 1;
    } else {
      flags[body] = true;
    }
  }
  return flags;
}

function usage(): void {
  console.log(
    [
      'AI 内容工厂',
      '',
      '用法：',
      '  npm run ai:run                       批量处理待处理任务',
      '    --limit <n>        本轮最多生成篇数（默认 AI_DAILY_LIMIT）',
      '    --dry-run          演练：调用模型与校验，但不写入后台',
      '    --force            忽略 AI_RUN_WINDOW 运行窗口限制',
      '  npm run ai:run:once -- --task <id>   手动执行单篇任务（documentId）',
      '  npm run ai:preview -- --task <id>    打印将要发给模型的提示词（不调用模型）',
      '    --topic "选题"     未创建任务时直接预览某个选题',
      '    --keywords "关键词1,关键词2"',
      '    --limit <n>        取用的知识条目条数（默认 6）',
      '  npm run ai:check                     环境自检',
      '  npm run ai:keywords -- --seed <核心词>  批量扩展五类关键词',
      '    --seed <词>       核心关键词（必填），如 --seed "口腔修复"',
      '    --category <a,b>  只扩这几类（core/brand/scene/region/longtail）',
      '    --dry-run         只打印模型产出，不入库',
      '    注：写入需要后台运行中，并配置 STRAPI_WRITE_TOKEN',
    ].join('\n'),
  );
}

function asNumber(value: string | boolean | undefined): number | undefined {
  if (typeof value !== 'string') return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function asText(value: string | boolean | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function formatCheck(lines: { name: string; ok: boolean; detail: string }[]): string {
  const width = Math.max(...lines.map((line) => line.name.length), 4);
  return lines
    .map((line) => `  ${line.ok ? '[OK]  ' : '[!!]  '}${line.name.padEnd(width + 2, ' ')}${line.detail}`)
    .join('\n');
}

async function main(): Promise<void> {
  const [command = 'help', ...rest] = process.argv.slice(2);
  const flags = parseFlags(rest);

  switch (command) {
    case 'run': {
      const summary = await runTasks({
        limit: asNumber(flags.limit),
        dryRun: flags['dry-run'] === true,
        force: flags.force === true,
      });
      if (summary.failed > 0) process.exitCode = 1;
      return;
    }

    case 'once': {
      const taskId = asText(flags.task);
      if (!taskId) {
        console.error('缺少 --task <documentId>。可用 npm run ai:preview 查看待处理任务。');
        process.exitCode = 1;
        return;
      }
      const summary = await runTasks({
        taskId,
        limit: 1,
        dryRun: flags['dry-run'] === true,
        force: true,
      });
      if (summary.failed > 0) process.exitCode = 1;
      return;
    }

    case 'preview': {
      await previewTask({
        taskId: asText(flags.task),
        topic: asText(flags.topic),
        keywords: asText(flags.keywords),
        wordCount: asNumber(flags['word-count']),
        limit: asNumber(flags.limit),
      });
      return;
    }

    case 'keywords': {
      const seed = asText(flags.seed);
      if (!seed) {
        console.error('缺少 --seed <核心关键词>。用法：npm run ai:keywords -- --seed "口腔修复"');
        process.exitCode = 1;
        return;
      }

      const raw = asText(flags.category);
      const categories = raw
        ? (raw.split(/[,，\s]+/).filter(Boolean) as KeywordCategory[])
        : undefined;

      // 脚本是独立进程，拿不到 strapi 实例，连回自己的 REST API（写回需要 STRAPI_WRITE_TOKEN）
      const config = loadAiConfig();
      const client = new StrapiClient({
        baseUrl: config.strapiUrl,
        token: config.writeToken || config.readToken,
        timeoutMs: config.timeoutMs,
      });

      const result = await expandKeywordsViaRest({
        client,
        seedWord: seed,
        categories,
        dryRun: flags['dry-run'] === true,
        logger: (message: string) => console.log(message),
      });

      KEYWORD_CATEGORIES.filter((item) => (result.byCategory[item.key] ?? 0) > 0).forEach((item) => {
        const words = result.created.filter((entry) => entry.category === item.key).map((entry) => entry.word);
        console.log(`  ${item.label}（${words.length}）：${words.join('、')}`);
      });

      console.log(
        result.dryRun
          ? `演练完成：共 ${result.created.length} 个词（未入库），跳过 ${result.skipped} 个`
          : `已入库 ${result.created.length} 个词，跳过 ${result.skipped} 个`,
      );
      return;
    }

    case 'check': {
      const items = await checkEnvironment();
      console.log('内容工厂环境自检：');
      console.log(formatCheck(items));
      if (items.some((item) => !item.ok)) process.exitCode = 1;
      return;
    }

    default:
      usage();
  }
}

loadDotEnv();

main().catch((error: unknown) => {
  console.error('');
  console.error((error as Error).message);
  process.exitCode = 1;
});
