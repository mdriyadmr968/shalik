import { AlertType } from '../../../core/data/models/Alert';

export interface ActionTemplate {
  templateId: string;
  alertType: AlertType;
  targetCrop: string;
  growthStage: string;
  titleBn: string;
  actionStepsBn: string[];
  urgencyNoteBn: string;
  titleEn: string;
  actionStepsEn: string[];
  urgencyNoteEn: string;
}

export class AlertActionTemplates {
  private static readonly templates: ActionTemplate[] = [
    {
      templateId: 'act_flood_rice_mature',
      alertType: AlertType.FLOOD,
      targetCrop: 'ধান',
      growthStage: 'পাকা পর্যায় (৮০% পরিপক্ব)',
      titleBn: 'বন্যা পূর্ববর্তী পাকা ধান দ্রুত কর্তন ও সংরক্ষণ',
      actionStepsBn: [
        'জমির ধান ৮০ ভাগ পেকে গেলেই কালবিলম্ব না করে দ্রুত কেটে ফেলুন।',
        'কাটা ধান উঁচু স্থানে বা পাকা রাস্তায় এনে দ্রুত মাড়াই ও শুকাতে দিন।',
        'বীজ ধান শুকনো পলিথিন বা বায়ুরোধী ড্রামে সিল করে মাচার উপর সংরক্ষণ করুন।',
        'রাসায়নিক সার ও কীটনাশক মাটির সংস্পর্শ থেকে উঁচু মাচায় তুলে রাখুন।'
      ],
      urgencyNoteBn: 'জরুরি: পানি বৃদ্ধির পূর্বাভাসে নিম্নাঞ্চল প্লাবিত হওয়ার আগেই কর্তন শেষ করুন।',
      titleEn: 'Pre-Flood Rapid Harvest and Grain Protection',
      actionStepsEn: [
        'Harvest paddy immediately if 80% matured without waiting for complete ripening.',
        'Thresh harvested grain quickly and move to elevated roads or high ground for drying.',
        'Store seed grains in airtight polythene drums on raised bamboo platforms.',
        'Elevate chemical fertilizers and pesticides above potential flood levels.'
      ],
      urgencyNoteEn: 'Urgent: Complete harvest before low-lying river basins are submerged.'
    },
    {
      templateId: 'act_heat_rice_flowering',
      alertType: AlertType.HEAT,
      targetCrop: 'ধান',
      growthStage: 'ফুল ফোটা ও থোর পর্যায়',
      titleBn: 'তীব্র তাপপ্রবাহে ধানের চিটা রোধে সেচ ব্যবস্থাপনা',
      actionStepsBn: [
        'জমিতে সার্বক্ষণিক ৫ থেকে ৭ সেন্টিমিটার (ছিপছিপে) পানি ধরে রাখুন।',
        'সকাল ১০টা থেকে বিকাল ৩টার প্রখর রোদে জমিতে কোনো ধরনের কীটনাশক বা সার স্প্রে করবেন না।',
        'প্রয়োজনে পড়ন্ত বিকেলে বা ভোরে সেচ দিন যাতে মাটির তাপমাত্রা সহনশীল থাকে।',
        'বোরো ধানে পটাশ সারের হালকা স্প্রে (প্রতি লিটারে ১০ গ্রাম এমওপি) তাপ সহনশীলতা বাড়ায়।'
      ],
      urgencyNoteBn: 'সতর্কতা: তাপমাত্রা ৩৫° সেলসিয়াস অতিক্রম করলে ফুল পরাগায়ন ব্যাহত হয়ে চিটা হতে পারে।',
      titleEn: 'Irrigation Management to Prevent Chaffing in Extreme Heat',
      actionStepsEn: [
        'Maintain constant standing water of 5 to 7 cm across the paddy field.',
        'Avoid spraying pesticides or fertilizers during peak sun between 10 AM and 3 PM.',
        'Irrigate in late afternoon or early dawn to regulate soil and root temperature.',
        'Light spray of Potash fertilizer (10g MOP per liter of water) enhances heat tolerance.'
      ],
      urgencyNoteEn: 'Warning: Temperatures exceeding 35°C severely impede flower pollination.'
    },
    {
      templateId: 'act_heavy_rain_drainage',
      alertType: AlertType.HEAVY_RAIN,
      targetCrop: 'সবজি ও আলু',
      growthStage: 'সকল বৃদ্ধি পর্যায়',
      titleBn: 'ভারী বৃষ্টিতে জলাবদ্ধতা নিরসন ও নালা সংস্কার',
      actionStepsBn: [
        'জমির চারপাশের নিষ্কাশন নালাগুলো এখনই পরিষ্কার ও গভীর করুন যাতে পানি আটকে না থাকে।',
        'আলু ও শাকসবজির জমিতে পানি জমতে দেওয়া যাবে না, জমলে পচন রোগ দ্রুত ছড়িয়ে পড়ে।',
        'বৃষ্টির আগে কোনো ধরনের স্প্রে বা উপরি-প্রয়োগ সার দেবেন না, ধুয়ে অপচয় হবে।'
      ],
      urgencyNoteBn: 'দ্রুত নালা কেটে জমে থাকা পানি পাশের খালে নামিয়ে দিন।',
      titleEn: 'Field Drainage & Canal Clearing for Heavy Downpours',
      actionStepsEn: [
        'Deepen and clear field boundary drainage ditches to prevent standing water.',
        'Do not allow stagnant water in potato and vegetable beds to prevent collar rot.',
        'Avoid chemical sprays or top-dressing fertilizers prior to rainfall.'
      ],
      urgencyNoteEn: 'Quickly cut trenches to release trapped water into local canals.'
    },
    {
      templateId: 'act_cyclone_harvest',
      alertType: AlertType.CYCLONE,
      targetCrop: 'সকল ফসল',
      growthStage: 'পরিপক্ব পর্যায়',
      titleBn: 'ঘূর্ণিঝড় পূর্ববর্তী ফসল ও খামার সুরক্ষা',
      actionStepsBn: [
        'মাঠের সকল পরিপক্ব ফসল ও ফলমূল অনতিবিলম্বে সংগ্রহ করে নিরাপদ স্থানে আনুন।',
        'কলা বাগান, পেঁপে গাছ বা বেড়া দেওয়া ফসলে শক্ত বাঁশের খুঁটি দিয়ে বেঁধে দিন।',
        'গবাদি পশু ও হাঁস-মুরগি নিকটস্থ সাইক্লোন শেল্টারে বা উঁচু পাকা ভিটায় স্থানান্তর করুন।'
      ],
      urgencyNoteBn: 'বাতাস তীব্র হওয়ার আগেই মাঠের কাজ গুটিয়ে নিরাপদ আশ্রয়ে যান।',
      titleEn: 'Pre-Cyclone Crop & Farm Protection',
      actionStepsEn: [
        'Harvest and bring all mature fruits, crops, and vegetables indoors immediately.',
        'Tie banana trees, papaya stems, and trellis crops with sturdy bamboo supports.',
        'Relocate cattle and poultry to local cyclone shelters or elevated paved yards.'
      ],
      urgencyNoteEn: 'Wrap up field operations and take shelter before wind speeds intensify.'
    },
    {
      templateId: 'act_cold_potato_blight',
      alertType: AlertType.COLD,
      targetCrop: 'আলু',
      growthStage: 'কন্দ গঠন পর্যায়',
      titleBn: 'ঘন কুয়াশা ও শৈত্যপ্রবাহে আলুর নাবি ধসা প্রতিরোধ',
      actionStepsBn: [
        'টানা ঘন কুয়াশা ও মেঘলা আবহাওয়ায় জমিতে সেচ দেওয়া সাময়িক বন্ধ রাখুন।',
        'লক্ষণ প্রকাশের আগেই সতর্কতামূলক মেনকোজেব গ্রুপের ছত্রাকনাশক (যেমন ডাইথেন এম-৪৫ প্রতি লিটারে ২ গ্রাম) কুয়াশা কাটার পর স্প্রে করুন।',
        'আক্রান্ত গাছ দেখা মাত্রই উপড়ে ফেলে মাটির নিচে পুঁতে ফেলুন।'
      ],
      urgencyNoteBn: 'কুয়াশা ভেজা পাতায় ছত্রাক দ্রুত ছড়ায়, পাতা শুকনা অবস্থায় স্প্রে করুন।',
      titleEn: 'Potato Late Blight Prevention during Dense Fog & Cold Waves',
      actionStepsEn: [
        'Temporarily suspend irrigation during continuous heavy fog and overcast skies.',
        'Apply preventive Mancozeb spray (e.g. Dithane M-45, 2g/L) once fog clears in daytime.',
        'Immediately uproot and bury any infected plants showing late blight lesions.'
      ],
      urgencyNoteEn: 'Fungus spreads rapidly on wet foliage; only spray when leaves are dry.'
    },
    {
      templateId: 'act_drought_awd_irrigation',
      alertType: AlertType.DROUGHT,
      targetCrop: 'ধান ও রবি ফসল',
      growthStage: 'বৃদ্ধি পর্যায়',
      titleBn: 'খরা ও অনাবৃষ্টিতে এডব্লিউডি (AWD) সেচ ব্যবস্থাপনা',
      actionStepsBn: [
        'জমিতে অল্টারনেট ওয়েটিং অ্যান্ড ড্রায়িং (AWD) পাইপ বসিয়ে পর্যায়ক্রমিক সেচ দিন।',
        'পড়ন্ত বিকেলে বা রাতে সেচ প্রদান করুন যাতে বাষ্পীভবনে পানির অপচয় কম হয়।',
        'ক্ষেতে জৈব মালচিং বা খড় বিছিয়ে মাটির আর্দ্রতা ধরে রাখুন।'
      ],
      urgencyNoteBn: 'সতর্কতা: তীব্র খরায় মাটি ফেটে শিকড় ক্ষতিগ্রস্ত হতে দেবেন না।',
      titleEn: 'AWD Alternate Wetting & Drying Irrigation for Drought',
      actionStepsEn: [
        'Implement Alternate Wetting and Drying (AWD) pipes to conserve critical water.',
        'Irrigate during dusk or late evening to minimize evaporation losses.',
        'Apply straw mulching to conserve topsoil moisture around roots.'
      ],
      urgencyNoteEn: 'Warning: Prevent soil cracking to safeguard root systems.'
    },
    {
      templateId: 'act_general_pest_spray',
      alertType: AlertType.PEST,
      targetCrop: 'সকল ফসল',
      growthStage: 'সকল পর্যায়',
      titleBn: 'আঞ্চলিক রোগ ও পোকা-মাকড়ের সমন্বিত দমন ব্যবস্থা',
      actionStepsBn: [
        'আক্রান্ত গাছের পাতা ও ডাল সাবধানে কেটে মাটির নিচে পুঁতে ফেলুন।',
        'জমিতে আলোর ফাঁদ ও সেক্স ফেরোমোন ফাঁদ স্থাপন করে পোকার উপস্থিতি যাচাই করুন।',
        'প্রয়োজনে নিকটস্থ উপ-সহকারী কৃষি কর্মকর্তা (SAAO)-এর পরামর্শে অনুমোদিত বালাইনাশক নির্দেশিত মাত্রায় স্প্রে করুন।'
      ],
      urgencyNoteBn: 'জরুরি: কোনো নিষিদ্ধ বা অনিবন্ধিত কীটনাশক প্রয়োগ করবেন না।',
      titleEn: 'Integrated Pest & Disease Management Protocol',
      actionStepsEn: [
        'Prune affected leaves and foliage and bury them deep underground.',
        'Deploy light traps and pheromone traps to monitor pest population.',
        'Consult local SAAO officer for approved pesticides and safe dosage rates.'
      ],
      urgencyNoteEn: 'Urgent: Never apply banned or unregistered agrochemicals.'
    }
  ];

  public static getTemplatesForAlert(alertType: AlertType, crop: string = 'ধান'): ActionTemplate[] {
    const matched = AlertActionTemplates.templates.filter(
      t =>
        t.alertType === alertType &&
        (t.targetCrop.includes(crop) ||
          t.targetCrop === 'সকল ফসল' ||
          t.targetCrop === 'All Crops')
    );
    if (matched.length > 0) return matched;

    const directType = AlertActionTemplates.templates.filter(t => t.alertType === alertType);
    if (directType.length > 0) return directType;

    if (alertType === AlertType.FLASH_FLOOD) {
      return AlertActionTemplates.getTemplatesForAlert(AlertType.FLOOD, crop);
    }
    if (alertType === AlertType.DISEASE_OUTBREAK) {
      return AlertActionTemplates.getTemplatesForAlert(AlertType.PEST, crop);
    }

    return AlertActionTemplates.templates.filter(t => t.alertType === AlertType.HEAVY_RAIN);
  }

  public static getTemplateById(id: string): ActionTemplate | null {
    return AlertActionTemplates.templates.find(t => t.templateId === id) || null;
  }
}
