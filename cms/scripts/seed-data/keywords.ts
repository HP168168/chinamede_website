// 关键词库种子：五类示范词。
//
// 目的不是「替 AI 把词都写好」，而是让后台一打开就有东西可看：
// 分类筛选、五类中文显示、任务里选类型再随机取词，都依赖库里有数据。
// 真正的批量扩充交给后台的「AI 批量扩词」按钮或 `npm run ai:keywords`——
// 已存在的词会被清洗环节自动跳过，所以在此基础上重复扩词是安全的。
//
// 区域词的城市刻意取自现有校区（广州、深圳、东莞、佛山、江门、中山），
// 不写本地没有覆盖的地区——那样生成出来的文章对读者没有意义。

export interface KeywordSeed {
  word: string;
  category: 'core' | 'brand' | 'scene' | 'region' | 'longtail';
  note?: string;
}

export const keywords: KeywordSeed[] = [
  // 核心词：业务主干，搜索意图直指主营业务
  { word: '职业技能培训', category: 'core', note: '全站主线，适合做总览类选题' },
  { word: '就业培训班', category: 'core', note: '转化意图强' },
  { word: '成人职业培训', category: 'core' },
  { word: '转行就业培训', category: 'core' },
  { word: '项目实训班', category: 'core', note: '强调实操，可搭配学员作品来讲' },

  // 品牌词：含品牌名或其常见叫法
  { word: '美迪时代教育', category: 'brand', note: '品牌全称' },
  { word: '美迪教育', category: 'brand', note: '常见简称' },
  { word: '广州美迪教育', category: 'brand' },

  // 场景词：人群、阶段与需求意图的组合
  { word: '零基础转行', category: 'scene' },
  { word: '在职提升', category: 'scene' },
  { word: '待业再就业', category: 'scene' },
  { word: '宝妈重返职场', category: 'scene' },
  { word: '应届生技能培训', category: 'scene' },

  // 区域词：带城市限定，城市必须是现有校区所在地
  { word: '广州就业培训', category: 'region' },
  { word: '深圳就业培训', category: 'region' },
  { word: '东莞就业培训', category: 'region' },
  { word: '佛山技能培训', category: 'region' },
  { word: '中山电商培训', category: 'region' },

  // 长尾词：六字以上的具体问法，竞争小、意图明确
  { word: '零基础可以学电商运营吗', category: 'longtail' },
  { word: '转行做新媒体运营需要多久', category: 'longtail' },
  { word: '电商运营培训班学费大概多少', category: 'longtail' },
  { word: '学完之后真的能推荐就业吗', category: 'longtail' },
  { word: '22天带薪实习是怎么安排的', category: 'longtail' },
];
