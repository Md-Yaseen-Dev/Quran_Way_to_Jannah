
// Comprehensive Topic Mapping Tool
// This script helps create systematic mappings of all Quran verses to relevant topics

const comprehensiveTopics = {
  // Core Beliefs & Theology
  'allah-attributes': {
    name: 'Allah\'s Names & Attributes (Asma ul-Husna)',
    keywords: ['الله', 'رب', 'الرحمن', 'الرحيم', 'الغفور', 'العليم', 'القدير', 'الحكيم']
  },
  'tawhid-monotheism': {
    name: 'Monotheism & Unity of Allah (Tawhid)',
    keywords: ['لا إله إلا', 'واحد', 'أحد', 'وحده', 'شريك']
  },
  'prophets-messengers': {
    name: 'All Prophets & Messengers',
    keywords: ['نبي', 'رسول', 'إبراهيم', 'موسى', 'عيسى', 'نوح', 'يوسف', 'داود', 'سليمان']
  },
  'scriptures-books': {
    name: 'Divine Books & Scriptures',
    keywords: ['قرآن', 'كتاب', 'توراة', 'إنجيل', 'زبور', 'صحف']
  },
  
  // Worship & Rituals
  'salah-prayer': {
    name: 'Prayer & Worship (Salah)',
    keywords: ['صلاة', 'صلوا', 'يصلي', 'ركع', 'سجد', 'قيام', 'قبلة']
  },
  'zakat-charity': {
    name: 'Charity & Zakat',
    keywords: ['زكاة', 'صدقة', 'انفق', 'ينفق', 'فقير', 'مسكين', 'يتيم']
  },
  'hajj-pilgrimage': {
    name: 'Hajj & Pilgrimage',
    keywords: ['حج', 'عمرة', 'بيت', 'حرام', 'كعبة', 'مكة', 'طواف', 'سعي']
  },
  'fasting-sawm': {
    name: 'Fasting (Sawm)',
    keywords: ['صوم', 'صيام', 'رمضان', 'إفطار', 'سحور']
  },
  
  // Eschatology
  'afterlife-akhirah': {
    name: 'Afterlife & Hereafter (Akhirah)',
    keywords: ['آخرة', 'بعث', 'نشر', 'حساب', 'ميزان']
  },
  'resurrection': {
    name: 'Resurrection & Day of Rising',
    keywords: ['قيامة', 'بعث', 'نشور', 'صور', 'نفخ']
  },
  'judgment-day': {
    name: 'Day of Judgment (Yawm al-Din)',
    keywords: ['يوم الدين', 'حساب', 'ميزان', 'صراط']
  },
  'paradise-jannah': {
    name: 'Paradise (Jannah)',
    keywords: ['جنة', 'جنات', 'فردوس', 'نعيم', 'أنهار', 'حور']
  },
  'hell-jahannam': {
    name: 'Hell (Jahannam)',
    keywords: ['جهنم', 'نار', 'سعير', 'جحيم', 'حطمة']
  },
  
  // Ethics & Morality
  'moral-conduct': {
    name: 'Moral Conduct & Character',
    keywords: ['أخلاق', 'بر', 'تقوى', 'عدل', 'إحسان', 'صبر']
  },
  'social-justice': {
    name: 'Social Justice & Equality',
    keywords: ['عدل', 'قسط', 'ظلم', 'مساواة', 'حقوق']
  },
  'honesty-truth': {
    name: 'Honesty & Truthfulness',
    keywords: ['صدق', 'حق', 'كذب', 'بهتان', 'إفك']
  },
  
  // Personal Development
  'patience-perseverance': {
    name: 'Patience & Perseverance (Sabr)',
    keywords: ['صبر', 'صابر', 'اصبر', 'جاهد', 'ثبت']
  },
  'gratitude-thankfulness': {
    name: 'Gratitude & Thankfulness (Shukr)',
    keywords: ['شكر', 'حمد', 'نعمة', 'فضل']
  },
  'repentance-forgiveness': {
    name: 'Repentance & Forgiveness (Tawbah)',
    keywords: ['توبة', 'استغفار', 'غفر', 'رحمة', 'عفو']
  },
  'trust-reliance': {
    name: 'Trust & Reliance on Allah (Tawakkul)',
    keywords: ['توكل', 'ثقة', 'اعتماد', 'حسب']
  },
  
  // Social Relations
  'family-kinship': {
    name: 'Family & Kinship Relations',
    keywords: ['والدين', 'أم', 'أب', 'أخ', 'أخت', 'زوج', 'أولاد']
  },
  'marriage-divorce': {
    name: 'Marriage & Divorce',
    keywords: ['نكاح', 'زواج', 'طلاق', 'عدة', 'مهر']
  },
  'children-parenting': {
    name: 'Children & Parenting',
    keywords: ['أولاد', 'بنين', 'بنات', 'تربية', 'رضاع']
  },
  'neighbors-community': {
    name: 'Neighbors & Community Relations',
    keywords: ['جار', 'مجتمع', 'قوم', 'أمة', 'إخوة']
  },
  
  // Knowledge & Wisdom
  'knowledge-learning': {
    name: 'Knowledge & Learning (Ilm)',
    keywords: ['علم', 'تعلم', 'حكمة', 'فهم', 'عقل']
  },
  'reflection-contemplation': {
    name: 'Reflection & Contemplation (Tafakkur)',
    keywords: ['تفكر', 'تدبر', 'عبرة', 'آية', 'دليل']
  },
  
  // Economic & Legal
  'wealth-poverty': {
    name: 'Wealth & Poverty',
    keywords: ['مال', 'غني', 'فقر', 'كنز', 'رزق']
  },
  'business-trade': {
    name: 'Business & Trade',
    keywords: ['تجارة', 'بيع', 'شراء', 'ربا', 'دين']
  },
  'inheritance-legacy': {
    name: 'Inheritance & Legacy (Mirath)',
    keywords: ['وراثة', 'ميراث', 'وصية', 'تركة']
  },
  'legal-rulings': {
    name: 'Legal Rulings & Jurisprudence',
    keywords: ['حكم', 'شرع', 'فقه', 'حلال', 'حرام']
  },
  
  // Natural World & Science
  'creation-universe': {
    name: 'Creation & Universe',
    keywords: ['خلق', 'سماوات', 'أرض', 'شمس', 'قمر', 'نجوم']
  },
  'animals-nature': {
    name: 'Animals & Natural World',
    keywords: ['دابة', 'طير', 'بحر', 'نهر', 'جبل', 'شجر']
  },
  'time-seasons': {
    name: 'Time & Seasons',
    keywords: ['يوم', 'ليل', 'صباح', 'مساء', 'شهر', 'سنة']
  },
  
  // Historical Narratives
  'past-nations': {
    name: 'Past Nations & Civilizations',
    keywords: ['قوم', 'أمة', 'قرية', 'مدينة', 'ملك', 'فرعون']
  },
  'prophetic-stories': {
    name: 'Prophetic Stories & Lessons',
    keywords: ['قصة', 'حديث', 'خبر', 'أنبأ', 'حكاية']
  },
  
  // Spiritual States
  'fear-hope': {
    name: 'Fear & Hope (Khawf wa Raja)',
    keywords: ['خوف', 'رجاء', 'أمل', 'رهبة', 'رغبة']
  },
  'love-devotion': {
    name: 'Love & Devotion (Hubb)',
    keywords: ['حب', 'ود', 'عشق', 'شوق', 'قرب']
  },
  'remembrance-dhikr': {
    name: 'Remembrance of Allah (Dhikr)',
    keywords: ['ذكر', 'سبح', 'حمد', 'تسبيح', 'تحميد']
  }
};

// Function to systematically categorize all verses
function generateComprehensiveMapping() {
  // This would be used with the full Arabic text to create comprehensive mappings
  console.log('Comprehensive topic structure created');
  console.log('Total topics defined:', Object.keys(comprehensiveTopics).length);
  
  // The actual implementation would:
  // 1. Load all Arabic verses from arabic-text.json
  // 2. For each verse, check which topic keywords it contains
  // 3. Assign verses to multiple relevant topics
  // 4. Ensure every verse is assigned to at least one topic
  // 5. Generate the final comprehensive topics.json
  
  return comprehensiveTopics;
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { comprehensiveTopics, generateComprehensiveMapping };
}
