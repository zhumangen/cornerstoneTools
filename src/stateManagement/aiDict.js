const aiDictData = [
  {
    code: 'FeiBuGanRan',
    name: {
      cn: '肺部感染',
      en: 'Pulmonary infection'
    }
  },
  {
    code: 'ChenJiuBingZao',
    name: {
      cn: '陈旧病灶',
      en: 'Obsolete lesion'
    }
  },
  {
    code: 'XiongMoZengHou',
    name: {
      cn: '胸膜增厚',
      en: 'Pleural thickening'
    }
  },
  {
    code: 'XinYingZengDa',
    name: {
      cn: '心影增大',
      en: 'Cardiomegaly'
    }
  },
  {
    code: 'XiongQiangJiYe',
    name: {
      cn: '胸腔积液',
      en: 'Pleural effusion'
    }
  },
  {
    code: 'ManZhiFeiQiZhong',
    name: {
      cn: '慢支肺气肿',
      en: 'Chronic bronchitis & Emphysema'
    }
  },
  {
    code: 'FeiQiZhong',
    name: {
      cn: '肺气肿',
      en: 'Emphysema'
    }
  },
  {
    code: 'ZhiQiGuanFeiYan',
    name: {
      cn: '支气管肺炎',
      en: 'Bronchopneumonia'
    }
  },
  {
    code: 'ZhiQiGuanYuan',
    name: {
      cn: '支气管炎',
      en: 'Pulmonary infection'
    }
  },
  {
    code: 'JieJieBingZao(<3cm)',
    name: {
      cn: '结节病灶(<3cm)',
      en: 'Nodule'
    }
  },
  {
    code: 'KeYiBingBian',
    name: {
      cn: '可疑病变',
      en: 'Suspicious lesions'
    }
  },
  {
    code: 'ChenJiuXingBingZaoBanGanRan',
    name: {
      cn: '陈旧性病灶伴感染',
      en: 'Obsolete lesion & Infection'
    }
  },
  {
    code: 'ManZhiBanGanRan',
    name: {
      cn: '慢支伴感染',
      en: 'Chronic bronchitis & Infection'
    }
  },
  {
    code: 'LeiGuGuZhe',
    name: {
      cn: '肋骨骨折',
      en: 'Rib fracture'
    }
  },
  {
    code: 'FeiBuZhongKuai(>=3cm)',
    name: {
      cn: '肺部肿块(>=3cm)',
      en: 'Mass'
    }
  },
  {
    code: 'JianZhiXingGaiBian',
    name: {
      cn: '间质性改变',
      en: 'Interstitial change'
    }
  },
  {
    code: 'XiongKuoTaXian',
    name: {
      cn: '胸廓塌陷',
      en: 'Thoracic collapse'
    }
  },
  {
    code: 'SuoGuGuZhe',
    name: {
      cn: '锁骨骨折',
      en: 'Clavicle fracture'
    }
  },
  {
    code: 'JianZhiXingGaiBianBanGanRan',
    name: {
      cn: '间质性改变伴感染',
      en: 'Interstitial change with infection'
    }
  },
  {
    code: 'SuLiBingZao',
    name: {
      cn: '粟粒性病灶',
      en: 'Miliary lesions'
    }
  },
  {
    code: 'KongDong',
    name: {
      cn: '空洞',
      en: 'Cavity'
    }
  },
  {
    code: 'FeiBuZhang',
    name: {
      cn: '肺不张',
      en: 'Atelectasis'
    }
  },
  {
    code: 'ZhiKuoBanGanRan',
    name: {
      cn: '支扩伴感染',
      en: 'Bronchiectasis & Infection'
    }
  },
  {
    code: 'FeiQiZhongBanGanRan',
    name: {
      cn: '肺气肿伴感染',
      en: 'Emphysema & Infection'
    }
  },
  {
    code: 'FeiDaPao',
    name: {
      cn: '肺大泡',
      en: 'Lung bullae'
    }
  },
  {
    code: 'QiXiong',
    name: {
      cn: '气胸',
      en: 'Pneumothorax'
    }
  },
  {
    code: 'XiongBuShuHou',
    name: {
      cn: '胸部术后',
      en: 'Thoracic Surgery'
    }
  },
  {
    code: 'ZhiKuo',
    name: {
      cn: '支扩',
      en: 'Bronchiectasis'
    }
  },
  {
    code: 'YeQiXiong',
    name: {
      cn: '液气胸',
      en: 'Hydropneumothorax'
    }
  },
  {
    code: 'JiZhuCeWan',
    name: {
      cn: '脊柱侧弯',
      en: 'Scoliosis'
    }
  },
  {
    code: 'ChenJiuXingBingZaoBanFeiQiZhong',
    name: {
      cn: '陈旧性病灶伴肺气肿',
      en: 'Obsolete lesion & Emphysema'
    }
  },
  {
    code: 'KongQiang',
    name: {
      cn: '空腔',
      en: 'Cyst'
    }
  },
  {
    code: 'ZongGeZhongLiu',
    name: {
      cn: '纵膈肿瘤',
      en: 'Mediastinal tumor'
    }
  }
];

function getCodeName (code) {
  let i = 0;

  for (; i < aiDictData.length; ++i) {
    const item = aiDictData[i];

    if (item.code === code) {
      return item.name;
    }
  }

  return {};
}

const aiDict = {
  getCodeName
};

export default aiDict;
