// 站点级 JSON-LD - 由旧站 partials/schema.html 抽取生成（Organization + WebSite）
// 与旧站保持逐字段一致，Organization 的 subOrganization 引用各校区节点（见 campuses.ts）
/* eslint-disable @typescript-eslint/no-explicit-any */
export const organizationSchema: any = {
  "@type": "EducationalOrganization",
  "@id": "https://www.chinamede.com/#organization",
  "name": "美迪时代教育",
  "legalName": "广州美迪教育科技有限公司",
  "slogan": "让职业就业更简单",
  "url": "https://www.chinamede.com/",
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.chinamede.com/images/logo_3.png"
  },
  "image": "https://www.chinamede.com/images/og-cover.png",
  "description": "美迪时代教育隶属于广州美迪教育科技有限公司，2011 年创立，专注成人职业技能就业培训，在广州、深圳、佛山、东莞、中山、江门 6 大城市设有 13 个直营校区，提供 AI 新媒体运营、AI 视觉设计、商业短视频、AIGC、AI 短剧漫剧、跨境电商等就业方向培训，长期班标配 22 天带薪实习与五年就业推荐。",
  "foundingDate": "2011",
  "numberOfEmployees": {
    "@type": "QuantitativeValue",
    "value": 300
  },
  "telephone": "400-800-4459",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "广州市越秀区三元里大道217号民生商业大厦3—4楼",
    "addressLocality": "广州市",
    "addressRegion": "广东省",
    "addressCountry": "CN"
  },
  "areaServed": [
    {
      "@type": "City",
      "name": "广州"
    },
    {
      "@type": "City",
      "name": "深圳"
    },
    {
      "@type": "City",
      "name": "佛山"
    },
    {
      "@type": "City",
      "name": "东莞"
    },
    {
      "@type": "City",
      "name": "中山"
    },
    {
      "@type": "City",
      "name": "江门"
    }
  ],
  "knowsAbout": [
    "AI新媒体运营",
    "AI视觉设计",
    "商业短视频创作",
    "AIGC应用",
    "AI短剧漫剧创作",
    "亚马逊跨境电商运营",
    "TikTok营销",
    "海外社媒运营",
    "生成式引擎优化（GEO）",
    "成人职业技能就业培训"
  ],
  "contactPoint": [
    {
      "@type": "ContactPoint",
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
        "opens": "08:00",
        "closes": "23:00"
      }
    }
  ],
  "subOrganization": [
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
  ]
};

export const websiteSchema: any = {
  "@type": "WebSite",
  "@id": "https://www.chinamede.com/#website",
  "name": "美迪时代教育",
  "url": "https://www.chinamede.com/",
  "publisher": {
    "@id": "https://www.chinamede.com/#organization"
  },
  "inLanguage": "zh-CN"
};
