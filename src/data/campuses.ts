// 校区数据 - 由旧站 partials/schema.json 的 JSON-LD（EducationalOrganization/LocalBusiness）抽取生成
// 共 13 个直营校区，覆盖 广州、深圳、东莞、佛山、江门、中山
export interface Campus {
  id: string;
  name: string;
  telephone: string;
  streetAddress: string;
  locality: string;
  region: string;
  city: string;
  traffic: string;
}

export const campuses: Campus[] = [
  {
    "id": "campus-gz-sanyuanli",
    "name": "美迪时代教育广州三元里校区（总部）",
    "telephone": "13926257372",
    "streetAddress": "广州市越秀区三元里大道217号民生商业大厦3—4楼",
    "locality": "广州市",
    "region": "广东省",
    "city": "广州",
    "traffic": "地铁：广州地铁2号线三元里站A1出口；公交：三元里站（步行约50米）、桂花岗站（步行约500米）"
  },
  {
    "id": "campus-gz-kecun",
    "name": "美迪时代教育广州客村校区",
    "telephone": "13128290956",
    "streetAddress": "广州市海珠区新港中路356号丽影广场西区14楼1401（西区①/②门进入会展时代写字楼）",
    "locality": "广州市",
    "region": "广东省",
    "city": "广州",
    "traffic": "地铁：广州地铁3号线客村站D出口；公交：珠影站"
  },
  {
    "id": "campus-gz-huashi",
    "name": "美迪时代教育广州华师校区",
    "telephone": "13922498783",
    "streetAddress": "广州市天河区五山路141号尚德大厦五楼506室",
    "locality": "广州市",
    "region": "广东省",
    "city": "广州",
    "traffic": "地铁：广州地铁3号线/11号线华师站C出口；公交：师大后门站（步行约50米）"
  },
  {
    "id": "campus-gz-nanzhou",
    "name": "美迪时代教育广州南洲校区",
    "telephone": "18922386984",
    "streetAddress": "广州市海珠区南洲路154号侨建大厦4楼404",
    "locality": "广州市",
    "region": "广东省",
    "city": "广州",
    "traffic": "地铁：广州地铁2号线南洲站A出口"
  },
  {
    "id": "campus-sz-wuhe",
    "name": "美迪时代教育深圳五和校区（深圳总部）",
    "telephone": "13428890092",
    "streetAddress": "深圳市龙岗区坂田街道大发埔社区新安街11号A栋101美迪电商",
    "locality": "深圳市",
    "region": "广东省",
    "city": "深圳",
    "traffic": "地铁：深圳地铁5号线/10号线五和站D1出口；公交：五和地铁站"
  },
  {
    "id": "campus-sz-ailian",
    "name": "美迪时代教育深圳爱联校区",
    "telephone": "18126098365",
    "streetAddress": "深圳市龙岗区爱华路13号中粮祥云广场2栋A座1308-1309室",
    "locality": "深圳市",
    "region": "广东省",
    "city": "深圳",
    "traffic": "地铁：深圳地铁3号线爱联站D出口；公交：中粮祥云站"
  },
  {
    "id": "campus-sz-fuyong",
    "name": "美迪时代教育深圳福永校区",
    "telephone": "18938091843",
    "streetAddress": "深圳市宝安区福海大道24号中阳商务大厦2楼201室",
    "locality": "深圳市",
    "region": "广东省",
    "city": "深圳",
    "traffic": "地铁：深圳地铁11号线/12号线福永站F出口；公交：福永地铁站1站"
  },
  {
    "id": "campus-dg-dongcheng",
    "name": "美迪时代教育东莞东城校区",
    "telephone": "18617228575",
    "streetAddress": "东莞市东城区君豪商业中心21楼2101A室",
    "locality": "东莞市",
    "region": "广东省",
    "city": "东莞",
    "traffic": "地铁：东莞地铁2号线东城站A出口，出地铁站左转30米即可到达；公交：东城地铁站 / 香槟时代站 / 世博广场站"
  },
  {
    "id": "campus-dg-houjie",
    "name": "美迪时代教育东莞厚街校区",
    "telephone": "15362852806",
    "streetAddress": "东莞市厚街镇寮厦村北环路一号康美鞋城八楼805—808室",
    "locality": "东莞市",
    "region": "广东省",
    "city": "东莞",
    "traffic": "地铁：东莞地铁2号线寮厦站A出口（步行约200米）；公交：寮厦路口站（步行约100米）"
  },
  {
    "id": "campus-fs-ronggui",
    "name": "美迪时代教育佛山容桂校区",
    "telephone": "18022746526",
    "streetAddress": "佛山市顺德区容桂镇桂洲大道西1号领汇广场大厦15楼1503A室",
    "locality": "佛山市",
    "region": "广东省",
    "city": "佛山",
    "traffic": "公交：百昌大厦站（步行约80米）/ 幸福居委会站（步行约178米）/ 旧桂洲医院站（步行约100米）"
  },
  {
    "id": "campus-fs-zumiao",
    "name": "美迪时代教育佛山祖庙校区",
    "telephone": "18818720067",
    "streetAddress": "佛山市禅城区祖庙路46号华辉大厦2503室",
    "locality": "佛山市",
    "region": "广东省",
    "city": "佛山",
    "traffic": "地铁：广佛线祖庙站D出口（步行约20米）；公交：祖庙站（步行约20米）"
  },
  {
    "id": "campus-jm-jianghai",
    "name": "美迪时代教育江门江海校区",
    "telephone": "13360207784",
    "streetAddress": "江门市江海区南山路333号产业加速园综合楼B座2号电梯6楼",
    "locality": "江门市",
    "region": "广东省",
    "city": "江门",
    "traffic": "公交：117路（连海路南方向）至龙溪湖公园站，步行约60米进园区即达"
  },
  {
    "id": "campus-zs-xiaolan",
    "name": "美迪时代教育中山小榄校区",
    "telephone": "13380893272",
    "streetAddress": "中山市小榄镇升平中路10号小榄金融中心7楼708—709室",
    "locality": "中山市",
    "region": "广东省",
    "city": "中山",
    "traffic": "公交：小榄大信公交站"
  }
];
