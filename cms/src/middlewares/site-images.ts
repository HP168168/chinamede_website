import { resolve } from 'node:path';

import serve from 'koa-static';

/**
 * 把官网（仓库根 public/）的静态图片挂到 CMS 的 /images 下。
 *
 * 背景：课程封面存的是官网站内路径（如 /images/courses/hwsmyyzyjyb.webp），
 * 这些文件在官网仓库的 public/images 里，而 CMS 自己的 public/ 是空的，
 * 所以后台访问 http://localhost:1337/images/... 会 404，列表页也就只能显示一串路径文本。
 *
 * 这里只代理 /images/ 前缀，指向官网 public 目录，不复制文件（保持单一来源）。
 * 这些图片本身就是官网对外公开的静态资源，不涉及额外暴露。
 */
export default (_config, { strapi }) => {
  const root = resolve(strapi.dirs.app.root, '..', 'public');
  const handler = serve(root, {
    index: false,
    // 图片更新后后台尽快看到新版本
    maxage: 0,
  });

  return async (ctx, next) => {
    if (!ctx.path.startsWith('/images/')) {
      return next();
    }

    return handler(ctx, next);
  };
};
