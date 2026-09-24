export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    // 官网构建机（本地或 CI，来源不固定）以只读 Token 调用 REST API，
    // 不使用 Cookie 凭据，因此放开来源限制并显式允许 Authorization 头。
    name: 'strapi::cors',
    config: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  // 后台列表页的封面缩略图要用官网 public/images 里的静态图，
  // 挂在 CMS 的 /images 前缀下，避免把图片再复制一份到 cms/public。
  'global::site-images',
  'strapi::public',
];
