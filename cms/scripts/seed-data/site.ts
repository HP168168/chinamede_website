// 全站共用机构信息 - Header / Footer / SEO / Schema 的单一数据源
// 数据来源：旧站 partials/header.html、partials/footer.html、partials/schema.html

export interface SiteConfig {
  name: string;
  legalName: string;
  slogan: string;
  url: string;
  telephone: string;
  telephoneHref: string;
  serviceHours: string;
  foundedYear: string;
  cities: string[];
  campusCount: number;
  campusDisplay: string;
  address: string;
  icp: string;
  icpUrl: string;
  logo: string;
  logoAlt: string;
  ogImage: string;
  ogImageWidth: number;
  ogImageHeight: number;
  description: string;
  generator: string;
  author: string;
  copyright: string;
  knowsAbout: string[];
}

export const site: SiteConfig = {
  name: '美迪时代教育',
  legalName: '广州美迪教育科技有限公司',
  slogan: '让职业就业更简单',
  url: 'https://www.chinamede.com',
  telephone: '400-800-4459',
  telephoneHref: 'tel:4008004459',
  serviceHours: '8:00 - 23:00',
  foundedYear: '2011',
  cities: ['广州', '深圳', '佛山', '东莞', '中山', '江门'],
  campusCount: 13,
  campusDisplay: '6城13个直营校区',
  address: '广州市越秀区三元里大道217号民生商业大厦3—4楼',
  icp: '粤ICP备15034320号-7',
  icpUrl: 'https://beian.miit.gov.cn/',
  logo: '/images/logo_3.png',
  logoAlt: '美迪时代教育',
  ogImage: '/images/og-cover.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  description:
    '美迪时代教育隶属于广州美迪教育科技有限公司，2011 年创立，专注成人职业技能就业培训，在广州、深圳、佛山、东莞、中山、江门 6 大城市设有 13 个直营校区，提供 AI 新媒体运营、AI 视觉设计、商业短视频、AIGC、AI 短剧漫剧、跨境电商等就业方向培训，长期班标配 22 天带薪实习与五年就业推荐。',
  generator: 'MedE Education Website',
  author: '美迪时代教育',
  copyright: '© 2026 美迪时代教育 版权所有',
  knowsAbout: [
    'AI新媒体运营',
    'AI视觉设计',
    '商业短视频创作',
    'AIGC应用',
    'AI短剧漫剧创作',
    '亚马逊跨境电商运营',
    'TikTok营销',
    '海外社媒运营',
    '生成式引擎优化（GEO）',
    '成人职业技能就业培训',
  ],
};

// 把站内相对路径拼成绝对 URL（用于 canonical / OG / JSON-LD）
// 目录型路径补尾斜杠（/courses/n1-ai-newmedia -> /courses/n1-ai-newmedia/），
// 带扩展名的文件路径保持原样（/images/og-cover.png 不能变成 .png/）
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const p = path.startsWith('/') ? path : '/' + path;
  if (p === '/') return site.url + '/';
  if (/\.[a-zA-Z0-9]{2,5}$/.test(p)) return site.url + p;
  return site.url + p.replace(/\/?$/, '/');
}
