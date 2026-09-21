// 课程数据 - 由旧站 HTML 抽取生成，后续维护请直接修改本文件
// 生成来源：courses/<slug>/index.html（旧静态站）

export interface CourseModule {
  name: string;
  hour: string;
  highlight: boolean;
}

export interface CourseStage {
  badge: string;
  title: string;
  subtitle: string;
  modules: CourseModule[];
}

export interface CourseFaq {
  id: string;
  question: string;
  answer: string;
}

export interface Course {
  slug: string;
  order: number;
  code: string;
  category: string;
  title: string;
  subtitle: string;
  mainTitle: string;
  cover: { src: string; alt: string; width: number; height: number };
  badge: string;
  metaTags: { text: string; cls: string }[];
  price: { amount: string; currency: string; origin: string; save: string };
  stats: { text: string; highlight: boolean }[];
  descHighlight: string;
  curriculum: CourseStage[];
  practice: { title: string; text: string };
  outcomes: { jobs: string[]; targets: string[] };
  tags: string[];
  faq: CourseFaq[];
  seo: { title: string; description: string; keywords: string };
}

export const courses: Course[] = [
  {
    "slug": "n1-ai-newmedia",
    "order": 1,
    "code": "N1",
    "category": "ai",
    "title": "AI新媒体运营师就业班",
    "subtitle": "50天 + 22天带薪实习 · AI长期班 · 明码标价无隐形消费",
    "mainTitle": "N1 · AI新媒体运营师就业班",
    "cover": {
      "src": "/images/courses/xmtyysjyb.webp",
      "alt": "N1 · AI新媒体运营师就业班",
      "width": 805,
      "height": 604
    },
    "badge": "🔥 热门就业班",
    "metaTags": [
      {
        "text": "AI长期班",
        "cls": "tag-blue"
      },
      {
        "text": "22天带薪实习",
        "cls": "tag-gold"
      },
      {
        "text": "推荐+AI双流量获客",
        "cls": "tag-purple"
      }
    ],
    "price": {
      "amount": "13,800",
      "currency": "¥",
      "origin": "原价单科分报合计 ¥17,250",
      "save": "联报 8 折，立省 ¥3,450"
    },
    "stats": [
      {
        "text": "📅 50天线下集训 + 22天带薪岗位实习",
        "highlight": false
      },
      {
        "text": "⏱️ 288课时（训练强度为线上训练营2-3倍）",
        "highlight": false
      },
      {
        "text": "💼 22天带薪实习闭环独有",
        "highlight": true
      }
    ],
    "descHighlight": "聚焦AI时代企业获客刚需，将<strong>「推荐流量与AI流量获客实战」</strong>做成正式课程模块，50天线下集训 + 22天带薪岗位实习 · 288课时，训练强度为线上训练营类竞品2-3倍，22天带薪实习闭环独有。",
    "curriculum": [
      {
        "badge": "01",
        "title": "第一阶段 · 运营基础",
        "subtitle": "6门核心专业课 · 夯实全域基本功",
        "modules": [
          {
            "name": "AI工具应用",
            "hour": "18课时",
            "highlight": false
          },
          {
            "name": "手机拍摄剪辑",
            "hour": "24课时",
            "highlight": false
          },
          {
            "name": "短视频拍摄剪辑高级",
            "hour": "42课时",
            "highlight": false
          },
          {
            "name": "抖音运营",
            "hour": "24课时",
            "highlight": false
          },
          {
            "name": "小红书运营",
            "hour": "24课时",
            "highlight": false
          },
          {
            "name": "视频号运营",
            "hour": "30课时",
            "highlight": false
          }
        ]
      },
      {
        "badge": "02",
        "title": "第二阶段 · 运营获客",
        "subtitle": "3门进阶获客课 · 掌握双流量引擎",
        "modules": [
          {
            "name": "AI数字人获客",
            "hour": "18课时",
            "highlight": false
          },
          {
            "name": "抖音获客引流",
            "hour": "24课时",
            "highlight": false
          },
          {
            "name": "企业AI获客GEO实战",
            "hour": "24课时",
            "highlight": false
          }
        ]
      },
      {
        "badge": "03",
        "title": "第三阶段 · 岗前实战",
        "subtitle": "商业项目操盘 · 带薪岗位实习",
        "modules": [
          {
            "name": "岗前实战",
            "hour": "60课时",
            "highlight": false
          },
          {
            "name": "就业指导",
            "hour": "12课时",
            "highlight": false
          },
          {
            "name": "22天岗位实习",
            "hour": "带薪实习闭环",
            "highlight": true
          }
        ]
      }
    ],
    "practice": {
      "title": "重实战 · 非纯理论",
      "text": "真实商业项目全流程实操 + 企业导师带教；岗前实战包含产品实景拍摄、室外外拍、AI复刻爆款视频、AI口播视频、AI企业宣传片及岗位考核，学习内容对标真实工作场景。"
    },
    "outcomes": {
      "jobs": [
        "AIGC生成师",
        "AIGC内容创作师",
        "AIGC视频生成师",
        "AIGC设计师",
        "AI新媒体运营师",
        "AI培训师",
        "AI GEO优化师",
        "AI工作流优化师"
      ],
      "targets": [
        "零基础求职者",
        "在职进阶人员",
        "跨行业转型者"
      ]
    },
    "tags": [
      "💼 22天带薪实习",
      "🎯 数据驱动运营",
      "🤖 GEO获客差异化",
      "🏢 企业真实项目操盘",
      "🤝 五年就业推荐"
    ],
    "faq": [
      {
        "id": "faq-1",
        "question": "AI新媒体运营师就业班学费是多少？包含哪些费用？",
        "answer": "本站明码标价：AI新媒体运营师就业班学费 13800 元（人民币），费用包含课程、教材、实训、22天带薪实习与就业指导，报名前一次性告知，无隐形消费。我们也提供官方免息分期与\"先就业后付尾款\"选项。"
      },
      {
        "id": "faq-2",
        "question": "零基础、跨专业能报读AI新媒体运营师就业班吗？",
        "answer": "可以。课程采用\"理论夯实+项目实操+就业实训\"的渐进式教学，从基础工具与流程讲起，全程对标企业真实岗位工作场景；缺课可跟下一期补，全部正课提供录播回放。"
      },
      {
        "id": "faq-3",
        "question": "AI新媒体运营师就业班要学多久？上课形式是什么？",
        "answer": "AI新媒体运营师就业班学习周期为50天 + 22天带薪实习，以线下直营校区小班面授为主，导师手把手实操指导；配套线上精品录播、直播复盘与课后答疑。广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课。"
      },
      {
        "id": "faq-4",
        "question": "学完AI新媒体运营师就业班就业怎么处理？",
        "answer": "我们不承诺\"包就业\"或\"100%安排上岗\"（这类表述涉嫌违反广告法），但提供合同化的就业服务清单：简历诊断≥2次、模拟面试≥2轮、企业内推、作品集指导至通过验收、结业后五年内不限次就业推荐。"
      },
      {
        "id": "faq-5",
        "question": "如何预约AI新媒体运营师就业班试听？",
        "answer": "可拨打全国统一服务热线400-800-4459（每天8:00-23:00）、在官网填写免费试听表单，或直接到访就近校区。课程顾问会安排1节正课试听，并输出《个人学习规划书》。"
      }
    ],
    "seo": {
      "title": "AI新媒体运营师就业班_50天+22天带薪实习 - 美迪时代教育",
      "description": "AI新媒体运营师就业班：聚焦AI时代企业获客刚需，50天线下集训·288课时，推荐流量与AI流量获客实战成体系教学。学习周期50天 + 22天带薪实习，学费13800元（明码标价、无隐形消费），广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课，咨询热线400-800-4459。",
      "keywords": "AI新媒体运营师就业班,AI新媒体运营培训班,新媒体运营培训班,广州新媒体运营培训,短视频运营培训"
    }
  },
  {
    "slug": "n2-ai-visual-design",
    "order": 2,
    "code": "N2",
    "category": "ai",
    "title": "AI视觉设计师就业班",
    "subtitle": "50天 + 22天带薪实习 · AI长期班 · 明码标价无隐形消费",
    "mainTitle": "N2 · AI视觉设计师就业班",
    "cover": {
      "src": "/images/courses/sjsjsjyb.webp",
      "alt": "N2 · AI视觉设计师就业班",
      "width": 803,
      "height": 602
    },
    "badge": "🔥 热门就业班",
    "metaTags": [
      {
        "text": "AI长期班",
        "cls": "tag-blue"
      },
      {
        "text": "22天带薪实习",
        "cls": "tag-gold"
      },
      {
        "text": "设计功底+AIGC双能力",
        "cls": "tag-purple"
      }
    ],
    "price": {
      "amount": "15,800",
      "currency": "¥",
      "origin": "原价单科分报合计 ¥19,750",
      "save": "联报 8 折，立省 ¥3,950"
    },
    "stats": [
      {
        "text": "📅 50天线下学习 + 22天带薪岗位实习",
        "highlight": false
      },
      {
        "text": "⏱️ 四阶段进阶体系",
        "highlight": false
      },
      {
        "text": "🎨 毕业即带商用作品集",
        "highlight": true
      }
    ],
    "descHighlight": "聚焦AI与视觉设计复合技能，50天学习 + 22天带薪实习，四阶段打造<strong>「设计功底 + AIGC电商视觉」</strong>双能力，毕业即带商用作品集。",
    "curriculum": [
      {
        "badge": "01",
        "title": "第一阶段 · 基础设计",
        "subtitle": "2门核心课 · 夯实美工功底",
        "modules": [
          {
            "name": "电商美工设计班",
            "hour": "42课时",
            "highlight": false
          },
          {
            "name": "高级美工实战班",
            "hour": "42课时",
            "highlight": false
          }
        ]
      },
      {
        "badge": "02",
        "title": "第二阶段 · 高级设计",
        "subtitle": "2门进阶课 · 精修与三维建模",
        "modules": [
          {
            "name": "商业图片精修班",
            "hour": "30课时",
            "highlight": false
          },
          {
            "name": "C4D电商运用班",
            "hour": "30课时",
            "highlight": false
          }
        ]
      },
      {
        "badge": "03",
        "title": "第三阶段 · AIGC电商设计",
        "subtitle": "3门前沿课 · AI出图与视频赋能",
        "modules": [
          {
            "name": "AI工具应用赋能班",
            "hour": "18课时",
            "highlight": false
          },
          {
            "name": "电商AI设计师班",
            "hour": "36课时",
            "highlight": false
          },
          {
            "name": "电商AI视频创作班",
            "hour": "30课时",
            "highlight": false
          }
        ]
      },
      {
        "badge": "04",
        "title": "第四阶段 · 岗前实战",
        "subtitle": "全案操盘 · 带薪岗位实习",
        "modules": [
          {
            "name": "AI电商设计师岗前实战",
            "hour": "60课时",
            "highlight": false
          },
          {
            "name": "就业指导",
            "hour": "12课时",
            "highlight": false
          },
          {
            "name": "22天岗位实习",
            "hour": "带薪实习闭环",
            "highlight": true
          }
        ]
      }
    ],
    "practice": {
      "title": "传统功底 + AI进阶双重覆盖",
      "text": "从PS抠图修图、详情页设计到C4D建模渲染、OC渲染，再到AI提示词工程、WebUI/ComfyUI工作流、AI模特生成与AI视频制作，全链路打通。"
    },
    "outcomes": {
      "jobs": [
        "AI电商视觉设计师",
        "AIGC电商设计师",
        "电商视觉设计师",
        "AI视频创作设计师",
        "跨境电商视觉设计师"
      ],
      "targets": [
        "零基础求职者",
        "在职电商美工/设计师",
        "传统商家/企业老板",
        "创业者/自由职业者",
        "转行人员",
        "高校毕业生"
      ]
    },
    "tags": [
      "🎨 结业商用作品集",
      "🤖 AIGC视觉认证",
      "💼 22天带薪实习",
      "📈 传统设计+AI双能力",
      "🏢 美迪自有电商业务衔接",
      "🤝 五年就业推荐"
    ],
    "faq": [
      {
        "id": "faq-1",
        "question": "AI视觉设计师就业班学费是多少？包含哪些费用？",
        "answer": "本站明码标价：AI视觉设计师就业班学费 15800 元（人民币），费用包含课程、教材、实训、22天带薪实习与就业指导，报名前一次性告知，无隐形消费。我们也提供官方免息分期与\"先就业后付尾款\"选项。"
      },
      {
        "id": "faq-2",
        "question": "零基础、跨专业能报读AI视觉设计师就业班吗？",
        "answer": "可以。课程采用\"理论夯实+项目实操+就业实训\"的渐进式教学，从基础工具与流程讲起，全程对标企业真实岗位工作场景；缺课可跟下一期补，全部正课提供录播回放。"
      },
      {
        "id": "faq-3",
        "question": "AI视觉设计师就业班要学多久？上课形式是什么？",
        "answer": "AI视觉设计师就业班学习周期为50天 + 22天带薪实习，以线下直营校区小班面授为主，导师手把手实操指导；配套线上精品录播、直播复盘与课后答疑。广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课。"
      },
      {
        "id": "faq-4",
        "question": "学完AI视觉设计师就业班就业怎么处理？",
        "answer": "我们不承诺\"包就业\"或\"100%安排上岗\"（这类表述涉嫌违反广告法），但提供合同化的就业服务清单：简历诊断≥2次、模拟面试≥2轮、企业内推、作品集指导至通过验收、结业后五年内不限次就业推荐。"
      },
      {
        "id": "faq-5",
        "question": "如何预约AI视觉设计师就业班试听？",
        "answer": "可拨打全国统一服务热线400-800-4459（每天8:00-23:00）、在官网填写免费试听表单，或直接到访就近校区。课程顾问会安排1节正课试听，并输出《个人学习规划书》。"
      }
    ],
    "seo": {
      "title": "AI视觉设计师就业班_50天+22天带薪实习 - 美迪时代教育",
      "description": "AI视觉设计师就业班：从设计基础到AIGC电商设计全链路，50天·288课时，主讲老师手把手实操带练。学习周期50天 + 22天带薪实习，学费15800元（明码标价、无隐形消费），广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课，咨询热线400-800-4459。",
      "keywords": "AI视觉设计师就业班,AI视觉设计培训班,电商美工培训,平面设计培训班,AIGC设计培训"
    }
  },
  {
    "slug": "n3-short-video",
    "order": 3,
    "code": "N3",
    "category": "ai",
    "title": "商业短视频就业班",
    "subtitle": "48天 + 22天带薪实习 · AI长期班 · 明码标价无隐形消费",
    "mainTitle": "N3 · 商业短视频就业班",
    "cover": {
      "src": "/images/courses/sydspjyb.webp",
      "alt": "N3 · 商业短视频就业班",
      "width": 805,
      "height": 605
    },
    "badge": "🔥 热门就业班",
    "metaTags": [
      {
        "text": "AI长期班",
        "cls": "tag-blue"
      },
      {
        "text": "22天带薪实习",
        "cls": "tag-gold"
      },
      {
        "text": "拍摄+创作+运营+实战",
        "cls": "tag-purple"
      }
    ],
    "price": {
      "amount": "15,800",
      "currency": "¥",
      "origin": "原价单科分报合计 ¥19,750",
      "save": "联报 8 折，立省 ¥3,950"
    },
    "stats": [
      {
        "text": "📅 48天线下学习 + 22天带薪岗位实习",
        "highlight": false
      },
      {
        "text": "⏱️ 四阶段闭环体系",
        "highlight": false
      },
      {
        "text": "🎬 打造全能型短视频人才",
        "highlight": true
      }
    ],
    "descHighlight": "针对AI浪潮下复合型人才缺口，48天学习 + 22天带薪实习，四阶段闭环培养<strong>「拍摄剪辑 → 高级创作 → 运营推广 → 岗前实战」</strong>全能型短视频人才。",
    "curriculum": [
      {
        "badge": "01",
        "title": "第一阶段 · 拍摄剪辑",
        "subtitle": "2门核心课 · 熟练运镜与剪辑",
        "modules": [
          {
            "name": "手机拍摄剪辑班",
            "hour": "24课时",
            "highlight": false
          },
          {
            "name": "短视频拍摄剪辑高级班",
            "hour": "42课时",
            "highlight": false
          }
        ]
      },
      {
        "badge": "02",
        "title": "第二阶段 · 高级创作",
        "subtitle": "2门进阶课 · AI视频与特效合成",
        "modules": [
          {
            "name": "电商AI视频创作班",
            "hour": "30课时",
            "highlight": false
          },
          {
            "name": "短视频特效合成班",
            "hour": "60课时",
            "highlight": false
          }
        ]
      },
      {
        "badge": "03",
        "title": "第三阶段 · 运营推广",
        "subtitle": "2门爆款课 · 账号运营与获客引流",
        "modules": [
          {
            "name": "抖音短视频运营班",
            "hour": "24课时",
            "highlight": false
          },
          {
            "name": "抖音获客引流实战班",
            "hour": "24课时",
            "highlight": false
          }
        ]
      },
      {
        "badge": "04",
        "title": "第四阶段 · 岗前实战",
        "subtitle": "商业项目操盘 · 带薪岗位实习",
        "modules": [
          {
            "name": "商业短视频/项目运营实战班",
            "hour": "72课时",
            "highlight": false
          },
          {
            "name": "就业指导实战班",
            "hour": "12课时",
            "highlight": false
          },
          {
            "name": "22天岗位实习",
            "hour": "带薪实习闭环",
            "highlight": true
          }
        ]
      }
    ],
    "practice": {
      "title": "实战项目教学 · 掌握全链路核心技能",
      "text": "从基础手机拍剪、单反/微单运镜布光，到特效合成与AI视频创作工具应用，再到抖音算法分发、获客引流与真实商业项目实训，深度打通全链路短视频生产与商业变现闭环。"
    },
    "outcomes": {
      "jobs": [
        "AI视频创作师",
        "短视频拍摄剪辑师",
        "短视频剪辑助理",
        "抖音账号运营助理",
        "本地生活运营助理",
        "广告投放助理"
      ],
      "targets": [
        "零基础小白",
        "在职短视频创作者/剪辑师",
        "传统商家/企业老板",
        "创业者/自由职业者",
        "转行人员",
        "高校毕业生"
      ]
    },
    "tags": [
      "🎬 结业5条商用视频",
      "📜 巨量学/行业专业认证",
      "💼 22天带薪实习",
      "💰 派单池四要素公示",
      "🏢 合作MCN/商家直派",
      "🤝 五年就业推荐"
    ],
    "faq": [
      {
        "id": "faq-1",
        "question": "商业短视频就业班学费是多少？包含哪些费用？",
        "answer": "本站明码标价：商业短视频就业班学费 15800 元（人民币），费用包含课程、教材、实训、22天带薪实习与就业指导，报名前一次性告知，无隐形消费。我们也提供官方免息分期与\"先就业后付尾款\"选项。"
      },
      {
        "id": "faq-2",
        "question": "零基础、跨专业能报读商业短视频就业班吗？",
        "answer": "可以。课程采用\"理论夯实+项目实操+就业实训\"的渐进式教学，从基础工具与流程讲起，全程对标企业真实岗位工作场景；缺课可跟下一期补，全部正课提供录播回放。"
      },
      {
        "id": "faq-3",
        "question": "商业短视频就业班要学多久？上课形式是什么？",
        "answer": "商业短视频就业班学习周期为48天 + 22天带薪实习，以线下直营校区小班面授为主，导师手把手实操指导；配套线上精品录播、直播复盘与课后答疑。广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课。"
      },
      {
        "id": "faq-4",
        "question": "学完商业短视频就业班就业怎么处理？",
        "answer": "我们不承诺\"包就业\"或\"100%安排上岗\"（这类表述涉嫌违反广告法），但提供合同化的就业服务清单：简历诊断≥2次、模拟面试≥2轮、企业内推、作品集指导至通过验收、结业后五年内不限次就业推荐。"
      },
      {
        "id": "faq-5",
        "question": "如何预约商业短视频就业班试听？",
        "answer": "可拨打全国统一服务热线400-800-4459（每天8:00-23:00）、在官网填写免费试听表单，或直接到访就近校区。课程顾问会安排1节正课试听，并输出《个人学习规划书》。"
      }
    ],
    "seo": {
      "title": "商业短视频就业班_48天+22天带薪实习 - 美迪时代教育",
      "description": "商业短视频就业班：拍摄剪辑、高级创作到运营推广全流程，48天·288课时，掌握短视频全链路核心技能。学习周期48天 + 22天带薪实习，学费15800元（明码标价、无隐形消费），广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课，咨询热线400-800-4459。",
      "keywords": "商业短视频就业班,短视频制作培训班,短视频剪辑培训,短视频运营培训,广州短视频培训"
    }
  },
  {
    "slug": "n4-aigc",
    "order": 4,
    "code": "N4",
    "category": "ai",
    "title": "AIGC全能实战班",
    "subtitle": "89天一价三证 · AI长期班 · 明码标价无隐形消费",
    "mainTitle": "N4 · AIGC全能实战班",
    "cover": {
      "src": "/images/courses/aigcqnszb.webp",
      "alt": "N4 · AIGC全能实战班",
      "width": 804,
      "height": 602
    },
    "badge": "🔥 热门就业班",
    "metaTags": [
      {
        "text": "AI长期班",
        "cls": "tag-blue"
      },
      {
        "text": "22天带薪实习",
        "cls": "tag-gold"
      },
      {
        "text": "六大阶段全链路覆盖",
        "cls": "tag-purple"
      }
    ],
    "price": {
      "amount": "22,800",
      "currency": "¥",
      "origin": "原价单科分报合计 ¥28,500",
      "save": "联报 8 折，立省 ¥5,700"
    },
    "stats": [
      {
        "text": "📅 89天线下学习 + 22天带薪岗位实习",
        "highlight": false
      },
      {
        "text": "⏱️ 六大阶段全链路体系",
        "highlight": false
      },
      {
        "text": "🚀 一站式打造AIGC复合型人才",
        "highlight": true
      }
    ],
    "descHighlight": "89天学习 + 22天带薪实习，六大阶段全链路覆盖<strong>「AI工具 → 视频生成 → 新媒体运营 → 设计 → 岗前实战 → 就业实习」</strong>，一站式打造AIGC复合型人才。",
    "curriculum": [
      {
        "badge": "01",
        "title": "第一阶段 · AI基础与工具",
        "subtitle": "2门核心课 · 掌握核心AI生产力",
        "modules": [
          {
            "name": "AI工具使用应用班",
            "hour": "12课时",
            "highlight": false
          },
          {
            "name": "AI自媒体副业班",
            "hour": "24课时",
            "highlight": false
          }
        ]
      },
      {
        "badge": "02",
        "title": "第二阶段 · AI视频生成师",
        "subtitle": "3门进阶课 · 拍摄剪辑与AI视频",
        "modules": [
          {
            "name": "手机拍摄剪辑",
            "hour": "24课时",
            "highlight": false
          },
          {
            "name": "短视频高级剪辑",
            "hour": "42课时",
            "highlight": false
          },
          {
            "name": "电商AI视频创作",
            "hour": "30课时",
            "highlight": false
          }
        ]
      },
      {
        "badge": "03",
        "title": "第三阶段 · AI新媒体运营",
        "subtitle": "4门爆款课 · 运营引流与智能体",
        "modules": [
          {
            "name": "抖音运营",
            "hour": "24课时",
            "highlight": false
          },
          {
            "name": "抖音获客引流",
            "hour": "24课时",
            "highlight": false
          },
          {
            "name": "AI智能体开发",
            "hour": "24课时",
            "highlight": false
          },
          {
            "name": "企业AI获客GEO训练营",
            "hour": "24课时",
            "highlight": false
          }
        ]
      },
      {
        "badge": "04",
        "title": "第四阶段 · AI设计师训练营",
        "subtitle": "4门专业课 · 美工精修与C4D/AI设计",
        "modules": [
          {
            "name": "电商美工",
            "hour": "42课时",
            "highlight": false
          },
          {
            "name": "商业图片精修",
            "hour": "30课时",
            "highlight": false
          },
          {
            "name": "C4D电商运用班",
            "hour": "30课时",
            "highlight": false
          },
          {
            "name": "电商AI设计师",
            "hour": "36课时",
            "highlight": false
          }
        ]
      },
      {
        "badge": "05",
        "title": "第五阶段 · 运营创作岗前实战",
        "subtitle": "2大多维方向 · 商业项目真操盘",
        "modules": [
          {
            "name": "电商设计师岗前实战",
            "hour": "60课时",
            "highlight": false
          },
          {
            "name": "新媒体运营师岗前实战",
            "hour": "48课时",
            "highlight": false
          }
        ]
      },
      {
        "badge": "06",
        "title": "第六阶段 · 就业指导&实习",
        "subtitle": "导师指导 · 带薪岗位实习",
        "modules": [
          {
            "name": "就业指导实战",
            "hour": "12课时",
            "highlight": false
          },
          {
            "name": "AIGC全能运营岗位实习",
            "hour": "22天带薪闭环",
            "highlight": true
          }
        ]
      }
    ],
    "practice": {
      "title": "真实商业项目 + 多方向岗前实战",
      "text": "企业导师带教，电商设计、视频创作、新媒体运营三大方向岗前实战；各训练营均安排综合实战、结业作品与综合考核，毕业产出可商用作品集。"
    },
    "outcomes": {
      "jobs": [
        "AIGC全栈设计师",
        "AI电商视觉设计师",
        "AI视频创作师",
        "AI新媒体运营师",
        "AI智能体开发师",
        "AI获客GEO优化师"
      ],
      "targets": [
        "零基础小白",
        "在职电商美工/设计师",
        "在职短视频创作者/剪辑师",
        "创业者/自由职业者",
        "企业老板/高管",
        "转行人员",
        "高校毕业生"
      ]
    },
    "tags": [
      "🏆 AIGC全栈复合人才",
      "🤖 企业级智能体作品",
      "💼 22天带薪实习",
      "🎨 商业级作品集产出",
      "🏢 三大方向岗前实战分流",
      "🤝 五年就业推荐"
    ],
    "faq": [
      {
        "id": "faq-1",
        "question": "AIGC全能实战班学费是多少？包含哪些费用？",
        "answer": "本站明码标价：AIGC全能实战班学费 22800 元（人民币），费用包含课程、教材、实训、22天带薪实习与就业指导，报名前一次性告知，无隐形消费。我们也提供官方免息分期与\"先就业后付尾款\"选项。"
      },
      {
        "id": "faq-2",
        "question": "零基础、跨专业能报读AIGC全能实战班吗？",
        "answer": "可以。课程采用\"理论夯实+项目实操+就业实训\"的渐进式教学，从基础工具与流程讲起，全程对标企业真实岗位工作场景；缺课可跟下一期补，全部正课提供录播回放。"
      },
      {
        "id": "faq-3",
        "question": "AIGC全能实战班要学多久？上课形式是什么？",
        "answer": "AIGC全能实战班学习周期为89天一价三证，以线下直营校区小班面授为主，导师手把手实操指导；配套线上精品录播、直播复盘与课后答疑。广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课。"
      },
      {
        "id": "faq-4",
        "question": "学完AIGC全能实战班就业怎么处理？",
        "answer": "我们不承诺\"包就业\"或\"100%安排上岗\"（这类表述涉嫌违反广告法），但提供合同化的就业服务清单：简历诊断≥2次、模拟面试≥2轮、企业内推、作品集指导至通过验收、结业后五年内不限次就业推荐。"
      },
      {
        "id": "faq-5",
        "question": "如何预约AIGC全能实战班试听？",
        "answer": "可拨打全国统一服务热线400-800-4459（每天8:00-23:00）、在官网填写免费试听表单，或直接到访就近校区。课程顾问会安排1节正课试听，并输出《个人学习规划书》。"
      }
    ],
    "seo": {
      "title": "AIGC全能实战班_89天一价三证 - 美迪时代教育",
      "description": "AIGC全能实战班：AI视频生成、AI设计与AI运营多方向岗前实战，89天一价三证，零基础直达复合型AI岗位。学习周期89天一价三证，学费22800元（明码标价、无隐形消费），广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课，咨询热线400-800-4459。",
      "keywords": "AIGC全能实战班,AIGC培训班,AIGC就业班,AI视频生成培训,AIGC certificates培训"
    }
  },
  {
    "slug": "n5-ai-drama",
    "order": 5,
    "code": "N5",
    "category": "ai",
    "title": "AI短剧漫剧就业班",
    "subtitle": "27天 + 22天带薪实习 · AI长期班 · 明码标价无隐形消费",
    "mainTitle": "N5 · AI短剧漫剧就业班",
    "cover": {
      "src": "/images/courses/djmjjyb.webp",
      "alt": "N5 · AI短剧漫剧就业班",
      "width": 806,
      "height": 605
    },
    "badge": "🔥 热门就业班",
    "metaTags": [
      {
        "text": "AI长期班",
        "cls": "tag-blue"
      },
      {
        "text": "22天带薪实习",
        "cls": "tag-gold"
      },
      {
        "text": "从剧本到成片全链路",
        "cls": "tag-purple"
      }
    ],
    "price": {
      "amount": "12,800",
      "currency": "¥",
      "origin": "原价单科分报合计 ¥16,000",
      "save": "联报 8 折，立省 ¥3,200"
    },
    "stats": [
      {
        "text": "📅 27天线下学习 + 22天带薪岗位实习",
        "highlight": false
      },
      {
        "text": "⏱️ 三阶段全链路实操",
        "highlight": false
      },
      {
        "text": "🎬 主打短剧漫剧商业变现",
        "highlight": true
      }
    ],
    "descHighlight": "27天学习 + 22天带薪实习，从剧本到成片全链路实操，主打<strong>最新AI视频工具矩阵 + 短剧漫剧商业变现能力</strong>。",
    "curriculum": [
      {
        "badge": "01",
        "title": "第一阶段 · AI工具使用训练营",
        "subtitle": "2门核心课 · 工具赋能与剪映创作",
        "modules": [
          {
            "name": "AI工具应用赋能班",
            "hour": "12课时",
            "highlight": false
          },
          {
            "name": "AI剪映影视创作班",
            "hour": "24课时",
            "highlight": false
          }
        ]
      },
      {
        "badge": "02",
        "title": "第二阶段 · AI短剧漫剧训练营",
        "subtitle": "2门前沿课 · 漫剧与真人剧创作",
        "modules": [
          {
            "name": "AI漫剧训练营",
            "hour": "24课时",
            "highlight": false
          },
          {
            "name": "AI真人剧训练营",
            "hour": "36课时",
            "highlight": false
          }
        ]
      },
      {
        "badge": "03",
        "title": "第三阶段 · 岗前实战",
        "subtitle": "全案操盘 · 带薪岗位实习",
        "modules": [
          {
            "name": "创作师岗前实战",
            "hour": "54课时",
            "highlight": false
          },
          {
            "name": "就业指导实战",
            "hour": "12课时",
            "highlight": false
          },
          {
            "name": "岗位实习",
            "hour": "22天带薪闭环",
            "highlight": true
          }
        ]
      }
    ],
    "practice": {
      "title": "全链路创作实操 · 多题材覆盖",
      "text": "从提示词与脚本分镜、资产制作、视频生成到后期成片的2D/3D完整案例实战；涵盖男频爽文、女频甜宠、悬疑、海外剧等多题材创作能力。"
    },
    "outcomes": {
      "jobs": [
        "AI短剧创作师",
        "AI漫剧创作师",
        "AI短剧导演",
        "AI视频创作师",
        "AI短剧运营专员",
        "AI漫剧编剧"
      ],
      "targets": [
        "零基础小白",
        "在职短视频创作者/剪辑师",
        "创业者/自由职业者",
        "网文作者/漫画爱好者",
        "企业品牌运营人员",
        "转行人员",
        "高校毕业生"
      ]
    },
    "tags": [
      "🎭 2D/3D多题材漫剧",
      "🤖 AI真人短剧创作",
      "💼 22天带薪实习",
      "💰 商业变现/投流分账",
      "🏢 制作公司岗位直推",
      "🤝 五年就业推荐"
    ],
    "faq": [
      {
        "id": "faq-1",
        "question": "AI短剧漫剧就业班学费是多少？包含哪些费用？",
        "answer": "本站明码标价：AI短剧漫剧就业班学费 12800 元（人民币），费用包含课程、教材、实训、22天带薪实习与就业指导，报名前一次性告知，无隐形消费。我们也提供官方免息分期与\"先就业后付尾款\"选项。"
      },
      {
        "id": "faq-2",
        "question": "零基础、跨专业能报读AI短剧漫剧就业班吗？",
        "answer": "可以。课程采用\"理论夯实+项目实操+就业实训\"的渐进式教学，从基础工具与流程讲起，全程对标企业真实岗位工作场景；缺课可跟下一期补，全部正课提供录播回放。"
      },
      {
        "id": "faq-3",
        "question": "AI短剧漫剧就业班要学多久？上课形式是什么？",
        "answer": "AI短剧漫剧就业班学习周期为27天 + 22天带薪实习，以线下直营校区小班面授为主，导师手把手实操指导；配套线上精品录播、直播复盘与课后答疑。广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课。"
      },
      {
        "id": "faq-4",
        "question": "学完AI短剧漫剧就业班就业怎么处理？",
        "answer": "我们不承诺\"包就业\"或\"100%安排上岗\"（这类表述涉嫌违反广告法），但提供合同化的就业服务清单：简历诊断≥2次、模拟面试≥2轮、企业内推、作品集指导至通过验收、结业后五年内不限次就业推荐。"
      },
      {
        "id": "faq-5",
        "question": "如何预约AI短剧漫剧就业班试听？",
        "answer": "可拨打全国统一服务热线400-800-4459（每天8:00-23:00）、在官网填写免费试听表单，或直接到访就近校区。课程顾问会安排1节正课试听，并输出《个人学习规划书》。"
      }
    ],
    "seo": {
      "title": "AI短剧漫剧就业班_27天+22天带薪实习 - 美迪时代教育",
      "description": "AI短剧漫剧就业班：AI工具训练营到短剧漫剧创作营全链路实操，27天·162课时，多题材覆盖。学习周期27天 + 22天带薪实习，学费12800元（明码标价、无隐形消费），广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课，咨询热线400-800-4459。",
      "keywords": "AI短剧漫剧就业班,AI短剧创作培训,短剧编剧培训,漫剧制作培训,AI内容创作培训"
    }
  },
  {
    "slug": "n6-amazon",
    "order": 6,
    "code": "N6",
    "category": "crossborder",
    "title": "亚马逊高阶运营实战班",
    "subtitle": "27天 + 22天岗位实习 · 跨境电商 · 明码标价无隐形消费",
    "mainTitle": "N6 · 亚马逊就业班",
    "cover": {
      "src": "/images/courses/ymxjyb.webp",
      "alt": "N6 · 亚马逊就业班",
      "width": 800,
      "height": 602
    },
    "badge": "🔥 热门就业班",
    "metaTags": [
      {
        "text": "跨境电商",
        "cls": "tag-blue"
      },
      {
        "text": "22天带薪实习",
        "cls": "tag-gold"
      },
      {
        "text": "AI辅助全流程+真实店铺实操",
        "cls": "tag-purple"
      }
    ],
    "price": {
      "amount": "13,800",
      "currency": "¥",
      "origin": "原价单科分报合计 ¥17,250",
      "save": "联报 8 折，立省 ¥3,450"
    },
    "stats": [
      {
        "text": "📅 27天学习 + 22天带薪岗位实习",
        "highlight": false
      },
      {
        "text": "⏱️ 双阶段系统培养 · 真实店铺操盘",
        "highlight": false
      },
      {
        "text": "🌐 AI辅助全流程跨境运营",
        "highlight": true
      }
    ],
    "descHighlight": "27天学习 + 22天实习，聚焦亚马逊跨境运营人才短缺，主打<strong>「AI辅助全流程运营」</strong>与真实店铺实操，依托美迪15年跨境电商服务商基因，毕业即具备独立操盘与爆款打造能力。",
    "curriculum": [
      {
        "badge": "01",
        "title": "第一阶段 · 亚马逊运营推广",
        "subtitle": "2门核心课 · 选品推广与AI高阶运营",
        "modules": [
          {
            "name": "亚马逊运营推广班",
            "hour": "30课时",
            "highlight": false
          },
          {
            "name": "亚马逊AI高阶运营班",
            "hour": "18课时",
            "highlight": false
          }
        ]
      },
      {
        "badge": "02",
        "title": "第二阶段 · 实训 & 就业",
        "subtitle": "真实店铺操盘 · 带薪岗位实习",
        "modules": [
          {
            "name": "亚马逊实训班",
            "hour": "14课时",
            "highlight": false
          },
          {
            "name": "就业指导实战班",
            "hour": "12课时",
            "highlight": false
          },
          {
            "name": "22天岗位实习",
            "hour": "带薪实习闭环",
            "highlight": true
          }
        ]
      }
    ],
    "practice": {
      "title": "真实店铺实操 · AI辅助全流程运营",
      "text": "依托美迪15年跨境电商服务商基因，自有跨境业务提供真实店铺实操与实习岗位；深度融合AI智能选品、Listing智能优化、广告自动化投放、智能客服与跨境数据分析，毕业即具备跨境独立操盘能力。"
    },
    "outcomes": {
      "jobs": [
        "亚马逊运营专员",
        "广告优化师",
        "选品开发专员",
        "跨境电商运营主管",
        "独立站运营专员"
      ],
      "targets": [
        "跨境电商从业者",
        "亚马逊卖家/运营人员",
        "外贸企业负责人",
        "转行人员",
        "创业者",
        "高校毕业生"
      ]
    },
    "tags": [
      "🌐 亚马逊真实店铺实操",
      "🤖 AI辅助跨境运营",
      "💼 22天带薪实习",
      "📊 PPC广告与爆款选品",
      "🏢 跨境名企岗位直推",
      "🤝 五年就业推荐"
    ],
    "faq": [
      {
        "id": "faq-1",
        "question": "亚马逊高阶运营实战班学费是多少？包含哪些费用？",
        "answer": "本站明码标价：亚马逊高阶运营实战班学费 13800 元（人民币），费用包含课程、教材、实训、跟岗实训与就业指导，报名前一次性告知，无隐形消费。我们也提供官方免息分期与\"先就业后付尾款\"选项。"
      },
      {
        "id": "faq-2",
        "question": "零基础、跨专业能报读亚马逊高阶运营实战班吗？",
        "answer": "可以。课程采用\"理论夯实+项目实操+就业实训\"的渐进式教学，从基础工具与流程讲起，全程对标企业真实岗位工作场景；缺课可跟下一期补，全部正课提供录播回放。"
      },
      {
        "id": "faq-3",
        "question": "亚马逊高阶运营实战班要学多久？上课形式是什么？",
        "answer": "亚马逊高阶运营实战班学习周期为27天 + 22天岗位实习，以线下直营校区小班面授为主，导师手把手实操指导；配套线上精品录播、直播复盘与课后答疑。广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课。"
      },
      {
        "id": "faq-4",
        "question": "学完亚马逊高阶运营实战班就业怎么处理？",
        "answer": "我们不承诺\"包就业\"或\"100%安排上岗\"（这类表述涉嫌违反广告法），但提供合同化的就业服务清单：简历诊断≥2次、模拟面试≥2轮、企业内推、作品集指导至通过验收、结业后五年内不限次就业推荐。"
      },
      {
        "id": "faq-5",
        "question": "如何预约亚马逊高阶运营实战班试听？",
        "answer": "可拨打全国统一服务热线400-800-4459（每天8:00-23:00）、在官网填写免费试听表单，或直接到访就近校区。课程顾问会安排1节正课试听，并输出《个人学习规划书》。"
      }
    ],
    "seo": {
      "title": "亚马逊高阶运营实战班_27天+22天岗位实习 - 美迪时代教育",
      "description": "亚马逊高阶运营实战班：真实店铺实操全流程，AI辅助运营与广告优化，27天+22天带薪岗位实习。学习周期27天 + 22天岗位实习，学费13800元（明码标价、无隐形消费），广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课，咨询热线400-800-4459。",
      "keywords": "亚马逊运营实战班,亚马逊高阶运营培训,跨境电商培训班,亚马逊选品广告投放培训"
    }
  },
  {
    "slug": "n7-tiktok",
    "order": 7,
    "code": "N7",
    "category": "crossborder",
    "title": "TikTok营销实战班",
    "subtitle": "7天高强度集训 · 跨境电商 · 明码标价无隐形消费",
    "mainTitle": "N7 · TikTok就业班",
    "cover": {
      "src": "/images/courses/tiktokjyb.webp",
      "alt": "N7 · TikTok就业班",
      "width": 802,
      "height": 602
    },
    "badge": "🔥 热门就业班",
    "metaTags": [
      {
        "text": "跨境电商",
        "cls": "tag-blue"
      },
      {
        "text": "短视频+小店全链路",
        "cls": "tag-gold"
      },
      {
        "text": "真实账号实操操盘",
        "cls": "tag-purple"
      }
    ],
    "price": {
      "amount": "10,800",
      "currency": "¥",
      "origin": "原价单科分报合计 ¥13,500",
      "save": "联报 8 折，立省 ¥2,700"
    },
    "stats": [
      {
        "text": "📅 7天短周期高强度锻造",
        "highlight": false
      },
      {
        "text": "⏱️ 三阶段 114课时全链路打通",
        "highlight": false
      },
      {
        "text": "📱 真实TikTok账号全流程实操",
        "highlight": true
      }
    ],
    "descHighlight": "7天短周期高强度锻造，真实TikTok账号全流程实操，从<strong>选品运营、拍摄剪辑到广告投流与复盘</strong>一次打通，打造出海内容与电商复合型人才。",
    "curriculum": [
      {
        "badge": "01",
        "title": "第一阶段 · TikTok基础运营",
        "subtitle": "2门核心课 · 营销算法与小店搭建",
        "modules": [
          {
            "name": "TikTok短视频营销班",
            "hour": "18课时",
            "highlight": false
          },
          {
            "name": "TikTok小店实战班",
            "hour": "18课时",
            "highlight": false
          }
        ]
      },
      {
        "badge": "02",
        "title": "第二阶段 · 手机拍摄剪辑",
        "subtitle": "1门爆款课 · 海外素材拍剪实操",
        "modules": [
          {
            "name": "手机拍摄剪辑",
            "hour": "24课时",
            "highlight": false
          }
        ]
      },
      {
        "badge": "03",
        "title": "第三阶段 · 实训 & 就业",
        "subtitle": "真实账号操盘 · 商业投流就业",
        "modules": [
          {
            "name": "TikTok实训班",
            "hour": "42课时",
            "highlight": false
          },
          {
            "name": "就业指导实战班",
            "hour": "12课时",
            "highlight": false
          }
        ]
      }
    ],
    "practice": {
      "title": "真实TikTok账号实操 · 从选品到投流全链路打通",
      "text": "真实TikTok账号全流程实操，学员亲自下场操盘海外环境配置、爆款选品、短视频拍摄剪辑、小店运营、达人带货建联与广告投放（TikTok Ads）全链路，结业产出可商业化运营账号。"
    },
    "outcomes": {
      "jobs": [
        "TikTok运营专员",
        "TikTok小店运营专员",
        "TikTok短视频运营",
        "TikTok广告投手",
        "TikTok内容创作师",
        "达人建联专员"
      ],
      "targets": [
        "跨境电商从业者",
        "TikTok卖家/运营人员",
        "外贸企业负责人",
        "转行人员",
        "创业者",
        "高校毕业生"
      ]
    },
    "tags": [
      "📱 TikTok全链路实操",
      "🛒 TikTok Shop小店运营",
      "🎯 TikTok Ads海外投流",
      "🤝 达人建联与带货分销",
      "🏢 跨境企业岗位直推",
      "🤝 五年就业推荐"
    ],
    "faq": [
      {
        "id": "faq-1",
        "question": "TikTok营销实战班学费是多少？包含哪些费用？",
        "answer": "本站明码标价：TikTok营销实战班学费 10800 元（人民币），费用包含课程、教材、实训、跟岗实训与就业指导，报名前一次性告知，无隐形消费。我们也提供官方免息分期与\"先就业后付尾款\"选项。"
      },
      {
        "id": "faq-2",
        "question": "零基础、跨专业能报读TikTok营销实战班吗？",
        "answer": "可以。课程采用\"理论夯实+项目实操+就业实训\"的渐进式教学，从基础工具与流程讲起，全程对标企业真实岗位工作场景；缺课可跟下一期补，全部正课提供录播回放。"
      },
      {
        "id": "faq-3",
        "question": "TikTok营销实战班要学多久？上课形式是什么？",
        "answer": "TikTok营销实战班学习周期为7天高强度集训，以线下直营校区小班面授为主，导师手把手实操指导；配套线上精品录播、直播复盘与课后答疑。广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课。"
      },
      {
        "id": "faq-4",
        "question": "学完TikTok营销实战班就业怎么处理？",
        "answer": "我们不承诺\"包就业\"或\"100%安排上岗\"（这类表述涉嫌违反广告法），但提供合同化的就业服务清单：简历诊断≥2次、模拟面试≥2轮、企业内推、作品集指导至通过验收、结业后五年内不限次就业推荐。"
      },
      {
        "id": "faq-5",
        "question": "如何预约TikTok营销实战班试听？",
        "answer": "可拨打全国统一服务热线400-800-4459（每天8:00-23:00）、在官网填写免费试听表单，或直接到访就近校区。课程顾问会安排1节正课试听，并输出《个人学习规划书》。"
      }
    ],
    "seo": {
      "title": "TikTok营销实战班_7天高强度集训 - 美迪时代教育",
      "description": "TikTok营销实战班：真实TikTok账号实操，从基础运营、手机拍摄剪辑到选品投流全链路打通，7天高强度集训。学习周期7天高强度集训，学费10800元（明码标价、无隐形消费），广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课，咨询热线400-800-4459。",
      "keywords": "TikTok营销实战班,TikTok运营培训,海外短视频运营培训,TikTok投流培训"
    }
  },
  {
    "slug": "n8-overseas-smm",
    "order": 8,
    "code": "N8",
    "category": "crossborder",
    "title": "海外社媒运营专员就业班",
    "subtitle": "18天全链路实操 · 跨境电商 · 明码标价无隐形消费",
    "mainTitle": "N8 · 海外社媒运营专员就业班",
    "cover": {
      "src": "/images/courses/hwsmyyzyjyb.webp",
      "alt": "N8 · 海外社媒运营专员就业班",
      "width": 807,
      "height": 608
    },
    "badge": "🔥 热门就业班",
    "metaTags": [
      {
        "text": "跨境电商",
        "cls": "tag-blue"
      },
      {
        "text": "独立站+社媒+投流",
        "cls": "tag-gold"
      },
      {
        "text": "全平台出海获客",
        "cls": "tag-purple"
      }
    ],
    "price": {
      "amount": "13,800",
      "currency": "¥",
      "origin": "原价单科分报合计 ¥17,250",
      "save": "联报 8 折，立省 ¥3,450"
    },
    "stats": [
      {
        "text": "📅 18天系统化培养",
        "highlight": false
      },
      {
        "text": "⏱️ 三阶段 120课时全能进阶",
        "highlight": false
      },
      {
        "text": "🌐 懂策划 · 擅内容 · 精投放",
        "highlight": true
      }
    ],
    "descHighlight": "18天系统化培养<strong>「懂策划、擅内容、精投放」</strong>的海外社媒复合型人才，深度覆盖独立站、Instagram、Facebook全平台，实战打通出海全流程获客闭环。",
    "curriculum": [
      {
        "badge": "01",
        "title": "第一阶段 · 海外社媒基础运营",
        "subtitle": "3门核心课 · 独立站搭建与社媒投流",
        "modules": [
          {
            "name": "独立站运营推广班",
            "hour": "18课时",
            "highlight": false
          },
          {
            "name": "海外社媒运营实战班",
            "hour": "24课时",
            "highlight": false
          },
          {
            "name": "Facebook高阶投流获客实战班",
            "hour": "18课时",
            "highlight": false
          }
        ]
      },
      {
        "badge": "02",
        "title": "第二阶段 · 手机拍摄剪辑",
        "subtitle": "1门爆款课 · 海外社媒素材拍摄剪辑",
        "modules": [
          {
            "name": "手机拍摄剪辑",
            "hour": "24课时",
            "highlight": false
          }
        ]
      },
      {
        "badge": "03",
        "title": "第三阶段 · 实训 & 就业",
        "subtitle": "海外项目实战 · 岗位就业指导",
        "modules": [
          {
            "name": "海外社媒实训班",
            "hour": "24课时",
            "highlight": false
          },
          {
            "name": "就业指导实战班",
            "hour": "12课时",
            "highlight": false
          }
        ]
      }
    ],
    "practice": {
      "title": "全案操盘实操 · 独立站 + 海外社媒 + 高阶投流",
      "text": "独立站建站与SEO推广、海外社媒矩阵搭建、Facebook/Instagram高阶投流获客与海外短视频拍摄剪辑深度结合；Facebook高阶投流属于培训市场稀缺技能，匹配企业出海刚需与快速上岗。"
    },
    "outcomes": {
      "jobs": [
        "海外社媒运营专员",
        "独立站运营专员",
        "Facebook广告投手",
        "Instagram运营专员",
        "海外社媒内容运营",
        "独立站推广专员"
      ],
      "targets": [
        "跨境电商/独立站从业者",
        "外贸企业负责人",
        "社媒运营人员/投手",
        "品牌出海营销人员",
        "创业者/转行人员"
      ]
    },
    "tags": [
      "🌐 Shopify/独立站搭建",
      "📘 Facebook/Meta高阶投流",
      "📸 Instagram/社媒内容矩阵",
      "🎯 海外短视频拍剪",
      "🏢 跨境出海企业直聘",
      "🤝 五年就业推荐"
    ],
    "faq": [
      {
        "id": "faq-1",
        "question": "海外社媒运营专员就业班学费是多少？包含哪些费用？",
        "answer": "本站明码标价：海外社媒运营专员就业班学费 13800 元（人民币），费用包含课程、教材、实训、跟岗实训与就业指导，报名前一次性告知，无隐形消费。我们也提供官方免息分期与\"先就业后付尾款\"选项。"
      },
      {
        "id": "faq-2",
        "question": "零基础、跨专业能报读海外社媒运营专员就业班吗？",
        "answer": "可以。课程采用\"理论夯实+项目实操+就业实训\"的渐进式教学，从基础工具与流程讲起，全程对标企业真实岗位工作场景；缺课可跟下一期补，全部正课提供录播回放。"
      },
      {
        "id": "faq-3",
        "question": "海外社媒运营专员就业班要学多久？上课形式是什么？",
        "answer": "海外社媒运营专员就业班学习周期为18天全链路实操，以线下直营校区小班面授为主，导师手把手实操指导；配套线上精品录播、直播复盘与课后答疑。广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课。"
      },
      {
        "id": "faq-4",
        "question": "学完海外社媒运营专员就业班就业怎么处理？",
        "answer": "我们不承诺\"包就业\"或\"100%安排上岗\"（这类表述涉嫌违反广告法），但提供合同化的就业服务清单：简历诊断≥2次、模拟面试≥2轮、企业内推、作品集指导至通过验收、结业后五年内不限次就业推荐。"
      },
      {
        "id": "faq-5",
        "question": "如何预约海外社媒运营专员就业班试听？",
        "answer": "可拨打全国统一服务热线400-800-4459（每天8:00-23:00）、在官网填写免费试听表单，或直接到访就近校区。课程顾问会安排1节正课试听，并输出《个人学习规划书》。"
      }
    ],
    "seo": {
      "title": "海外社媒运营专员就业班_18天全链路实操 - 美迪时代教育",
      "description": "海外社媒运营专员就业班：全案操盘实操，独立站、海外社媒与高阶投流三位一体，18天系统培养。学习周期18天全链路实操，学费13800元（明码标价、无隐形消费），广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课，咨询热线400-800-4459。",
      "keywords": "海外社媒运营专员就业班,海外社媒运营培训,独立站运营培训,海外短视频运营专员培训,跨境电商社媒培训"
    }
  }
];
