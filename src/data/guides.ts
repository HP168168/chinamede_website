// 知识百科指南 - 由旧站 knowledge/guide-*/index.html 抽取生成
// 正文以 HTML 片段形式存放在 src/content/knowledge/<slug>.html，页面按 slug 读取渲染
export interface Guide {
  slug: string;
  title: string;
  subtitle: string;
  seo: { title: string; description: string; keywords: string };
}

export const guides: Guide[] = [
  {
    "slug": "guide-geo",
    "title": "什么是GEO？",
    "subtitle": "AI搜索时代企业与个人必须掌握的获客新打法",
    "seo": {
      "title": "什么是GEO？AI搜索时代企业与个人必须掌握的获客新打法",
      "description": "GEO（生成式引擎优化）详解：GEO和SEO的区别、AI大模型如何决定推荐谁、企业如何布局GEO让DeepSeek/豆包/ChatGPT推荐自己的品牌、GEO相关新岗位与薪资机会。",
      "keywords": "GEO是什么,生成式引擎优化,GEO和SEO区别,AI搜索优化,AI获客,企业GEO布局,GEO岗位"
    }
  },
  {
    "slug": "guide-newmedia",
    "title": "零基础转行新媒体运营全攻略",
    "subtitle": "从月薪3千到月薪过万的完整路径",
    "seo": {
      "title": "零基础转行新媒体运营全攻略：从月薪3千到月薪过万的完整路径",
      "description": "零基础转行新媒体运营完整攻略：岗位认知、必备技能清单、作品集怎么准备、简历面试技巧、入职前90天规划，以及自学vs报班的成本对比，美迪时代教育教研团队实操整理。",
      "keywords": "新媒体运营转行攻略,零基础转行,新媒体运营学什么,新媒体运营薪资,作品集准备,转行互联网行业"
    }
  },
  {
    "slug": "guide-shortvideo",
    "title": "2026短视频与短剧行业就业前景分析",
    "subtitle": "普通人还有机会吗？",
    "seo": {
      "title": "2026短视频与短剧行业就业前景分析：普通人还有机会吗？",
      "description": "2026短视频短剧行业就业前景：市场规模、岗位缺口、剪辑/运营/投流/编剧各岗位薪资水平、入行门槛与学习路径，普通人转行短视频行业的可行性分析。",
      "keywords": "短视频行业前景,短剧行业分析,短视频剪辑薪资,短剧岗位,视频剪辑培训,转行短视频"
    }
  }
];
