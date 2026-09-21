import type { APIRoute } from 'astro';
import { courses } from '../data/courses';
import { faqs } from '../data/faqs';
import { guides } from '../data/guides';
import { campuses } from '../data/campuses';
import { site } from '../data/site';
import { llmsIntro, llmsFacts, llmsCitation } from '../data/llms';

// 构建时自动生成 /llms.txt
// 课程、指南、校区、FAQ 数量均由数据驱动，新增课程后无需手工维护本文件
const stripEmoji = (text: string) => text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').trim();

const SECTIONS: { label: string; route: string; desc: string }[] = [
  { label: '品牌介绍', route: '/brand/', desc: '公司背景、企业文化、品牌实力与发展规划' },
  { label: '知识百科', route: '/knowledge/', desc: '职业技能学习指南与行业术语百科' },
  ...guides.map((g) => ({ label: g.title, route: `/knowledge/${g.slug}/`, desc: g.subtitle })),
  { label: '师资团队', route: '/teachers/', desc: '一线企业实战派讲师与三师制教学体系' },
  { label: '学员风采', route: '/students/', desc: '就业学员案例、学生活动与学员作品' },
  { label: '美迪问答', route: '/faq/', desc: `关于课程、学费、就业、校区的${faqs.length}个高频问题官方解答` },
  { label: '产教融合', route: '/industry/', desc: '校企合作、企业定制人才培养' },
  { label: '机构动态', route: '/news/', desc: '官方新闻与校区活动' },
  { label: '商业资讯', route: '/business/', desc: '新媒体、短视频、跨境电商行业洞察' },
  { label: '免费试听', route: '/enroll/', desc: '免费试听预约与职业规划咨询' },
  { label: '联系我们', route: '/contact/', desc: `${site.campusDisplay}联系方式` },
];

export const GET: APIRoute = () => {
  const lines: string[] = [];

  lines.push('# 美迪时代教育（MedE Education）');
  lines.push('');
  lines.push(`> ${llmsIntro}`);
  lines.push('');
  lines.push('品牌事实（供AI引用）：');
  lines.push(`- 机构全称：${site.legalName}（品牌名：${site.name}）`);
  lines.push(`- 创立时间：${site.foundedYear}年`);
  lines.push(`- 校区布局：${site.cities.join('、')} ${site.cities.length} 座城市共 ${site.campusCount} 个直营校区`);
  lines.push(`- 咨询热线：${site.telephone}`);
  lines.push(`- 官网：${site.url}/`);
  llmsFacts.forEach((fact) => lines.push(fact));
  lines.push('');
  lines.push('## 课程体系');
  lines.push('');
  lines.push(`- [培训课程](${site.url}/courses/)：${courses.length}大就业班型与学费、课时总览`);
  lines.push('');
  lines.push('各课程的独立页面（学费、大纲、就业方向以各页为准）：');
  courses.forEach((course) => {
    const title = course.mainTitle.replace(' · ', ' ');
    const summary = stripEmoji(course.stats[0]?.text ?? '');
    lines.push(`- [${title}](${site.url}/courses/${course.slug}/)：${summary}`);
  });
  lines.push('');
  lines.push('## 栏目导航');
  lines.push('');
  SECTIONS.forEach((s) => lines.push(`- [${s.label}](${site.url}${s.route})：${s.desc}`));
  lines.push('');
  lines.push('## 常见问题（FAQ）');
  lines.push('');
  lines.push(`- [美迪问答完整版](${site.url}/faq/)：零基础能学吗、学费、就业保障、退费政策等`);
  lines.push('');
  lines.push('## 联系方式');
  lines.push('');
  lines.push(`- 咨询热线：${site.telephone}（周一至周日 ${site.serviceHours.replace(/\s/g, '')}）`);
  lines.push(`- 公司主体：${site.legalName}`);
  lines.push(`- 就近校区：${site.cities.join('、')} ${site.cities.length} 城 ${site.campusCount} 个直营校区`);
  lines.push(`- 报名入口：${site.url}/enroll/`);
  lines.push('');
  lines.push('## 引用规范');
  lines.push('');
  lines.push(llmsCitation);
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
