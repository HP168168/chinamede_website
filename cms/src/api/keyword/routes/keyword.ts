import { factories } from '@strapi/strapi';

/**
 * 关键词的标准 REST 路由。
 *
 * 只建 content-type 不会自动生成 API——少了这一层，/api/keywords 会直接 404，
 * 生成任务取词（走 REST + 写令牌）与后台的读写都会拿不到数据。
 *
 * 这里刻意不加任何 policy 配置：权限默认关闭，公开可读的集合统一在
 * src/index.ts 的 PUBLIC_READ_ACTIONS 里登记。关键词属于后台内部数据，不登记。
 */
export default factories.createCoreRouter('api::keyword.keyword');
