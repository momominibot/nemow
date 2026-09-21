/* ══════════════════════════════════════════════════════════════
   OVULUNA · i18n — Multi-language support
   Reads saved language from localStorage, provides t() lookup.
   Currently supports: en, zh, ja, ms, es
   ══════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  var LANG = 'en';
  try {
    LANG = localStorage.getItem('ovuluna_language') || 'en';
  } catch (e) {}

  var DICT = {
    /* ── Chinese (zh) ── */
    zh: {
      /* Sections */
      'Welcome': '欢迎',
      'About You': '关于你',
      'Your Cycle': '你的周期',
      'Family History': '家族史',
      'Lifestyle': '生活方式',
      'Your Goals': '你的目标',
      'Your Profile': '你的档案',
      'All Set': '完成',
      /* Buttons / UI */
      'Continue': '继续',
      'Skip': '跳过',
      'Next': '下一步',
      'Get Started': '开始',
      'Finish': '完成',
      'years': '岁',
      'days': '天',
      'cm': '厘米',
      'kg': '公斤',
      /* Welcome / intro */
      'Your ovarian wellness journey begins here': '你的卵巢健康之旅从这里开始',
      'A few gentle questions to personalize your experience. Takes about 2 minutes.': '几个简单的问题来个性化你的体验，大约需要2分钟。',
      'Choose your language': '选择你的语言',
      'Select your preferred language. You can change this anytime in settings.': '选择你偏好的语言。你可以随时在设置中更改。',
      /* About you */
      'How old are you?': '你几岁了？',
      'We use this to contextualize your cycle and ovarian wellness stage.': '我们用这个来了解你的周期和卵巢健康阶段。',
      'Your height and weight': '你的身高和体重',
      'This helps us calculate your daily water goal and activity targets.': '这帮助我们计算你的每日饮水目标和活动量。',
      /* Cycle */
      'How would you describe your cycle?': '你的月经周期情况如何？',
      'This helps us understand your current reproductive stage.': '这帮助我们了解你当前的生殖阶段。',
      'Regular cycles': '规律周期',
      'Predictable 21-35 day cycles': '可预测的21-35天周期',
      'Variable / irregular': '不规律',
      'Cycle length varies by 7+ days': '周期长度相差7天以上',
      'Just started my period': '初潮不久',
      'Cycles still regulating (first 2-3 years)': '周期仍在调节中（初潮后2-3年）',
      'Skipped periods': '偶有停经',
      'Occasionally miss periods': '偶尔不来月经',
      'On hormonal contraception': '正在使用激素避孕',
      'Pill, IUD, implant, or ring': '避孕药、宫内节育器、植入剂或避孕环',
      'Post-menopause': '已绝经',
      'No period for 12+ months': '停经12个月以上',
      'Average cycle length?': '平均周期长度？',
      'From the first day of one period to the first day of the next.': '从一次月经第一天到下一次月经第一天。',
      'When did your last period start?': '你上次月经什么时候开始？',
      'Tap the date on the calendar.': '在日历上点击日期。',
      'How old were you at your first period?': '你初潮时几岁？',
      'Early or late menarche can affect your cycle pattern. Optional — skip if unsure.': '初潮早晚可能影响周期模式。选填——不确定可跳过。',
      /* Family history */
      'At what age did your mother reach menopause?': '你母亲多大年龄绝经？',
      'Family history is one of the strongest predictors of your own menopause timing.': '家族史是预测你绝经时间的最强因素之一。',
      /* Lifestyle */
      'Do you smoke?': '你吸烟吗？',
      'Smoking is associated with earlier menopause and reduced ovarian reserve.': '吸烟与提前绝经和卵巢储备减少有关。',
      'Never smoked': '从不吸烟',
      'Former smoker': '曾吸烟',
      'Current smoker': '现在吸烟',
      'How would you rate your sleep?': '你的睡眠质量如何？',
      'Poor sleep disrupts circadian rhythms and hormone balance.': '睡眠不足会扰乱昼夜节律和激素平衡。',
      'Good — 7-9h, consistent': '良好——7-9小时，规律',
      'Fair — mostly okay': '一般——大致可以',
      'Poor — trouble sleeping': '较差——睡眠困难',
      'Do you work night shifts or have irregular sleep hours?': '你是否轮夜班或作息不规律？',
      'Circadian disruption can affect menstrual regularity and ovarian function.': '昼夜节律紊乱会影响月经规律和卵巢功能。',
      'No — regular schedule': '没有——作息规律',
      'Occasionally': '偶尔',
      'Often / night shifts': '经常/夜班',
      'How active are you?': '你的活动量如何？',
      'We use this to set your daily movement and calorie goals.': '我们用这个来设定你的每日活动和热量目标。',
      'Mostly sedentary': '基本久坐',
      'Little or no exercise': '几乎不运动',
      'Lightly active': '轻度活动',
      'Light exercise 1-3 days/week': '轻度运动每周1-3天',
      'Moderately active': '中度活动',
      'Moderate exercise 3-5 days/week': '中度运动每周3-5天',
      'Very active': '高度活动',
      'Hard exercise 6-7 days/week': '高强度运动每周6-7天',
      /* Goals */
      'What are your main goals?': '你的主要目标是什么？',
      'Select all that apply. We will personalize your experience accordingly.': '选择所有适用项。我们将据此个性化你的体验。',
      'Overall wellness': '整体健康',
      'Cycle tracking': '周期追踪',
      'Cycle education & body literacy': '周期教育与身体认知',
      'Mental health & stress': '心理健康与压力',
      'Sports & performance': '运动与表现',
      'Fertility / trying to conceive': '生育/备孕',
      'Perimenopause support': '围绝经期支持',
      'Hormone balance': '激素平衡',
      'Ovarian longevity / anti-aging': '卵巢长寿/抗衰',
      'Any dietary preferences?': '有饮食偏好吗？',
      'We will tailor food recommendations to your preferences.': '我们将根据你的偏好定制饮食建议。',
      'No restrictions': '无限制',
      'Vegetarian': '素食',
      'Vegan': '纯素',
      'Pescatarian': '鱼素',
      'Gluten-free': '无麸质',
      'Dairy-free': '无乳制品',
      /* Finish */
      'We are crafting your personalized experience': '正在为你打造个性化体验',
      'Welcome to Ovuluna': '欢迎来到 Ovuluna',
      'Your personalized ovarian wellness experience is ready.': '你的个性化卵巢健康体验已就绪。'
    },
    /* ── Japanese (ja) ── */
    ja: {
      'Welcome': 'ようこそ',
      'About You': 'あなたについて',
      'Your Cycle': 'あなたの周期',
      'Family History': '家族歴',
      'Lifestyle': 'ライフスタイル',
      'Your Goals': 'あなたの目標',
      'All Set': '完了',
      'Continue': '続ける',
      'Skip': 'スキップ',
      'Next': '次へ',
      'years': '歳',
      'days': '日',
      'How old are you?': '何歳ですか？',
      'Your height and weight': '身長と体重',
      'How would you describe your cycle?': '生理周期をどのように説明しますか？',
      'Regular cycles': '規則的な周期',
      'Variable / irregular': '不規則',
      'Just started my period': '初潮を迎えたばかり',
      'Skipped periods': '生理が来ないことがある',
      'On hormonal contraception': 'ホルモン避妊薬を使用中',
      'Post-menopause': '閉経後',
      'Average cycle length?': '平均周期日数は？',
      'When did your last period start?': '最後の生理はいつ始まりましたか？',
      'How old were you at your first period?': '初潮は何歳でしたか？',
      'At what age did your mother reach menopause?': 'お母様は何歳で閉経しましたか？',
      'Do you smoke?': '喫煙しますか？',
      'How would you rate your sleep?': '睡眠の質はいかがですか？',
      'How active are you?': 'どの程度活動的ですか？',
      'What are your main goals?': '主な目標は何ですか？',
      'Overall wellness': '全体的な健康',
      'Cycle tracking': '周期トラッキング',
      'Fertility / trying to conceive': '妊活',
      'Perimenopause support': '更年期サポート',
      'Hormone balance': 'ホルモンバランス',
      'Ovarian longevity / anti-aging': '卵巣のアンチエイジング',
      'Vegetarian': 'ベジタリアン',
      'Vegan': 'ヴィーガン',
      'Welcome to Ovuluna': 'Ovulunaへようこそ'
    },
    /* ── Bahasa Melayu (ms) ── */
    ms: {
      'Welcome': 'Selamat Datang',
      'About You': 'Tentang Anda',
      'Your Cycle': 'Kitaran Anda',
      'Family History': 'Sejarah Keluarga',
      'Lifestyle': 'Gaya Hidup',
      'Your Goals': 'Matlamat Anda',
      'All Set': 'Selesai',
      'Continue': 'Teruskan',
      'Skip': 'Langkau',
      'How old are you?': 'Berapa umur anda?',
      'Your height and weight': 'Tinggi dan berat badan',
      'How would you describe your cycle?': 'Bagaimana kitaran haid anda?',
      'Regular cycles': 'Kitaran tetap',
      'Variable / irregular': 'Tidak teratur',
      'Post-menopause': 'Lepas menopaus',
      'Do you smoke?': 'Adakah anda merokok?',
      'How active are you?': 'Sejmanakah aktif anda?',
      'What are your main goals?': 'Apakah matlamat utama anda?',
      'Welcome to Ovuluna': 'Selamat datang ke Ovuluna'
    },
    /* ── Spanish (es) ── */
    es: {
      'Welcome': 'Bienvenida',
      'About You': 'Sobre ti',
      'Your Cycle': 'Tu ciclo',
      'Family History': 'Historial familiar',
      'Lifestyle': 'Estilo de vida',
      'Your Goals': 'Tus metas',
      'All Set': 'Listo',
      'Continue': 'Continuar',
      'Skip': 'Saltar',
      'How old are you?': '¿Cuántos años tienes?',
      'Your height and weight': 'Tu altura y peso',
      'How would you describe your cycle?': '¿Cómo describirías tu ciclo?',
      'Regular cycles': 'Ciclos regulares',
      'Variable / irregular': 'Irregular',
      'Post-menopause': 'Posmenopausia',
      'Do you smoke?': '¿Fumas?',
      'How active are you?': '¿Qué tan activa eres?',
      'What are your main goals?': '¿Cuáles son tus principales metas?',
      'Welcome to Ovuluna': 'Bienvenida a Ovuluna'
    }
  };

  function t(str) {
    if (LANG === 'en') return str;
    var dict = DICT[LANG];
    if (!dict) return str;
    return dict[str] || str;
  }

  window.OVULUNA_I18N = { t: t, lang: LANG };
})();
