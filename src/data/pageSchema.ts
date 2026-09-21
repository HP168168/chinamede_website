// 页面级 JSON-LD 结构化数据 - 由旧站各页面 <script type="application/ld+json"> 抽取生成
// 已剔除全站共享的 Organization / WebSite / 校区节点（它们由 Schema.astro 统一生成）。
// 键为页面路由，值为该页独有的结构化数据节点数组。
/* eslint-disable @typescript-eslint/no-explicit-any */
export const pageSchema: Record<string, any[]> = {
  "/": [
    {
      "@type": "WebPage",
      "@id": "https://www.chinamede.com/#webpage",
      "url": "https://www.chinamede.com/",
      "name": "美迪时代教育官网_成人职业技能就业培训_6城13校区",
      "description": "美迪时代教育（广州美迪教育科技有限公司）专注成人职业技能就业培训15年，在广州、深圳、佛山、东莞、中山、江门设有13个直营校区，开设AI新媒体运营、AI视觉设计、商业短视频、AIGC、AI短剧漫剧、跨境电商等就业班，长期班标配22天带薪实习与五年就业推荐，免费试听热线400-800-4459。",
      "publisher": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "inLanguage": "zh-CN",
      "about": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "mainEntity": {
        "@type": "ItemList",
        "@id": "https://www.chinamede.com/#hotcourses",
        "name": "美迪时代教育热门就业课程",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "url": "https://www.chinamede.com/courses/n1-ai-newmedia/",
            "name": "AI新媒体运营师"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "url": "https://www.chinamede.com/courses/n2-ai-visual-design/",
            "name": "AI视觉设计师"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "url": "https://www.chinamede.com/courses/n3-short-video/",
            "name": "商业短视频创作师"
          },
          {
            "@type": "ListItem",
            "position": 4,
            "url": "https://www.chinamede.com/courses/n6-amazon/",
            "name": "跨境电商实战班"
          },
          {
            "@type": "ListItem",
            "position": 5,
            "url": "https://www.chinamede.com/courses/n5-ai-drama/",
            "name": "AI短剧漫剧创作师"
          },
          {
            "@type": "ListItem",
            "position": 6,
            "url": "https://www.chinamede.com/courses/n4-aigc/",
            "name": "AIGC全能就业班"
          }
        ]
      },
      "datePublished": "2026-09-17",
      "dateModified": "2026-09-18"
    }
  ],
  "/brand/": [
    {
      "@type": "WebPage",
      "@id": "https://www.chinamede.com/brand/#webpage",
      "url": "https://www.chinamede.com/brand/",
      "name": "品牌介绍_关于美迪时代教育_15年数字化职业人才培养机构",
      "inLanguage": "zh-CN",
      "isPartOf": {
        "@id": "https://www.chinamede.com/#website"
      },
      "about": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "datePublished": "2026-09-17",
      "dateModified": "2026-09-18"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.chinamede.com/brand/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://www.chinamede.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "品牌介绍"
        }
      ]
    },
    {
      "@type": "AboutPage",
      "@id": "https://www.chinamede.com/brand/#webpage",
      "name": "品牌介绍_关于美迪时代教育_15年数字化职业人才培养机构",
      "description": "了解美迪时代教育：隶属广州美迪教育科技有限公司，2011年创立，300余人专业团队，6城13个直营校区，一站式职业人才培养解决方案，品牌故事、企业文化与核心优势全解析。",
      "publisher": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "inLanguage": "zh-CN",
      "about": {
        "@id": "https://www.chinamede.com/#organization"
      }
    }
  ],
  "/business/": [
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.chinamede.com/business/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://www.chinamede.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "商业资讯"
        }
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://www.chinamede.com/business/#webpage",
      "name": "商业资讯_新媒体短视频跨境电商行业洞察 - 美迪时代教育",
      "description": "美迪时代教育商业资讯频道：新媒体、短视频、短剧、跨境电商、AIGC行业洞察与就业趋势分析，帮助学员看清行业方向、把握职业机会。",
      "publisher": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "inLanguage": "zh-CN",
      "datePublished": "2026-09-17",
      "dateModified": "2026-09-18"
    }
  ],
  "/contact/": [
    {
      "@type": "WebPage",
      "@id": "https://www.chinamede.com/contact/#webpage",
      "url": "https://www.chinamede.com/contact/",
      "name": "联系我们_6城13个直营校区 - 美迪时代教育",
      "inLanguage": "zh-CN",
      "isPartOf": {
        "@id": "https://www.chinamede.com/#website"
      },
      "about": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "datePublished": "2026-09-17",
      "dateModified": "2026-09-18"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.chinamede.com/contact/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://www.chinamede.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "联系我们"
        }
      ]
    },
    {
      "@type": "ContactPage",
      "@id": "https://www.chinamede.com/contact/#webpage",
      "name": "联系我们_6城13个直营校区 - 美迪时代教育",
      "description": "美迪时代教育联系入口：广州、深圳、佛山、东莞、中山、江门13个直营校区的地址、电话与交通指引全公开，免费试听预约与职业规划咨询请拨打400-800-4459（每天8:00-23:00）。",
      "publisher": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "inLanguage": "zh-CN",
      "mainEntity": {
        "@type": "ContactPoint",
        "@id": "https://www.chinamede.com/#contactpoint",
        "telephone": "400-800-4459",
        "contactType": "招生咨询",
        "areaServed": "CN",
        "availableLanguage": [
          "zh-CN"
        ],
        "hoursAvailable": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
          ],
          "opens": "09:00",
          "closes": "21:00"
        }
      }
    }
  ],
  "/courses/": [
    {
      "@type": "WebPage",
      "@id": "https://www.chinamede.com/courses/#webpage",
      "url": "https://www.chinamede.com/courses/",
      "name": "培训课程_AI新媒体_视觉设计_短视频 - 美迪时代教育",
      "inLanguage": "zh-CN",
      "isPartOf": {
        "@id": "https://www.chinamede.com/#website"
      },
      "about": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "datePublished": "2026-09-17",
      "dateModified": "2026-09-18"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.chinamede.com/courses/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://www.chinamede.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "培训课程"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://www.chinamede.com/courses/#courselist",
      "name": "美迪时代教育就业班型",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@id": "https://www.chinamede.com/courses/n1-ai-newmedia/#course"
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@id": "https://www.chinamede.com/courses/n2-ai-visual-design/#course"
          }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@id": "https://www.chinamede.com/courses/n3-short-video/#course"
          }
        },
        {
          "@type": "ListItem",
          "position": 4,
          "item": {
            "@id": "https://www.chinamede.com/courses/n4-aigc/#course"
          }
        },
        {
          "@type": "ListItem",
          "position": 5,
          "item": {
            "@id": "https://www.chinamede.com/courses/n5-ai-drama/#course"
          }
        },
        {
          "@type": "ListItem",
          "position": 6,
          "item": {
            "@id": "https://www.chinamede.com/courses/n6-amazon/#course"
          }
        },
        {
          "@type": "ListItem",
          "position": 7,
          "item": {
            "@id": "https://www.chinamede.com/courses/n7-tiktok/#course"
          }
        },
        {
          "@type": "ListItem",
          "position": 8,
          "item": {
            "@id": "https://www.chinamede.com/courses/n8-overseas-smm/#course"
          }
        }
      ]
    },
    {
      "@type": "Course",
      "@id": "https://www.chinamede.com/courses/n1-ai-newmedia/#course",
      "name": "N1 · AI新媒体运营师就业班",
      "url": "https://www.chinamede.com/courses/n1-ai-newmedia/#course",
      "description": "聚焦AI时代企业获客刚需，将「推荐流量与AI流量获客实战」做成正式课程模块，50天线下集训 + 22天带薪岗位实习 · 288课时，训练强度为线上训练营类竞品2-3倍，22天带薪实习闭环独有。",
      "provider": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "courseMode": "线下小班面授",
      "inLanguage": "zh-CN",
      "timeRequired": "P50D",
      "teaches": [
        "AI工具应用",
        "手机拍摄剪辑",
        "短视频拍摄剪辑高级",
        "抖音运营",
        "小红书运营",
        "视频号运营",
        "AI数字人获客",
        "抖音获客引流",
        "企业AI获客GEO实战",
        "岗前实战",
        "就业指导"
      ],
      "offers": {
        "@type": "Offer",
        "price": "13800",
        "priceCurrency": "CNY",
        "availability": "https://schema.org/InStock",
        "url": "https://www.chinamede.com/courses/n1-ai-newmedia/#course"
      },
      "location": [
        {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-kecun"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-huashi"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-nanzhou"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-wuhe"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-ailian"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-fuyong"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-dongcheng"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-houjie"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-ronggui"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-zumiao"
        },
        {
          "@id": "https://www.chinamede.com/#campus-jm-jianghai"
        },
        {
          "@id": "https://www.chinamede.com/#campus-zs-xiaolan"
        }
      ],
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "线下小班面授",
        "inLanguage": "zh-CN",
        "location": {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        }
      }
    },
    {
      "@type": "Course",
      "@id": "https://www.chinamede.com/courses/n2-ai-visual-design/#course",
      "name": "N2 · AI视觉设计师就业班",
      "url": "https://www.chinamede.com/courses/n2-ai-visual-design/#course",
      "description": "聚焦AI与视觉设计复合技能，50天学习 + 22天带薪实习，四阶段打造「设计功底 + AIGC电商视觉」双能力，毕业即带商用作品集。",
      "provider": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "courseMode": "线下小班面授",
      "inLanguage": "zh-CN",
      "timeRequired": "P50D",
      "educationalCredentialAwarded": "AIGC视觉认证",
      "teaches": [
        "电商美工设计",
        "高级美工实战",
        "商业图片精修",
        "C4D电商运用",
        "AI工具应用赋能",
        "电商AI设计",
        "电商AI视频创作",
        "AI电商设计师岗前实战",
        "就业指导"
      ],
      "offers": {
        "@type": "Offer",
        "price": "15800",
        "priceCurrency": "CNY",
        "availability": "https://schema.org/InStock",
        "url": "https://www.chinamede.com/courses/n2-ai-visual-design/#course"
      },
      "location": [
        {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-kecun"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-huashi"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-nanzhou"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-wuhe"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-ailian"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-fuyong"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-dongcheng"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-houjie"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-ronggui"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-zumiao"
        },
        {
          "@id": "https://www.chinamede.com/#campus-jm-jianghai"
        },
        {
          "@id": "https://www.chinamede.com/#campus-zs-xiaolan"
        }
      ],
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "线下小班面授",
        "inLanguage": "zh-CN",
        "location": {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        }
      }
    },
    {
      "@type": "Course",
      "@id": "https://www.chinamede.com/courses/n3-short-video/#course",
      "name": "N3 · 商业短视频就业班",
      "url": "https://www.chinamede.com/courses/n3-short-video/#course",
      "description": "针对AI浪潮下复合型人才缺口，48天学习 + 22天带薪实习，四阶段闭环培养「拍摄剪辑 → 高级创作 → 运营推广 → 岗前实战」全能型短视频人才。",
      "provider": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "courseMode": "线下小班面授",
      "inLanguage": "zh-CN",
      "timeRequired": "P48D",
      "educationalCredentialAwarded": "巨量学/行业专业认证",
      "teaches": [
        "手机拍摄剪辑",
        "短视频拍摄剪辑高级",
        "电商AI视频创作",
        "短视频特效合成",
        "抖音短视频运营",
        "抖音获客引流实战",
        "商业短视频项目运营实战",
        "就业指导实战"
      ],
      "offers": {
        "@type": "Offer",
        "price": "15800",
        "priceCurrency": "CNY",
        "availability": "https://schema.org/InStock",
        "url": "https://www.chinamede.com/courses/n3-short-video/#course"
      },
      "location": [
        {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-kecun"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-huashi"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-nanzhou"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-wuhe"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-ailian"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-fuyong"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-dongcheng"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-houjie"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-ronggui"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-zumiao"
        },
        {
          "@id": "https://www.chinamede.com/#campus-jm-jianghai"
        },
        {
          "@id": "https://www.chinamede.com/#campus-zs-xiaolan"
        }
      ],
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "线下小班面授",
        "inLanguage": "zh-CN",
        "location": {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        }
      }
    },
    {
      "@type": "Course",
      "@id": "https://www.chinamede.com/courses/n4-aigc/#course",
      "name": "N4 · AIGC全能实战班",
      "url": "https://www.chinamede.com/courses/n4-aigc/#course",
      "description": "89天学习 + 22天带薪实习，六大阶段全链路覆盖「AI工具 → 视频生成 → 新媒体运营 → 设计 → 岗前实战 → 就业实习」，一站式打造AIGC复合型人才。",
      "provider": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "courseMode": "线下小班面授",
      "inLanguage": "zh-CN",
      "timeRequired": "P89D",
      "teaches": [
        "AI工具使用应用",
        "AI自媒体副业",
        "手机拍摄剪辑",
        "短视频高级剪辑",
        "电商AI视频创作",
        "抖音运营",
        "抖音获客引流",
        "AI智能体开发",
        "企业AI获客GEO训练营",
        "电商美工",
        "商业图片精修",
        "C4D电商运用",
        "电商AI设计",
        "电商设计师岗前实战",
        "新媒体运营师岗前实战",
        "就业指导实战"
      ],
      "offers": {
        "@type": "Offer",
        "price": "22800",
        "priceCurrency": "CNY",
        "availability": "https://schema.org/InStock",
        "url": "https://www.chinamede.com/courses/n4-aigc/#course"
      },
      "location": [
        {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-kecun"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-huashi"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-nanzhou"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-wuhe"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-ailian"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-fuyong"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-dongcheng"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-houjie"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-ronggui"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-zumiao"
        },
        {
          "@id": "https://www.chinamede.com/#campus-jm-jianghai"
        },
        {
          "@id": "https://www.chinamede.com/#campus-zs-xiaolan"
        }
      ],
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "线下小班面授",
        "inLanguage": "zh-CN",
        "location": {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        }
      }
    },
    {
      "@type": "Course",
      "@id": "https://www.chinamede.com/courses/n5-ai-drama/#course",
      "name": "N5 · AI短剧漫剧就业班",
      "url": "https://www.chinamede.com/courses/n5-ai-drama/#course",
      "description": "27天学习 + 22天带薪实习，从剧本到成片全链路实操，主打「最新AI视频工具矩阵 + 短剧漫剧商业变现能力」。",
      "provider": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "courseMode": "线下小班面授",
      "inLanguage": "zh-CN",
      "timeRequired": "P27D",
      "teaches": [
        "AI工具应用赋能",
        "AI剪映影视创作",
        "AI漫剧训练营",
        "AI真人剧训练营",
        "创作师岗前实战",
        "就业指导实战"
      ],
      "offers": {
        "@type": "Offer",
        "price": "12800",
        "priceCurrency": "CNY",
        "availability": "https://schema.org/InStock",
        "url": "https://www.chinamede.com/courses/n5-ai-drama/#course"
      },
      "location": [
        {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-kecun"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-huashi"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-nanzhou"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-wuhe"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-ailian"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-fuyong"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-dongcheng"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-houjie"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-ronggui"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-zumiao"
        },
        {
          "@id": "https://www.chinamede.com/#campus-jm-jianghai"
        },
        {
          "@id": "https://www.chinamede.com/#campus-zs-xiaolan"
        }
      ],
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "线下小班面授",
        "inLanguage": "zh-CN",
        "location": {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        }
      }
    },
    {
      "@type": "Course",
      "@id": "https://www.chinamede.com/courses/n6-amazon/#course",
      "name": "N6 · 亚马逊就业班",
      "url": "https://www.chinamede.com/courses/n6-amazon/#course",
      "description": "27天学习 + 22天实习，聚焦亚马逊跨境运营人才短缺，主打「AI辅助全流程运营」与真实店铺实操，依托美迪15年跨境电商服务商基因，毕业即具备独立操盘与爆款打造能力。",
      "provider": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "courseMode": "线下小班面授",
      "inLanguage": "zh-CN",
      "timeRequired": "P27D",
      "teaches": [
        "亚马逊运营推广",
        "亚马逊AI高阶运营",
        "亚马逊实训",
        "就业指导实战"
      ],
      "offers": {
        "@type": "Offer",
        "price": "13800",
        "priceCurrency": "CNY",
        "availability": "https://schema.org/InStock",
        "url": "https://www.chinamede.com/courses/n6-amazon/#course"
      },
      "location": [
        {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-kecun"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-huashi"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-nanzhou"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-wuhe"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-ailian"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-fuyong"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-dongcheng"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-houjie"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-ronggui"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-zumiao"
        },
        {
          "@id": "https://www.chinamede.com/#campus-jm-jianghai"
        },
        {
          "@id": "https://www.chinamede.com/#campus-zs-xiaolan"
        }
      ],
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "线下小班面授",
        "inLanguage": "zh-CN",
        "location": {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        }
      }
    },
    {
      "@type": "Course",
      "@id": "https://www.chinamede.com/courses/n7-tiktok/#course",
      "name": "N7 · TikTok就业班",
      "url": "https://www.chinamede.com/courses/n7-tiktok/#course",
      "description": "7天短周期高强度锻造，真实TikTok账号全流程实操（三阶段114课时），从选品运营、拍摄剪辑到广告投流与复盘一次打通，打造出海内容与电商复合型人才。",
      "provider": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "courseMode": "线下小班面授",
      "inLanguage": "zh-CN",
      "timeRequired": "P7D",
      "teaches": [
        "TikTok短视频营销",
        "TikTok小店实战",
        "手机拍摄剪辑",
        "TikTok实训",
        "就业指导实战"
      ],
      "offers": {
        "@type": "Offer",
        "price": "10800",
        "priceCurrency": "CNY",
        "availability": "https://schema.org/InStock",
        "url": "https://www.chinamede.com/courses/n7-tiktok/#course"
      },
      "location": [
        {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-kecun"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-huashi"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-nanzhou"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-wuhe"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-ailian"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-fuyong"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-dongcheng"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-houjie"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-ronggui"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-zumiao"
        },
        {
          "@id": "https://www.chinamede.com/#campus-jm-jianghai"
        },
        {
          "@id": "https://www.chinamede.com/#campus-zs-xiaolan"
        }
      ],
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "线下小班面授",
        "inLanguage": "zh-CN",
        "location": {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        }
      }
    },
    {
      "@type": "Course",
      "@id": "https://www.chinamede.com/courses/n8-overseas-smm/#course",
      "name": "N8 · 海外社媒运营专员就业班",
      "url": "https://www.chinamede.com/courses/n8-overseas-smm/#course",
      "description": "18天系统化培养（三阶段120课时）「懂策划、擅内容、精投放」的海外社媒复合型人才，深度覆盖独立站、Instagram、Facebook全平台，实战打通出海全流程获客闭环。",
      "provider": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "courseMode": "线下小班面授",
      "inLanguage": "zh-CN",
      "timeRequired": "P18D",
      "teaches": [
        "独立站运营推广",
        "海外社媒运营实战",
        "Facebook高阶投流获客实战",
        "手机拍摄剪辑",
        "海外社媒实训",
        "就业指导实战"
      ],
      "offers": {
        "@type": "Offer",
        "price": "13800",
        "priceCurrency": "CNY",
        "availability": "https://schema.org/InStock",
        "url": "https://www.chinamede.com/courses/n8-overseas-smm/#course"
      },
      "location": [
        {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-kecun"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-huashi"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-nanzhou"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-wuhe"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-ailian"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-fuyong"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-dongcheng"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-houjie"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-ronggui"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-zumiao"
        },
        {
          "@id": "https://www.chinamede.com/#campus-jm-jianghai"
        },
        {
          "@id": "https://www.chinamede.com/#campus-zs-xiaolan"
        }
      ],
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "线下小班面授",
        "inLanguage": "zh-CN",
        "location": {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        }
      }
    }
  ],
  "/enroll/": [
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.chinamede.com/enroll/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://www.chinamede.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "免费试听"
        }
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://www.chinamede.com/enroll/#webpage",
      "name": "免费试听_课程试听预约_职业规划咨询 - 美迪时代教育",
      "description": "预约美迪时代教育免费试听课程、获取职业学习规划书、咨询课程学费与班型，支持广州、深圳、佛山、东莞、中山、江门13个校区就近上课，报名热线400-800-4459。",
      "publisher": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "inLanguage": "zh-CN",
      "datePublished": "2026-09-17",
      "dateModified": "2026-09-18"
    }
  ],
  "/faq/": [
    {
      "@type": "WebPage",
      "@id": "https://www.chinamede.com/faq/#webpage",
      "url": "https://www.chinamede.com/faq/",
      "name": "常见问题解答_学费多少_能否退费_零基础能学吗 - 美迪时代教育",
      "inLanguage": "zh-CN",
      "isPartOf": {
        "@id": "https://www.chinamede.com/#website"
      },
      "about": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "datePublished": "2026-09-17",
      "dateModified": "2026-09-18"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.chinamede.com/faq/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://www.chinamede.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "美迪问答"
        }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.chinamede.com/faq/#faq",
      "name": "美迪问答",
      "description": "关于课程、就业、学费、校区的常见问题解答",
      "inLanguage": "zh-CN",
      "publisher": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "mainEntity": [
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/faq/#faq-1",
          "url": "https://www.chinamede.com/faq/#faq-1",
          "name": "美迪时代教育是什么机构？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "美迪时代教育隶属于广州美迪教育科技有限公司，是集团旗下专注成人职业技能就业培训的核心品牌。自2011年成立以来，我们致力于成为广大成人学习者与用人企业可信赖的职业成长伙伴，构建涵盖职业教育、在线教育、职业考证、学历提升、人才对接、项目实训、就业帮扶的一站式职业人才培养解决方案。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/faq/#faq-2",
          "url": "https://www.chinamede.com/faq/#faq-2",
          "name": "课程适合零基础学员吗？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "非常适合。美迪时代的课程体系采用“理论夯实+项目实操+就业实训”的双向教学模式，从零基础开始循序渐进，全程对标企业真实岗位工作场景。无论您是在职提升、转行求职还是待业学习，都能找到适合的班型。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/faq/#faq-3",
          "url": "https://www.chinamede.com/faq/#faq-3",
          "name": "上课形式是什么？线上还是线下？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "我们以线下直营校区实景实训为主，导师手把手实操指导，小班精细化辅导；同时配套线上精品录播、直播复盘、专属资料库、课后答疑等服务，方便学员课后巩固技能、查漏补缺、反复研习。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/faq/#faq-4",
          "url": "https://www.chinamede.com/faq/#faq-4",
          "name": "22天带薪实习是真的吗？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "是的。长期班标配22天岗位实习，实习期间提供1000元基础补贴+绩效提成，具体发放规则写入实习协议。实习岗位来自美迪时代自有电商/跨境业务与合作企业，学员在实习期间参与真实商业项目，积累作品集与实战经验。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/faq/#faq-5",
          "url": "https://www.chinamede.com/faq/#faq-5",
          "name": "学费是多少？有没有隐形消费？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "美迪时代官网明码标价，杜绝隐形消费。五大AI长期班价格在12800-15800元之间（N4全能班22800元），跨境短期班价格在10800-13800元之间。所有费用在报名前清晰告知，包含课程、教材、实训、实习、就业指导等核心服务。我们也提供官方免息分期与“先就业后付尾款”选项。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/faq/#faq-6",
          "url": "https://www.chinamede.com/faq/#faq-6",
          "name": "学完能保证就业吗？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "我们不承诺“包就业”或“100%安排上岗”（这类表述涉嫌违反广告法），但提供合同化的就业服务清单：包括简历诊断≥2次、模拟面试≥2轮、企业内推≥N家次、作品集指导至通过验收、结业后五年内不限次就业推荐。我们按期公示就业数据，用可验证的交付替代空口承诺。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/faq/#faq-7",
          "url": "https://www.chinamede.com/faq/#faq-7",
          "name": "证书是怎么安排的？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "不同班型匹配不同认证：N1新媒体运营班可考取人社部教培中心新媒体运营方向或工信部AIGC应用类证书；N2视觉设计班匹配AIGC视觉/艺术设计师认证；N3短视频班匹配巨量学短视频运营岗位认证；N4全能班打包AIGC认证+岗位认证+结业证书。认证考试费打包在课程中，感知价值高、学员成本低。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/faq/#faq-8",
          "url": "https://www.chinamede.com/faq/#faq-8",
          "name": "校区有哪些？可以就近学习吗？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "美迪在粤港澳大湾区核心城市开设6城13个直营校区，包括广州、深圳、佛山、东莞、中山、江门。学员可就近选择校区学习，享受本地化教学与属地企业就业资源对接。具体校区地址可拨打400-800-4459咨询。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/faq/#faq-9",
          "url": "https://www.chinamede.com/faq/#faq-9",
          "name": "学不会怎么办？有补课和答疑支持吗？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "可以。美迪提供补课机制、课后答疑、录播回放等长效学习支持：缺课可跟随下期班次补课，课堂未掌握的内容可课后一对一答疑，全部正课提供录播回放便于反复巩固。学习进度落后的学员，班主任会同步调整学习计划，跟进到掌握为止。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/faq/#faq-10",
          "url": "https://www.chinamede.com/faq/#faq-10",
          "name": "中途不想学了可以退费吗？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "可以。我们严格执行合同约定的分段退费公式：开课前可全额退费；开课后按未消耗课时+已发生服务成本退费，审批≤15个工作日。退费流程5个节点短信同步学员，流程透明可查，对冲行业“退费难”痛点。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/faq/#faq-11",
          "url": "https://www.chinamede.com/faq/#faq-11",
          "name": "项目实训创收是真的能赚钱吗？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "项目实训创收是美迪时代的特色服务。我们承接企业正规商业外包项目，搭建学员实训接单平台，学员在岗前实训阶段可匹配自身技能承接商业订单。但我们会如实公示派单池四要素（合作方、月均单量、价格区间、结款周期），不会承诺“接单躺赚”或“月入过万”。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/faq/#faq-12",
          "url": "https://www.chinamede.com/faq/#faq-12",
          "name": "如何预约试听？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "您可以通过以下方式预约免费试听：拨打全国统一服务热线400-800-4459；在官网填写咨询表单；或直接到访就近校区。课程顾问会为您安排1节正课试听，并输出《个人学习规划书》。"
          }
        }
      ]
    }
  ],
  "/industry/": [
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.chinamede.com/industry/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://www.chinamede.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "产教融合"
        }
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://www.chinamede.com/industry/#webpage",
      "name": "产教融合_校企合作_企业定制化人才培养 - 美迪时代教育",
      "description": "美迪时代教育产教融合服务体系：校企共建实训基地、企业定制化人才培养、团队技能培训、项目外包合作，为企业输送实战型数字化技能人才。",
      "publisher": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "inLanguage": "zh-CN",
      "datePublished": "2026-09-17",
      "dateModified": "2026-09-18"
    }
  ],
  "/knowledge/": [
    {
      "@type": "WebPage",
      "@id": "https://www.chinamede.com/knowledge/#webpage",
      "url": "https://www.chinamede.com/knowledge/",
      "name": "知识百科_职业技能学习指南_转行攻略 - 美迪时代教育",
      "inLanguage": "zh-CN",
      "isPartOf": {
        "@id": "https://www.chinamede.com/#website"
      },
      "about": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "datePublished": "2026-09-17",
      "dateModified": "2026-09-18"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.chinamede.com/knowledge/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://www.chinamede.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "知识百科"
        }
      ]
    },
    {
      "@type": "CollectionPage",
      "@id": "https://www.chinamede.com/knowledge/#webpage",
      "name": "知识百科_职业技能学习指南_转行攻略 - 美迪时代教育",
      "description": "美迪时代教育知识百科：新媒体运营、视觉设计、短视频、AIGC、GEO、跨境电商等职业技能学习指南与行业术语百科，零基础转行攻略与自学路线持续更新。",
      "publisher": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "inLanguage": "zh-CN",
      "mainEntity": {
        "@type": "ItemList",
        "@id": "https://www.chinamede.com/knowledge/#guidelist",
        "name": "美迪时代教育职业技能学习指南",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "url": "https://www.chinamede.com/knowledge/guide-newmedia/",
            "name": "零基础转行新媒体运营全攻略：从月薪3千到月薪过万的完整路径"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "url": "https://www.chinamede.com/knowledge/guide-geo/",
            "name": "什么是GEO？AI搜索时代企业与个人必须掌握的获客新打法"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "url": "https://www.chinamede.com/knowledge/guide-shortvideo/",
            "name": "2026短视频与短剧行业就业前景分析：普通人还有机会吗？"
          }
        ]
      }
    }
  ],
  "/news/": [
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.chinamede.com/news/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://www.chinamede.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "机构动态"
        }
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://www.chinamede.com/news/#webpage",
      "name": "机构动态_校区活动_课程升级_官方新闻 - 美迪时代教育",
      "description": "美迪时代教育官方动态：最新课程升级、校区活动、就业数据、企业合作与品牌荣誉第一手资讯。",
      "publisher": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "inLanguage": "zh-CN",
      "datePublished": "2026-09-17",
      "dateModified": "2026-09-18"
    }
  ],
  "/students/": [
    {
      "@type": "WebPage",
      "@id": "https://www.chinamede.com/students/#webpage",
      "url": "https://www.chinamede.com/students/",
      "name": "学员风采_就业学员案例_学生活动_学员作品展示 - 美迪时代教育",
      "inLanguage": "zh-CN",
      "isPartOf": {
        "@id": "https://www.chinamede.com/#website"
      },
      "about": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "datePublished": "2026-09-17",
      "dateModified": "2026-09-18"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.chinamede.com/students/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://www.chinamede.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "学员风采"
        }
      ]
    },
    {
      "@type": "CollectionPage",
      "@id": "https://www.chinamede.com/students/#webpage",
      "name": "学员风采_就业学员案例_学生活动_学员作品展示 - 美迪时代教育",
      "description": "美迪时代教育学员真实故事：零基础转行就业案例、学员作品集展示、校区学生活动，见证从学习到上岗的成长历程与就业成果，覆盖广州、深圳、佛山、东莞、中山、江门13个校区。",
      "publisher": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "inLanguage": "zh-CN"
    }
  ],
  "/teachers/": [
    {
      "@type": "WebPage",
      "@id": "https://www.chinamede.com/teachers/#webpage",
      "url": "https://www.chinamede.com/teachers/",
      "name": "师资团队_一线实战派讲师_三师制教学模式 - 美迪时代教育",
      "inLanguage": "zh-CN",
      "isPartOf": {
        "@id": "https://www.chinamede.com/#website"
      },
      "about": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "datePublished": "2026-09-17",
      "dateModified": "2026-09-18"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.chinamede.com/teachers/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://www.chinamede.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "师资团队"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://www.chinamede.com/teachers/#teacherlist",
      "name": "美迪时代教育核心讲师团队",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@id": "https://www.chinamede.com/#teacher-zhangmingyuan"
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@id": "https://www.chinamede.com/#teacher-lisiqi"
          }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@id": "https://www.chinamede.com/#teacher-wanghaoran"
          }
        },
        {
          "@type": "ListItem",
          "position": 4,
          "item": {
            "@id": "https://www.chinamede.com/#teacher-chenyutong"
          }
        },
        {
          "@type": "ListItem",
          "position": 5,
          "item": {
            "@id": "https://www.chinamede.com/#teacher-liuzixuan"
          }
        },
        {
          "@type": "ListItem",
          "position": 6,
          "item": {
            "@id": "https://www.chinamede.com/#teacher-zhaoyalin"
          }
        },
        {
          "@type": "ListItem",
          "position": 7,
          "item": {
            "@id": "https://www.chinamede.com/#teacher-zhoujianguo"
          }
        },
        {
          "@type": "ListItem",
          "position": 8,
          "item": {
            "@id": "https://www.chinamede.com/#teacher-wuwenjing"
          }
        }
      ]
    },
    {
      "@type": "Person",
      "@id": "https://www.chinamede.com/#teacher-zhangmingyuan",
      "name": "张明远",
      "jobTitle": "AI新媒体运营学科带头人",
      "description": "10年新媒体运营与获客经验，曾操盘多个百万级账号，擅长抖音、小红书、视频号全平台运营与企业GEO获客实战。",
      "worksFor": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "knowsAbout": [
        "新媒体运营",
        "抖音运营",
        "小红书运营",
        "视频号运营",
        "企业GEO获客"
      ]
    },
    {
      "@type": "Person",
      "@id": "https://www.chinamede.com/#teacher-lisiqi",
      "name": "李思琪",
      "jobTitle": "AI视觉设计金牌讲师",
      "description": "8年电商视觉设计经验，服务过多个知名电商品牌，精通C4D、PS精修、AIGC商业出图与品牌IP延展设计。",
      "worksFor": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "knowsAbout": [
        "电商视觉设计",
        "C4D",
        "商业图片精修",
        "AIGC商业出图",
        "品牌IP设计"
      ]
    },
    {
      "@type": "Person",
      "@id": "https://www.chinamede.com/#teacher-wanghaoran",
      "name": "王浩然",
      "jobTitle": "商业短视频创作负责人",
      "description": "前MCN内容总监，主导过数百条商业短视频项目，擅长拍摄剪辑、特效合成、信息流广告与商单履约全流程。",
      "worksFor": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "knowsAbout": [
        "短视频拍摄剪辑",
        "特效合成",
        "信息流广告",
        "商业短视频项目运营"
      ]
    },
    {
      "@type": "Person",
      "@id": "https://www.chinamede.com/#teacher-chenyutong",
      "name": "陈雨桐",
      "jobTitle": "AIGC全能班主讲",
      "description": "深耕AI工具应用与智能体开发，熟悉Coze、Dify等平台，擅长将AI能力落地到运营、设计、视频等真实工作场景。",
      "worksFor": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "knowsAbout": [
        "AI工具应用",
        "AI智能体开发",
        "Coze",
        "Dify",
        "AIGC商业落地"
      ]
    },
    {
      "@type": "Person",
      "@id": "https://www.chinamede.com/#teacher-liuzixuan",
      "name": "刘子轩",
      "jobTitle": "AI短剧漫剧创作导师",
      "description": "参与多部短剧/漫剧项目制作，熟悉AI漫剧、AI真人剧全流程，掌握短剧备案合规、投流分账与平台征稿通道。",
      "worksFor": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "knowsAbout": [
        "AI漫剧创作",
        "AI真人短剧",
        "短剧备案合规",
        "投流分账"
      ]
    },
    {
      "@type": "Person",
      "@id": "https://www.chinamede.com/#teacher-zhaoyalin",
      "name": "赵雅琳",
      "jobTitle": "跨境电商实战讲师",
      "description": "10年跨境电商运营经验，操盘过亚马逊、TikTok、独立站等多平台项目，擅长海外社媒运营与Facebook高阶投流。",
      "worksFor": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "knowsAbout": [
        "亚马逊运营",
        "TikTok运营",
        "独立站运营",
        "海外社媒运营",
        "Facebook投流"
      ]
    },
    {
      "@type": "Person",
      "@id": "https://www.chinamede.com/#teacher-zhoujianguo",
      "name": "周建国",
      "jobTitle": "就业指导总监",
      "description": "负责学员就业服务体系建设，对接全国合作企业资源，擅长简历诊断、模拟面试、岗位匹配与职场发展规划。",
      "worksFor": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "knowsAbout": [
        "简历诊断",
        "模拟面试",
        "岗位匹配",
        "职业规划"
      ]
    },
    {
      "@type": "Person",
      "@id": "https://www.chinamede.com/#teacher-wuwenjing",
      "name": "吴文静",
      "jobTitle": "教学督导负责人",
      "description": "负责教学质量监控与讲师评级，通过随堂听课、学员期评、模块通过率等数据，持续优化教学标准与服务体验。",
      "worksFor": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "knowsAbout": [
        "教学质量监控",
        "讲师评级",
        "教学标准制定"
      ]
    }
  ],
  "/courses/n1-ai-newmedia/": [
    {
      "@type": "WebPage",
      "@id": "https://www.chinamede.com/courses/n1-ai-newmedia/#webpage",
      "url": "https://www.chinamede.com/courses/n1-ai-newmedia/",
      "name": "AI新媒体运营师就业班_50天+22天带薪实习 - 美迪时代教育",
      "description": "AI新媒体运营师就业班：聚焦AI时代企业获客刚需，50天线下集训·288课时，推荐流量与AI流量获客实战成体系教学。学习周期50天 + 22天带薪实习，学费13800元（明码标价、无隐形消费），广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课，咨询热线400-800-4459。",
      "inLanguage": "zh-CN",
      "isPartOf": {
        "@id": "https://www.chinamede.com/#website"
      },
      "about": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "datePublished": "2026-09-18",
      "dateModified": "2026-09-18"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.chinamede.com/courses/n1-ai-newmedia/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://www.chinamede.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "培训课程",
          "item": "https://www.chinamede.com/courses/"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "AI新媒体运营师就业班"
        }
      ]
    },
    {
      "@type": "Course",
      "@id": "https://www.chinamede.com/courses/n1-ai-newmedia/#course",
      "name": "N1 · AI新媒体运营师就业班",
      "url": "https://www.chinamede.com/courses/n1-ai-newmedia/",
      "description": "聚焦AI时代企业获客刚需，将「推荐流量与AI流量获客实战」做成正式课程模块，50天线下集训 + 22天带薪岗位实习 · 288课时，训练强度为线上训练营类竞品2-3倍，22天带薪实习闭环独有。",
      "provider": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "courseMode": "线下小班面授",
      "inLanguage": "zh-CN",
      "timeRequired": "P50D",
      "teaches": [
        "AI工具应用",
        "手机拍摄剪辑",
        "短视频拍摄剪辑高级",
        "抖音运营",
        "小红书运营",
        "视频号运营",
        "AI数字人获客",
        "抖音获客引流",
        "企业AI获客GEO实战",
        "岗前实战",
        "就业指导"
      ],
      "offers": {
        "@type": "Offer",
        "price": "13800",
        "priceCurrency": "CNY",
        "availability": "https://schema.org/InStock",
        "url": "https://www.chinamede.com/courses/#n1"
      },
      "location": [
        {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-kecun"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-huashi"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-nanzhou"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-wuhe"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-ailian"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-fuyong"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-dongcheng"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-houjie"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-ronggui"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-zumiao"
        },
        {
          "@id": "https://www.chinamede.com/#campus-jm-jianghai"
        },
        {
          "@id": "https://www.chinamede.com/#campus-zs-xiaolan"
        }
      ],
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "线下小班面授",
        "inLanguage": "zh-CN",
        "location": {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        }
      },
      "mainEntityOfPage": {
        "@id": "https://www.chinamede.com/courses/n1-ai-newmedia/#webpage"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.chinamede.com/courses/n1-ai-newmedia/#faq",
      "name": "AI新媒体运营师就业班常见问题",
      "inLanguage": "zh-CN",
      "publisher": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "mainEntity": [
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n1-ai-newmedia/#faq-1",
          "url": "https://www.chinamede.com/courses/n1-ai-newmedia/#faq-1",
          "name": "AI新媒体运营师就业班学费是多少？包含哪些费用？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "本站明码标价：AI新媒体运营师就业班学费 13800 元（人民币），费用包含课程、教材、实训、22天带薪实习与就业指导，报名前一次性告知，无隐形消费。我们也提供官方免息分期与\"先就业后付尾款\"选项。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n1-ai-newmedia/#faq-2",
          "url": "https://www.chinamede.com/courses/n1-ai-newmedia/#faq-2",
          "name": "零基础、跨专业能报读AI新媒体运营师就业班吗？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "可以。课程采用\"理论夯实+项目实操+就业实训\"的渐进式教学，从基础工具与流程讲起，全程对标企业真实岗位工作场景；缺课可跟下一期补，全部正课提供录播回放。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n1-ai-newmedia/#faq-3",
          "url": "https://www.chinamede.com/courses/n1-ai-newmedia/#faq-3",
          "name": "AI新媒体运营师就业班要学多久？上课形式是什么？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "AI新媒体运营师就业班学习周期为50天 + 22天带薪实习，以线下直营校区小班面授为主，导师手把手实操指导；配套线上精品录播、直播复盘与课后答疑。广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n1-ai-newmedia/#faq-4",
          "url": "https://www.chinamede.com/courses/n1-ai-newmedia/#faq-4",
          "name": "学完AI新媒体运营师就业班就业怎么处理？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "我们不承诺\"包就业\"或\"100%安排上岗\"（这类表述涉嫌违反广告法），但提供合同化的就业服务清单：简历诊断≥2次、模拟面试≥2轮、企业内推、作品集指导至通过验收、结业后五年内不限次就业推荐。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n1-ai-newmedia/#faq-5",
          "url": "https://www.chinamede.com/courses/n1-ai-newmedia/#faq-5",
          "name": "如何预约AI新媒体运营师就业班试听？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "可拨打全国统一服务热线400-800-4459（每天8:00-23:00）、在官网填写免费试听表单，或直接到访就近校区。课程顾问会安排1节正课试听，并输出《个人学习规划书》。"
          }
        }
      ]
    }
  ],
  "/courses/n2-ai-visual-design/": [
    {
      "@type": "WebPage",
      "@id": "https://www.chinamede.com/courses/n2-ai-visual-design/#webpage",
      "url": "https://www.chinamede.com/courses/n2-ai-visual-design/",
      "name": "AI视觉设计师就业班_50天+22天带薪实习 - 美迪时代教育",
      "description": "AI视觉设计师就业班：从设计基础到AIGC电商设计全链路，50天·288课时，主讲老师手把手实操带练。学习周期50天 + 22天带薪实习，学费15800元（明码标价、无隐形消费），广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课，咨询热线400-800-4459。",
      "inLanguage": "zh-CN",
      "isPartOf": {
        "@id": "https://www.chinamede.com/#website"
      },
      "about": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "datePublished": "2026-09-18",
      "dateModified": "2026-09-18"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.chinamede.com/courses/n2-ai-visual-design/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://www.chinamede.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "培训课程",
          "item": "https://www.chinamede.com/courses/"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "AI视觉设计师就业班"
        }
      ]
    },
    {
      "@type": "Course",
      "@id": "https://www.chinamede.com/courses/n2-ai-visual-design/#course",
      "name": "N2 · AI视觉设计师就业班",
      "url": "https://www.chinamede.com/courses/n2-ai-visual-design/",
      "description": "聚焦AI与视觉设计复合技能，50天学习 + 22天带薪实习，四阶段打造「设计功底 + AIGC电商视觉」双能力，毕业即带商用作品集。",
      "provider": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "courseMode": "线下小班面授",
      "inLanguage": "zh-CN",
      "timeRequired": "P50D",
      "educationalCredentialAwarded": "AIGC视觉认证",
      "teaches": [
        "电商美工设计",
        "高级美工实战",
        "商业图片精修",
        "C4D电商运用",
        "AI工具应用赋能",
        "电商AI设计",
        "电商AI视频创作",
        "AI电商设计师岗前实战",
        "就业指导"
      ],
      "offers": {
        "@type": "Offer",
        "price": "15800",
        "priceCurrency": "CNY",
        "availability": "https://schema.org/InStock",
        "url": "https://www.chinamede.com/courses/#n2"
      },
      "location": [
        {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-kecun"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-huashi"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-nanzhou"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-wuhe"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-ailian"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-fuyong"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-dongcheng"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-houjie"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-ronggui"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-zumiao"
        },
        {
          "@id": "https://www.chinamede.com/#campus-jm-jianghai"
        },
        {
          "@id": "https://www.chinamede.com/#campus-zs-xiaolan"
        }
      ],
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "线下小班面授",
        "inLanguage": "zh-CN",
        "location": {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        }
      },
      "mainEntityOfPage": {
        "@id": "https://www.chinamede.com/courses/n2-ai-visual-design/#webpage"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.chinamede.com/courses/n2-ai-visual-design/#faq",
      "name": "AI视觉设计师就业班常见问题",
      "inLanguage": "zh-CN",
      "publisher": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "mainEntity": [
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n2-ai-visual-design/#faq-1",
          "url": "https://www.chinamede.com/courses/n2-ai-visual-design/#faq-1",
          "name": "AI视觉设计师就业班学费是多少？包含哪些费用？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "本站明码标价：AI视觉设计师就业班学费 15800 元（人民币），费用包含课程、教材、实训、22天带薪实习与就业指导，报名前一次性告知，无隐形消费。我们也提供官方免息分期与\"先就业后付尾款\"选项。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n2-ai-visual-design/#faq-2",
          "url": "https://www.chinamede.com/courses/n2-ai-visual-design/#faq-2",
          "name": "零基础、跨专业能报读AI视觉设计师就业班吗？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "可以。课程采用\"理论夯实+项目实操+就业实训\"的渐进式教学，从基础工具与流程讲起，全程对标企业真实岗位工作场景；缺课可跟下一期补，全部正课提供录播回放。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n2-ai-visual-design/#faq-3",
          "url": "https://www.chinamede.com/courses/n2-ai-visual-design/#faq-3",
          "name": "AI视觉设计师就业班要学多久？上课形式是什么？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "AI视觉设计师就业班学习周期为50天 + 22天带薪实习，以线下直营校区小班面授为主，导师手把手实操指导；配套线上精品录播、直播复盘与课后答疑。广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n2-ai-visual-design/#faq-4",
          "url": "https://www.chinamede.com/courses/n2-ai-visual-design/#faq-4",
          "name": "学完AI视觉设计师就业班就业怎么处理？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "我们不承诺\"包就业\"或\"100%安排上岗\"（这类表述涉嫌违反广告法），但提供合同化的就业服务清单：简历诊断≥2次、模拟面试≥2轮、企业内推、作品集指导至通过验收、结业后五年内不限次就业推荐。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n2-ai-visual-design/#faq-5",
          "url": "https://www.chinamede.com/courses/n2-ai-visual-design/#faq-5",
          "name": "如何预约AI视觉设计师就业班试听？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "可拨打全国统一服务热线400-800-4459（每天8:00-23:00）、在官网填写免费试听表单，或直接到访就近校区。课程顾问会安排1节正课试听，并输出《个人学习规划书》。"
          }
        }
      ]
    }
  ],
  "/courses/n3-short-video/": [
    {
      "@type": "WebPage",
      "@id": "https://www.chinamede.com/courses/n3-short-video/#webpage",
      "url": "https://www.chinamede.com/courses/n3-short-video/",
      "name": "商业短视频就业班_48天+22天带薪实习 - 美迪时代教育",
      "description": "商业短视频就业班：拍摄剪辑、高级创作到运营推广全流程，48天·288课时，掌握短视频全链路核心技能。学习周期48天 + 22天带薪实习，学费15800元（明码标价、无隐形消费），广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课，咨询热线400-800-4459。",
      "inLanguage": "zh-CN",
      "isPartOf": {
        "@id": "https://www.chinamede.com/#website"
      },
      "about": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "datePublished": "2026-09-18",
      "dateModified": "2026-09-18"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.chinamede.com/courses/n3-short-video/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://www.chinamede.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "培训课程",
          "item": "https://www.chinamede.com/courses/"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "商业短视频就业班"
        }
      ]
    },
    {
      "@type": "Course",
      "@id": "https://www.chinamede.com/courses/n3-short-video/#course",
      "name": "N3 · 商业短视频就业班",
      "url": "https://www.chinamede.com/courses/n3-short-video/",
      "description": "针对AI浪潮下复合型人才缺口，48天学习 + 22天带薪实习，四阶段闭环培养「拍摄剪辑 → 高级创作 → 运营推广 → 岗前实战」全能型短视频人才。",
      "provider": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "courseMode": "线下小班面授",
      "inLanguage": "zh-CN",
      "timeRequired": "P48D",
      "educationalCredentialAwarded": "巨量学/行业专业认证",
      "teaches": [
        "手机拍摄剪辑",
        "短视频拍摄剪辑高级",
        "电商AI视频创作",
        "短视频特效合成",
        "抖音短视频运营",
        "抖音获客引流实战",
        "商业短视频项目运营实战",
        "就业指导实战"
      ],
      "offers": {
        "@type": "Offer",
        "price": "15800",
        "priceCurrency": "CNY",
        "availability": "https://schema.org/InStock",
        "url": "https://www.chinamede.com/courses/#n3"
      },
      "location": [
        {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-kecun"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-huashi"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-nanzhou"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-wuhe"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-ailian"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-fuyong"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-dongcheng"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-houjie"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-ronggui"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-zumiao"
        },
        {
          "@id": "https://www.chinamede.com/#campus-jm-jianghai"
        },
        {
          "@id": "https://www.chinamede.com/#campus-zs-xiaolan"
        }
      ],
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "线下小班面授",
        "inLanguage": "zh-CN",
        "location": {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        }
      },
      "mainEntityOfPage": {
        "@id": "https://www.chinamede.com/courses/n3-short-video/#webpage"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.chinamede.com/courses/n3-short-video/#faq",
      "name": "商业短视频就业班常见问题",
      "inLanguage": "zh-CN",
      "publisher": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "mainEntity": [
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n3-short-video/#faq-1",
          "url": "https://www.chinamede.com/courses/n3-short-video/#faq-1",
          "name": "商业短视频就业班学费是多少？包含哪些费用？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "本站明码标价：商业短视频就业班学费 15800 元（人民币），费用包含课程、教材、实训、22天带薪实习与就业指导，报名前一次性告知，无隐形消费。我们也提供官方免息分期与\"先就业后付尾款\"选项。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n3-short-video/#faq-2",
          "url": "https://www.chinamede.com/courses/n3-short-video/#faq-2",
          "name": "零基础、跨专业能报读商业短视频就业班吗？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "可以。课程采用\"理论夯实+项目实操+就业实训\"的渐进式教学，从基础工具与流程讲起，全程对标企业真实岗位工作场景；缺课可跟下一期补，全部正课提供录播回放。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n3-short-video/#faq-3",
          "url": "https://www.chinamede.com/courses/n3-short-video/#faq-3",
          "name": "商业短视频就业班要学多久？上课形式是什么？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "商业短视频就业班学习周期为48天 + 22天带薪实习，以线下直营校区小班面授为主，导师手把手实操指导；配套线上精品录播、直播复盘与课后答疑。广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n3-short-video/#faq-4",
          "url": "https://www.chinamede.com/courses/n3-short-video/#faq-4",
          "name": "学完商业短视频就业班就业怎么处理？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "我们不承诺\"包就业\"或\"100%安排上岗\"（这类表述涉嫌违反广告法），但提供合同化的就业服务清单：简历诊断≥2次、模拟面试≥2轮、企业内推、作品集指导至通过验收、结业后五年内不限次就业推荐。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n3-short-video/#faq-5",
          "url": "https://www.chinamede.com/courses/n3-short-video/#faq-5",
          "name": "如何预约商业短视频就业班试听？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "可拨打全国统一服务热线400-800-4459（每天8:00-23:00）、在官网填写免费试听表单，或直接到访就近校区。课程顾问会安排1节正课试听，并输出《个人学习规划书》。"
          }
        }
      ]
    }
  ],
  "/courses/n4-aigc/": [
    {
      "@type": "WebPage",
      "@id": "https://www.chinamede.com/courses/n4-aigc/#webpage",
      "url": "https://www.chinamede.com/courses/n4-aigc/",
      "name": "AIGC全能实战班_89天一价三证 - 美迪时代教育",
      "description": "AIGC全能实战班：AI视频生成、AI设计与AI运营多方向岗前实战，89天一价三证，零基础直达复合型AI岗位。学习周期89天一价三证，学费22800元（明码标价、无隐形消费），广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课，咨询热线400-800-4459。",
      "inLanguage": "zh-CN",
      "isPartOf": {
        "@id": "https://www.chinamede.com/#website"
      },
      "about": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "datePublished": "2026-09-18",
      "dateModified": "2026-09-18"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.chinamede.com/courses/n4-aigc/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://www.chinamede.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "培训课程",
          "item": "https://www.chinamede.com/courses/"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "AIGC全能实战班"
        }
      ]
    },
    {
      "@type": "Course",
      "@id": "https://www.chinamede.com/courses/n4-aigc/#course",
      "name": "N4 · AIGC全能实战班",
      "url": "https://www.chinamede.com/courses/n4-aigc/",
      "description": "89天学习 + 22天带薪实习，六大阶段全链路覆盖「AI工具 → 视频生成 → 新媒体运营 → 设计 → 岗前实战 → 就业实习」，一站式打造AIGC复合型人才。",
      "provider": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "courseMode": "线下小班面授",
      "inLanguage": "zh-CN",
      "timeRequired": "P89D",
      "teaches": [
        "AI工具使用应用",
        "AI自媒体副业",
        "手机拍摄剪辑",
        "短视频高级剪辑",
        "电商AI视频创作",
        "抖音运营",
        "抖音获客引流",
        "AI智能体开发",
        "企业AI获客GEO训练营",
        "电商美工",
        "商业图片精修",
        "C4D电商运用",
        "电商AI设计",
        "电商设计师岗前实战",
        "新媒体运营师岗前实战",
        "就业指导实战"
      ],
      "offers": {
        "@type": "Offer",
        "price": "22800",
        "priceCurrency": "CNY",
        "availability": "https://schema.org/InStock",
        "url": "https://www.chinamede.com/courses/#n4"
      },
      "location": [
        {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-kecun"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-huashi"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-nanzhou"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-wuhe"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-ailian"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-fuyong"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-dongcheng"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-houjie"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-ronggui"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-zumiao"
        },
        {
          "@id": "https://www.chinamede.com/#campus-jm-jianghai"
        },
        {
          "@id": "https://www.chinamede.com/#campus-zs-xiaolan"
        }
      ],
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "线下小班面授",
        "inLanguage": "zh-CN",
        "location": {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        }
      },
      "mainEntityOfPage": {
        "@id": "https://www.chinamede.com/courses/n4-aigc/#webpage"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.chinamede.com/courses/n4-aigc/#faq",
      "name": "AIGC全能实战班常见问题",
      "inLanguage": "zh-CN",
      "publisher": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "mainEntity": [
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n4-aigc/#faq-1",
          "url": "https://www.chinamede.com/courses/n4-aigc/#faq-1",
          "name": "AIGC全能实战班学费是多少？包含哪些费用？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "本站明码标价：AIGC全能实战班学费 22800 元（人民币），费用包含课程、教材、实训、22天带薪实习与就业指导，报名前一次性告知，无隐形消费。我们也提供官方免息分期与\"先就业后付尾款\"选项。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n4-aigc/#faq-2",
          "url": "https://www.chinamede.com/courses/n4-aigc/#faq-2",
          "name": "零基础、跨专业能报读AIGC全能实战班吗？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "可以。课程采用\"理论夯实+项目实操+就业实训\"的渐进式教学，从基础工具与流程讲起，全程对标企业真实岗位工作场景；缺课可跟下一期补，全部正课提供录播回放。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n4-aigc/#faq-3",
          "url": "https://www.chinamede.com/courses/n4-aigc/#faq-3",
          "name": "AIGC全能实战班要学多久？上课形式是什么？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "AIGC全能实战班学习周期为89天一价三证，以线下直营校区小班面授为主，导师手把手实操指导；配套线上精品录播、直播复盘与课后答疑。广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n4-aigc/#faq-4",
          "url": "https://www.chinamede.com/courses/n4-aigc/#faq-4",
          "name": "学完AIGC全能实战班就业怎么处理？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "我们不承诺\"包就业\"或\"100%安排上岗\"（这类表述涉嫌违反广告法），但提供合同化的就业服务清单：简历诊断≥2次、模拟面试≥2轮、企业内推、作品集指导至通过验收、结业后五年内不限次就业推荐。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n4-aigc/#faq-5",
          "url": "https://www.chinamede.com/courses/n4-aigc/#faq-5",
          "name": "如何预约AIGC全能实战班试听？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "可拨打全国统一服务热线400-800-4459（每天8:00-23:00）、在官网填写免费试听表单，或直接到访就近校区。课程顾问会安排1节正课试听，并输出《个人学习规划书》。"
          }
        }
      ]
    }
  ],
  "/courses/n5-ai-drama/": [
    {
      "@type": "WebPage",
      "@id": "https://www.chinamede.com/courses/n5-ai-drama/#webpage",
      "url": "https://www.chinamede.com/courses/n5-ai-drama/",
      "name": "AI短剧漫剧就业班_27天+22天带薪实习 - 美迪时代教育",
      "description": "AI短剧漫剧就业班：AI工具训练营到短剧漫剧创作营全链路实操，27天·162课时，多题材覆盖。学习周期27天 + 22天带薪实习，学费12800元（明码标价、无隐形消费），广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课，咨询热线400-800-4459。",
      "inLanguage": "zh-CN",
      "isPartOf": {
        "@id": "https://www.chinamede.com/#website"
      },
      "about": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "datePublished": "2026-09-18",
      "dateModified": "2026-09-18"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.chinamede.com/courses/n5-ai-drama/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://www.chinamede.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "培训课程",
          "item": "https://www.chinamede.com/courses/"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "AI短剧漫剧就业班"
        }
      ]
    },
    {
      "@type": "Course",
      "@id": "https://www.chinamede.com/courses/n5-ai-drama/#course",
      "name": "N5 · AI短剧漫剧就业班",
      "url": "https://www.chinamede.com/courses/n5-ai-drama/",
      "description": "27天学习 + 22天带薪实习，从剧本到成片全链路实操，主打「最新AI视频工具矩阵 + 短剧漫剧商业变现能力」。",
      "provider": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "courseMode": "线下小班面授",
      "inLanguage": "zh-CN",
      "timeRequired": "P27D",
      "teaches": [
        "AI工具应用赋能",
        "AI剪映影视创作",
        "AI漫剧训练营",
        "AI真人剧训练营",
        "创作师岗前实战",
        "就业指导实战"
      ],
      "offers": {
        "@type": "Offer",
        "price": "12800",
        "priceCurrency": "CNY",
        "availability": "https://schema.org/InStock",
        "url": "https://www.chinamede.com/courses/#n5"
      },
      "location": [
        {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-kecun"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-huashi"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-nanzhou"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-wuhe"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-ailian"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-fuyong"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-dongcheng"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-houjie"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-ronggui"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-zumiao"
        },
        {
          "@id": "https://www.chinamede.com/#campus-jm-jianghai"
        },
        {
          "@id": "https://www.chinamede.com/#campus-zs-xiaolan"
        }
      ],
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "线下小班面授",
        "inLanguage": "zh-CN",
        "location": {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        }
      },
      "mainEntityOfPage": {
        "@id": "https://www.chinamede.com/courses/n5-ai-drama/#webpage"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.chinamede.com/courses/n5-ai-drama/#faq",
      "name": "AI短剧漫剧就业班常见问题",
      "inLanguage": "zh-CN",
      "publisher": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "mainEntity": [
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n5-ai-drama/#faq-1",
          "url": "https://www.chinamede.com/courses/n5-ai-drama/#faq-1",
          "name": "AI短剧漫剧就业班学费是多少？包含哪些费用？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "本站明码标价：AI短剧漫剧就业班学费 12800 元（人民币），费用包含课程、教材、实训、22天带薪实习与就业指导，报名前一次性告知，无隐形消费。我们也提供官方免息分期与\"先就业后付尾款\"选项。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n5-ai-drama/#faq-2",
          "url": "https://www.chinamede.com/courses/n5-ai-drama/#faq-2",
          "name": "零基础、跨专业能报读AI短剧漫剧就业班吗？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "可以。课程采用\"理论夯实+项目实操+就业实训\"的渐进式教学，从基础工具与流程讲起，全程对标企业真实岗位工作场景；缺课可跟下一期补，全部正课提供录播回放。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n5-ai-drama/#faq-3",
          "url": "https://www.chinamede.com/courses/n5-ai-drama/#faq-3",
          "name": "AI短剧漫剧就业班要学多久？上课形式是什么？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "AI短剧漫剧就业班学习周期为27天 + 22天带薪实习，以线下直营校区小班面授为主，导师手把手实操指导；配套线上精品录播、直播复盘与课后答疑。广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n5-ai-drama/#faq-4",
          "url": "https://www.chinamede.com/courses/n5-ai-drama/#faq-4",
          "name": "学完AI短剧漫剧就业班就业怎么处理？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "我们不承诺\"包就业\"或\"100%安排上岗\"（这类表述涉嫌违反广告法），但提供合同化的就业服务清单：简历诊断≥2次、模拟面试≥2轮、企业内推、作品集指导至通过验收、结业后五年内不限次就业推荐。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n5-ai-drama/#faq-5",
          "url": "https://www.chinamede.com/courses/n5-ai-drama/#faq-5",
          "name": "如何预约AI短剧漫剧就业班试听？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "可拨打全国统一服务热线400-800-4459（每天8:00-23:00）、在官网填写免费试听表单，或直接到访就近校区。课程顾问会安排1节正课试听，并输出《个人学习规划书》。"
          }
        }
      ]
    }
  ],
  "/courses/n6-amazon/": [
    {
      "@type": "WebPage",
      "@id": "https://www.chinamede.com/courses/n6-amazon/#webpage",
      "url": "https://www.chinamede.com/courses/n6-amazon/",
      "name": "亚马逊高阶运营实战班_27天+22天岗位实习 - 美迪时代教育",
      "description": "亚马逊高阶运营实战班：真实店铺实操全流程，AI辅助运营与广告优化，27天+22天带薪岗位实习。学习周期27天 + 22天岗位实习，学费13800元（明码标价、无隐形消费），广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课，咨询热线400-800-4459。",
      "inLanguage": "zh-CN",
      "isPartOf": {
        "@id": "https://www.chinamede.com/#website"
      },
      "about": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "datePublished": "2026-09-18",
      "dateModified": "2026-09-18"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.chinamede.com/courses/n6-amazon/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://www.chinamede.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "培训课程",
          "item": "https://www.chinamede.com/courses/"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "亚马逊高阶运营实战班"
        }
      ]
    },
    {
      "@type": "Course",
      "@id": "https://www.chinamede.com/courses/n6-amazon/#course",
      "name": "N6 · 亚马逊就业班",
      "url": "https://www.chinamede.com/courses/n6-amazon/",
      "description": "27天学习 + 22天实习，聚焦亚马逊跨境运营人才短缺，主打「AI辅助全流程运营」与真实店铺实操，依托美迪15年跨境电商服务商基因，毕业即具备独立操盘与爆款打造能力。",
      "provider": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "courseMode": "线下小班面授",
      "inLanguage": "zh-CN",
      "timeRequired": "P27D",
      "teaches": [
        "亚马逊运营推广",
        "亚马逊AI高阶运营",
        "亚马逊实训",
        "就业指导实战"
      ],
      "offers": {
        "@type": "Offer",
        "price": "13800",
        "priceCurrency": "CNY",
        "availability": "https://schema.org/InStock",
        "url": "https://www.chinamede.com/courses/#n6"
      },
      "location": [
        {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-kecun"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-huashi"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-nanzhou"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-wuhe"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-ailian"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-fuyong"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-dongcheng"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-houjie"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-ronggui"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-zumiao"
        },
        {
          "@id": "https://www.chinamede.com/#campus-jm-jianghai"
        },
        {
          "@id": "https://www.chinamede.com/#campus-zs-xiaolan"
        }
      ],
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "线下小班面授",
        "inLanguage": "zh-CN",
        "location": {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        }
      },
      "mainEntityOfPage": {
        "@id": "https://www.chinamede.com/courses/n6-amazon/#webpage"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.chinamede.com/courses/n6-amazon/#faq",
      "name": "亚马逊高阶运营实战班常见问题",
      "inLanguage": "zh-CN",
      "publisher": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "mainEntity": [
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n6-amazon/#faq-1",
          "url": "https://www.chinamede.com/courses/n6-amazon/#faq-1",
          "name": "亚马逊高阶运营实战班学费是多少？包含哪些费用？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "本站明码标价：亚马逊高阶运营实战班学费 13800 元（人民币），费用包含课程、教材、实训、跟岗实训与就业指导，报名前一次性告知，无隐形消费。我们也提供官方免息分期与\"先就业后付尾款\"选项。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n6-amazon/#faq-2",
          "url": "https://www.chinamede.com/courses/n6-amazon/#faq-2",
          "name": "零基础、跨专业能报读亚马逊高阶运营实战班吗？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "可以。课程采用\"理论夯实+项目实操+就业实训\"的渐进式教学，从基础工具与流程讲起，全程对标企业真实岗位工作场景；缺课可跟下一期补，全部正课提供录播回放。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n6-amazon/#faq-3",
          "url": "https://www.chinamede.com/courses/n6-amazon/#faq-3",
          "name": "亚马逊高阶运营实战班要学多久？上课形式是什么？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "亚马逊高阶运营实战班学习周期为27天 + 22天岗位实习，以线下直营校区小班面授为主，导师手把手实操指导；配套线上精品录播、直播复盘与课后答疑。广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n6-amazon/#faq-4",
          "url": "https://www.chinamede.com/courses/n6-amazon/#faq-4",
          "name": "学完亚马逊高阶运营实战班就业怎么处理？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "我们不承诺\"包就业\"或\"100%安排上岗\"（这类表述涉嫌违反广告法），但提供合同化的就业服务清单：简历诊断≥2次、模拟面试≥2轮、企业内推、作品集指导至通过验收、结业后五年内不限次就业推荐。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n6-amazon/#faq-5",
          "url": "https://www.chinamede.com/courses/n6-amazon/#faq-5",
          "name": "如何预约亚马逊高阶运营实战班试听？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "可拨打全国统一服务热线400-800-4459（每天8:00-23:00）、在官网填写免费试听表单，或直接到访就近校区。课程顾问会安排1节正课试听，并输出《个人学习规划书》。"
          }
        }
      ]
    }
  ],
  "/courses/n7-tiktok/": [
    {
      "@type": "WebPage",
      "@id": "https://www.chinamede.com/courses/n7-tiktok/#webpage",
      "url": "https://www.chinamede.com/courses/n7-tiktok/",
      "name": "TikTok营销实战班_7天高强度集训 - 美迪时代教育",
      "description": "TikTok营销实战班：真实TikTok账号实操，从基础运营、手机拍摄剪辑到选品投流全链路打通，7天高强度集训。学习周期7天高强度集训，学费10800元（明码标价、无隐形消费），广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课，咨询热线400-800-4459。",
      "inLanguage": "zh-CN",
      "isPartOf": {
        "@id": "https://www.chinamede.com/#website"
      },
      "about": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "datePublished": "2026-09-18",
      "dateModified": "2026-09-18"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.chinamede.com/courses/n7-tiktok/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://www.chinamede.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "培训课程",
          "item": "https://www.chinamede.com/courses/"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "TikTok营销实战班"
        }
      ]
    },
    {
      "@type": "Course",
      "@id": "https://www.chinamede.com/courses/n7-tiktok/#course",
      "name": "N7 · TikTok就业班",
      "url": "https://www.chinamede.com/courses/n7-tiktok/",
      "description": "7天短周期高强度锻造，真实TikTok账号全流程实操（三阶段114课时），从选品运营、拍摄剪辑到广告投流与复盘一次打通，打造出海内容与电商复合型人才。",
      "provider": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "courseMode": "线下小班面授",
      "inLanguage": "zh-CN",
      "timeRequired": "P7D",
      "teaches": [
        "TikTok短视频营销",
        "TikTok小店实战",
        "手机拍摄剪辑",
        "TikTok实训",
        "就业指导实战"
      ],
      "offers": {
        "@type": "Offer",
        "price": "10800",
        "priceCurrency": "CNY",
        "availability": "https://schema.org/InStock",
        "url": "https://www.chinamede.com/courses/#n7"
      },
      "location": [
        {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-kecun"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-huashi"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-nanzhou"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-wuhe"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-ailian"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-fuyong"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-dongcheng"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-houjie"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-ronggui"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-zumiao"
        },
        {
          "@id": "https://www.chinamede.com/#campus-jm-jianghai"
        },
        {
          "@id": "https://www.chinamede.com/#campus-zs-xiaolan"
        }
      ],
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "线下小班面授",
        "inLanguage": "zh-CN",
        "location": {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        }
      },
      "mainEntityOfPage": {
        "@id": "https://www.chinamede.com/courses/n7-tiktok/#webpage"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.chinamede.com/courses/n7-tiktok/#faq",
      "name": "TikTok营销实战班常见问题",
      "inLanguage": "zh-CN",
      "publisher": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "mainEntity": [
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n7-tiktok/#faq-1",
          "url": "https://www.chinamede.com/courses/n7-tiktok/#faq-1",
          "name": "TikTok营销实战班学费是多少？包含哪些费用？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "本站明码标价：TikTok营销实战班学费 10800 元（人民币），费用包含课程、教材、实训、跟岗实训与就业指导，报名前一次性告知，无隐形消费。我们也提供官方免息分期与\"先就业后付尾款\"选项。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n7-tiktok/#faq-2",
          "url": "https://www.chinamede.com/courses/n7-tiktok/#faq-2",
          "name": "零基础、跨专业能报读TikTok营销实战班吗？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "可以。课程采用\"理论夯实+项目实操+就业实训\"的渐进式教学，从基础工具与流程讲起，全程对标企业真实岗位工作场景；缺课可跟下一期补，全部正课提供录播回放。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n7-tiktok/#faq-3",
          "url": "https://www.chinamede.com/courses/n7-tiktok/#faq-3",
          "name": "TikTok营销实战班要学多久？上课形式是什么？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "TikTok营销实战班学习周期为7天高强度集训，以线下直营校区小班面授为主，导师手把手实操指导；配套线上精品录播、直播复盘与课后答疑。广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n7-tiktok/#faq-4",
          "url": "https://www.chinamede.com/courses/n7-tiktok/#faq-4",
          "name": "学完TikTok营销实战班就业怎么处理？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "我们不承诺\"包就业\"或\"100%安排上岗\"（这类表述涉嫌违反广告法），但提供合同化的就业服务清单：简历诊断≥2次、模拟面试≥2轮、企业内推、作品集指导至通过验收、结业后五年内不限次就业推荐。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n7-tiktok/#faq-5",
          "url": "https://www.chinamede.com/courses/n7-tiktok/#faq-5",
          "name": "如何预约TikTok营销实战班试听？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "可拨打全国统一服务热线400-800-4459（每天8:00-23:00）、在官网填写免费试听表单，或直接到访就近校区。课程顾问会安排1节正课试听，并输出《个人学习规划书》。"
          }
        }
      ]
    }
  ],
  "/courses/n8-overseas-smm/": [
    {
      "@type": "WebPage",
      "@id": "https://www.chinamede.com/courses/n8-overseas-smm/#webpage",
      "url": "https://www.chinamede.com/courses/n8-overseas-smm/",
      "name": "海外社媒运营专员就业班_18天全链路实操 - 美迪时代教育",
      "description": "海外社媒运营专员就业班：全案操盘实操，独立站、海外社媒与高阶投流三位一体，18天系统培养。学习周期18天全链路实操，学费13800元（明码标价、无隐形消费），广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课，咨询热线400-800-4459。",
      "inLanguage": "zh-CN",
      "isPartOf": {
        "@id": "https://www.chinamede.com/#website"
      },
      "about": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "datePublished": "2026-09-18",
      "dateModified": "2026-09-18"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.chinamede.com/courses/n8-overseas-smm/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://www.chinamede.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "培训课程",
          "item": "https://www.chinamede.com/courses/"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "海外社媒运营专员就业班"
        }
      ]
    },
    {
      "@type": "Course",
      "@id": "https://www.chinamede.com/courses/n8-overseas-smm/#course",
      "name": "N8 · 海外社媒运营专员就业班",
      "url": "https://www.chinamede.com/courses/n8-overseas-smm/",
      "description": "18天系统化培养（三阶段120课时）「懂策划、擅内容、精投放」的海外社媒复合型人才，深度覆盖独立站、Instagram、Facebook全平台，实战打通出海全流程获客闭环。",
      "provider": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "courseMode": "线下小班面授",
      "inLanguage": "zh-CN",
      "timeRequired": "P18D",
      "teaches": [
        "独立站运营推广",
        "海外社媒运营实战",
        "Facebook高阶投流获客实战",
        "手机拍摄剪辑",
        "海外社媒实训",
        "就业指导实战"
      ],
      "offers": {
        "@type": "Offer",
        "price": "13800",
        "priceCurrency": "CNY",
        "availability": "https://schema.org/InStock",
        "url": "https://www.chinamede.com/courses/#n8"
      },
      "location": [
        {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-kecun"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-huashi"
        },
        {
          "@id": "https://www.chinamede.com/#campus-gz-nanzhou"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-wuhe"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-ailian"
        },
        {
          "@id": "https://www.chinamede.com/#campus-sz-fuyong"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-dongcheng"
        },
        {
          "@id": "https://www.chinamede.com/#campus-dg-houjie"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-ronggui"
        },
        {
          "@id": "https://www.chinamede.com/#campus-fs-zumiao"
        },
        {
          "@id": "https://www.chinamede.com/#campus-jm-jianghai"
        },
        {
          "@id": "https://www.chinamede.com/#campus-zs-xiaolan"
        }
      ],
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "线下小班面授",
        "inLanguage": "zh-CN",
        "location": {
          "@id": "https://www.chinamede.com/#campus-gz-sanyuanli"
        }
      },
      "mainEntityOfPage": {
        "@id": "https://www.chinamede.com/courses/n8-overseas-smm/#webpage"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.chinamede.com/courses/n8-overseas-smm/#faq",
      "name": "海外社媒运营专员就业班常见问题",
      "inLanguage": "zh-CN",
      "publisher": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "mainEntity": [
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n8-overseas-smm/#faq-1",
          "url": "https://www.chinamede.com/courses/n8-overseas-smm/#faq-1",
          "name": "海外社媒运营专员就业班学费是多少？包含哪些费用？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "本站明码标价：海外社媒运营专员就业班学费 13800 元（人民币），费用包含课程、教材、实训、跟岗实训与就业指导，报名前一次性告知，无隐形消费。我们也提供官方免息分期与\"先就业后付尾款\"选项。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n8-overseas-smm/#faq-2",
          "url": "https://www.chinamede.com/courses/n8-overseas-smm/#faq-2",
          "name": "零基础、跨专业能报读海外社媒运营专员就业班吗？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "可以。课程采用\"理论夯实+项目实操+就业实训\"的渐进式教学，从基础工具与流程讲起，全程对标企业真实岗位工作场景；缺课可跟下一期补，全部正课提供录播回放。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n8-overseas-smm/#faq-3",
          "url": "https://www.chinamede.com/courses/n8-overseas-smm/#faq-3",
          "name": "海外社媒运营专员就业班要学多久？上课形式是什么？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "海外社媒运营专员就业班学习周期为18天全链路实操，以线下直营校区小班面授为主，导师手把手实操指导；配套线上精品录播、直播复盘与课后答疑。广州、深圳、佛山、东莞、中山、江门13个直营校区就近上课。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n8-overseas-smm/#faq-4",
          "url": "https://www.chinamede.com/courses/n8-overseas-smm/#faq-4",
          "name": "学完海外社媒运营专员就业班就业怎么处理？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "我们不承诺\"包就业\"或\"100%安排上岗\"（这类表述涉嫌违反广告法），但提供合同化的就业服务清单：简历诊断≥2次、模拟面试≥2轮、企业内推、作品集指导至通过验收、结业后五年内不限次就业推荐。"
          }
        },
        {
          "@type": "Question",
          "@id": "https://www.chinamede.com/courses/n8-overseas-smm/#faq-5",
          "url": "https://www.chinamede.com/courses/n8-overseas-smm/#faq-5",
          "name": "如何预约海外社媒运营专员就业班试听？",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "可拨打全国统一服务热线400-800-4459（每天8:00-23:00）、在官网填写免费试听表单，或直接到访就近校区。课程顾问会安排1节正课试听，并输出《个人学习规划书》。"
          }
        }
      ]
    }
  ],
  "/knowledge/guide-geo/": [
    {
      "@type": "WebPage",
      "@id": "https://www.chinamede.com/knowledge/guide-geo/#webpage",
      "url": "https://www.chinamede.com/knowledge/guide-geo/",
      "name": "什么是GEO？AI搜索时代企业与个人必须掌握的获客新打法",
      "inLanguage": "zh-CN",
      "isPartOf": {
        "@id": "https://www.chinamede.com/#website"
      },
      "about": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "datePublished": "2026-09-17",
      "dateModified": "2026-09-18"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.chinamede.com/knowledge/guide-geo/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://www.chinamede.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "知识百科",
          "item": "https://www.chinamede.com/knowledge/"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "什么是GEO？"
        }
      ]
    },
    {
      "@type": "Article",
      "@id": "https://www.chinamede.com/knowledge/guide-geo/#article",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://www.chinamede.com/knowledge/guide-geo/"
      },
      "headline": "什么是GEO？AI搜索时代企业与个人必须掌握的获客新打法",
      "description": "GEO（生成式引擎优化）详解：GEO和SEO的区别、AI大模型如何决定推荐谁、企业如何布局GEO让DeepSeek/豆包/ChatGPT推荐自己的品牌、GEO相关新岗位与薪资机会。",
      "image": {
        "@type": "ImageObject",
        "url": "https://www.chinamede.com/images/og-cover.png",
        "width": 1200,
        "height": 630
      },
      "author": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": [
          ".article-body"
        ]
      },
      "publisher": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "inLanguage": "zh-CN",
      "keywords": "GEO是什么,生成式引擎优化,GEO和SEO区别,AI搜索优化,AI获客,企业GEO布局,GEO岗位",
      "about": [
        {
          "@type": "Thing",
          "name": "生成式引擎优化（GEO）"
        },
        {
          "@type": "Thing",
          "name": "AI搜索获客"
        }
      ],
      "datePublished": "2026-09-17",
      "dateModified": "2026-09-18"
    }
  ],
  "/knowledge/guide-newmedia/": [
    {
      "@type": "WebPage",
      "@id": "https://www.chinamede.com/knowledge/guide-newmedia/#webpage",
      "url": "https://www.chinamede.com/knowledge/guide-newmedia/",
      "name": "零基础转行新媒体运营全攻略：从月薪3千到月薪过万的完整路径",
      "inLanguage": "zh-CN",
      "isPartOf": {
        "@id": "https://www.chinamede.com/#website"
      },
      "about": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "datePublished": "2026-09-17",
      "dateModified": "2026-09-18"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.chinamede.com/knowledge/guide-newmedia/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://www.chinamede.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "知识百科",
          "item": "https://www.chinamede.com/knowledge/"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "零基础转行新媒体运营全攻略"
        }
      ]
    },
    {
      "@type": "Article",
      "@id": "https://www.chinamede.com/knowledge/guide-newmedia/#article",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://www.chinamede.com/knowledge/guide-newmedia/"
      },
      "headline": "零基础转行新媒体运营全攻略：从月薪3千到月薪过万的完整路径",
      "description": "零基础转行新媒体运营完整攻略：岗位认知、必备技能清单、作品集怎么准备、简历面试技巧、入职前90天规划，以及自学vs报班的成本对比，美迪时代教育教研团队实操整理。",
      "image": {
        "@type": "ImageObject",
        "url": "https://www.chinamede.com/images/og-cover.png",
        "width": 1200,
        "height": 630
      },
      "author": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": [
          ".article-body"
        ]
      },
      "publisher": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "inLanguage": "zh-CN",
      "keywords": "新媒体运营转行攻略,零基础转行,新媒体运营学什么,新媒体运营薪资,作品集准备,转行互联网行业",
      "about": [
        {
          "@type": "Thing",
          "name": "新媒体运营"
        },
        {
          "@type": "Thing",
          "name": "零基础转行"
        }
      ],
      "datePublished": "2026-09-17",
      "dateModified": "2026-09-18"
    }
  ],
  "/knowledge/guide-shortvideo/": [
    {
      "@type": "WebPage",
      "@id": "https://www.chinamede.com/knowledge/guide-shortvideo/#webpage",
      "url": "https://www.chinamede.com/knowledge/guide-shortvideo/",
      "name": "2026短视频与短剧行业就业前景分析：普通人还有机会吗？",
      "inLanguage": "zh-CN",
      "isPartOf": {
        "@id": "https://www.chinamede.com/#website"
      },
      "about": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "datePublished": "2026-09-17",
      "dateModified": "2026-09-18"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.chinamede.com/knowledge/guide-shortvideo/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://www.chinamede.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "知识百科",
          "item": "https://www.chinamede.com/knowledge/"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "2026短视频与短剧行业就业前景分析"
        }
      ]
    },
    {
      "@type": "Article",
      "@id": "https://www.chinamede.com/knowledge/guide-shortvideo/#article",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://www.chinamede.com/knowledge/guide-shortvideo/"
      },
      "headline": "2026短视频与短剧行业就业前景分析：普通人还有机会吗？",
      "description": "2026短视频短剧行业就业前景：市场规模、岗位缺口、剪辑/运营/投流/编剧各岗位薪资水平、入行门槛与学习路径，普通人转行短视频行业的可行性分析。",
      "image": {
        "@type": "ImageObject",
        "url": "https://www.chinamede.com/images/og-cover.png",
        "width": 1200,
        "height": 630
      },
      "author": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": [
          ".article-body"
        ]
      },
      "publisher": {
        "@id": "https://www.chinamede.com/#organization"
      },
      "inLanguage": "zh-CN",
      "keywords": "短视频行业前景,短剧行业分析,短视频剪辑薪资,短剧岗位,视频剪辑培训,转行短视频",
      "about": [
        {
          "@type": "Thing",
          "name": "短视频行业"
        },
        {
          "@type": "Thing",
          "name": "短剧行业就业"
        }
      ],
      "datePublished": "2026-09-17",
      "dateModified": "2026-09-18"
    }
  ]
};
