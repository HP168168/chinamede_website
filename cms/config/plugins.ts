export default ({ env }) => ({
  upload: {
    config: {
      // 官网图片与二维码：单文件上限 50MB，允许常见图片与文档格式
      sizeLimit: 50 * 1024 * 1024,
      // 注意：媒体库的「体积优化」开关不在这里，它存在插件配置存储中，
      // 由 src/index.ts 的 bootstrap 关闭（plugins.ts 写同名键不会生效）。
      breakpoints: {
        xlarge: 1920,
        large: 1200,
        medium: 800,
        small: 480,
      },
    },
  },
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET'),
    },
  },
});
