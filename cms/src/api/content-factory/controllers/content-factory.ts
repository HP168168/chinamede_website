import { expandKeywords } from '../../../lib/ai/keyword-expand';
import { runTasks } from '../../../lib/ai/run-tasks';
import { loadStateSummary } from '../../../lib/schedule/status';

/**
 * 内容工厂操作入口。
 *
 * runTask 对应后台的「立即生成」按钮：点一下就按任务配置出一稿。
 * 模型调用可能持续几十秒到两分钟，因此这里不等结果——
 * 立即返回 202，执行过程与结果写回任务自身的 runStatus / log / result 字段，
 * 后台刷新任务详情即可看到。
 */

const TASKS = 'api::generation-task.generation-task';

export default {
  async runTask(ctx: any) {
    const { documentId } = ctx.params ?? {};

    if (!documentId) {
      return ctx.badRequest('缺少任务 documentId');
    }

    const task = await strapi.documents(TASKS).findOne({ documentId });
    if (!task) {
      return ctx.notFound(`未找到任务 ${documentId}`);
    }

    if (task.mode === 'manual') {
      return ctx.badRequest('该任务是「人工撰写」模式，只生成字段骨架，不需要调用模型');
    }

    // 已完成/失败的任务也允许再生成一次：先置回 pending，执行器只认 pending。
    // 注意字段名不能叫 status：Strapi content-manager 会把请求体里的 status 当作
    // 文档的草稿/发布状态来校验（只接受 draft/published，否则报 Invalid status），
    // 业务字段撞名后后台根本提交不进来，所以 schema 里叫 runStatus（见 schema.json）。
    await strapi.documents(TASKS).update({
      documentId,
      data: { runStatus: 'pending' } as any,
    });

    const logger = (message: string) => strapi.log.info(`[content-factory] ${message}`);

    void runTasks({ taskId: documentId, limit: 1, force: true, logger }).catch((error: unknown) => {
      strapi.log.error(`[content-factory] 手动生成失败：${(error as Error).message}`);
    });

    ctx.status = 202;
    ctx.body = {
      started: true,
      documentId,
      title: task.title,
      message: '已开始生成，结果会写回本任务的「执行日志」与「生成的最后一篇文章」',
    };
  },

  async status(ctx: any) {
    ctx.body = await loadStateSummary(strapi);
  },

  /**
   * 关键词库：围绕一个核心种子词批量扩展五类关键词。
   *
   * 与 runTask 不同，这里是同步等待模型返回——运营要当场看到产出了哪些词，
   * 异步去做就只能刷新列表碰运气，反而难用。失败信息原文回传给弹窗显示。
   */
  async expandKeywords(ctx: any) {
    const body = (ctx.request?.body ?? {}) as {
      seedWord?: string;
      categories?: string[];
      perCategory?: Record<string, number>;
      dryRun?: boolean;
    };

    try {
      const result = await expandKeywords({
        strapi,
        seedWord: String(body.seedWord ?? ''),
        categories: body.categories as never,
        perCategory: body.perCategory as never,
        dryRun: Boolean(body.dryRun),
        logger: (message: string) => strapi.log.info(`[content-factory] ${message}`),
      });

      ctx.body = result;
    } catch (error) {
      return ctx.badRequest((error as Error).message);
    }
  },
};
