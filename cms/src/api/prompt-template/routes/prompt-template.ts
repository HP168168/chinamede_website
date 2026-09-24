import { factories } from '@strapi/strapi';

// 与关键词同理：只建 content-type 不会有 API，必须有这一层。
export default factories.createCoreRouter('api::prompt-template.prompt-template');
