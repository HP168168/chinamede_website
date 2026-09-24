/**
 * 让后台编辑页更简明：同步中文说明、系统字段只读、纯状态字段隐藏。
 *
 * 为什么需要它：
 * Strapi 编辑页字段下方的说明文字（hint）取的是 content-manager 配置里的
 * metadatas[field].edit.description，**不会**回落到 schema.json 的
 * attribute.description——所以 schema 里写的中文说明在后台根本看不到，
 * 那些需要解释的字段就只剩一个名字，看不出各自的作用和区别。
 *
 * 这里在启动时对每个登记的内容类型做三件事（幂等，重复启动无副作用）：
 *   1. 把 schema 的 description 同步进配置 → 页面上能看到中文说明；
 *   2. 系统回写的字段设为只读；
 *   3. 纯系统字段在编辑页隐藏（列表页仍显示）。
 *
 * 注意：这几项由代码统一维护，在「内容类型构建器」里手工调整会被下次启动覆盖
 * （要改请改这里，或改 schema.json 里对应字段的 description）。
 */

interface EditViewRule {
  uid: string;
  /** 日志里显示的中文名 */
  label: string;
  /** 编辑页隐藏：列表页仍可查看 */
  hidden?: string[];
  /** 编辑页只读：由系统回写，人工改没有意义 */
  readonly?: string[];
}

const EDIT_VIEW_RULES: EditViewRule[] = [
  {
    uid: 'api::generation-task.generation-task',
    label: '任务计划',
    hidden: [
      // 「执行状态」是调度器的判据，人工改容易让任务卡住；
      // 「时区」由系统按运行环境默认时区自动写入，不需要手填；
      // 「计划执行日 / 下次执行时间 / 上次执行时间」属于排期与运行记录，
      // 人工看或改都没有意义——后两者由调度器回写，既然不显示也就无需再设只读
      'runStatus',
      'timezone',
      'nextRunAt',
      'lastRunAt',
      'plannedDate',
    ],
    readonly: ['retries', 'log'],
  },
  {
    uid: 'api::keyword.keyword',
    label: '关键词库',
    // 使用次数与最近使用时间由生成器在成稿后回写。这里选择「隐藏」而不是「只读」：
    // 只读仍会占编辑页一屏，运营容易误以为是待填项，而它们只是热度统计
    hidden: ['usageCount', 'lastUsedAt'],
  },
  // 提示词没有系统回写字段，只需要下面的 description 同步
  {
    uid: 'api::prompt-template.prompt-template',
    label: '提示词',
  },
  {
    uid: 'api::article.article',
    label: '文章',
    // 本次使用的关键词与提示词由生成器回写，用于追溯「这稿怎么来的」，
    // 设为只读既能看到又不会被误改（改了就与实际生成过程不一致了）
    readonly: ['keyword', 'promptTemplate'],
  },
];

/**
 * 按规则同步各内容类型的编辑页配置。
 *
 * 任一内容类型不存在（比如尚未上线）就跳过，不影响其它类型也不阻断启动。
 */
export async function configureContentEditViews(strapi: any): Promise<void> {
  const service = strapi.plugin?.('content-manager')?.service?.('content-types');
  if (!service?.findConfiguration || !service?.updateConfiguration) return;

  for (const rule of EDIT_VIEW_RULES) {
    const contentType = strapi.contentTypes?.[rule.uid];
    if (!contentType) continue;

    try {
      const configuration = await service.findConfiguration(contentType);
      if (!configuration?.metadatas) continue;

      let changed = 0;

      for (const [name, attribute] of Object.entries<any>(contentType.attributes ?? {})) {
        const edit = configuration.metadatas[name]?.edit;
        if (!edit) continue;

        const description = typeof attribute?.description === 'string' ? attribute.description : '';
        if (description && edit.description !== description) {
          edit.description = description;
          changed += 1;
        }
        if (rule.hidden?.includes(name) && edit.visible !== false) {
          edit.visible = false;
          changed += 1;
        }
        if (rule.readonly?.includes(name) && edit.editable !== false) {
          edit.editable = false;
          changed += 1;
        }
      }

      if (changed === 0) continue;

      // 只回传这三个顶层键：store 的写入对顶层键是整体覆盖，多带字段会污染配置
      await service.updateConfiguration(contentType, {
        settings: configuration.settings,
        metadatas: configuration.metadatas,
        layouts: configuration.layouts,
      });

      strapi.log.info(`[edit-view] ${rule.label}编辑页已优化（${changed} 处：中文说明 / 只读 / 隐藏）`);
    } catch (error) {
      strapi.log.warn(`[edit-view] ${rule.label}编辑页优化跳过：${(error as Error).message}`);
    }
  }
}
