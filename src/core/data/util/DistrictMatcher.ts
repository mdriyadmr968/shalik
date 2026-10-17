/**
 * Normalizes and matches districts between English and Bengali names
 * across Bangladesh's 64 administrative districts.
 */
export class DistrictMatcher {
  private static readonly districtMap: Record<string, string> = {
    kurigram: 'কুড়িগ্রাম',
    sirajganj: 'সিরাজগঞ্জ',
    rajshahi: 'রাজশাহী',
    sylhet: 'সিলেট',
    rangpur: 'রংপুর',
    dinajpur: 'দিনাজপুর',
    gaibandha: 'গাইবান্ধা',
    dhaka: 'ঢাকা',
    chattogram: 'চট্টগ্রাম',
    chittagong: 'চট্টগ্রাম',
    barishal: 'বরিশাল',
    barisal: 'বরিশাল',
    khulna: 'খুলনা',
    mymensingh: 'ময়মনসিংহ',
    bogura: 'বগুড়া',
    bogra: 'বগুড়া',
    pabna: 'পাবনা',
    chuadanga: 'চুয়াডাঙ্গা',
    sunamganj: 'সুনামগঞ্জ',
    habiganj: 'হবিগঞ্জ',
    bhola: 'ভোলা',
    patuakhali: 'পটুয়াখালী',
    barguna: 'বরগুনা',
    naogaon: 'নওগাঁ',
    'chapai nawabganj': 'চাঁপাইনবাবগঞ্জ',
    chapainawabganj: 'চাঁপাইনবাবগঞ্জ',
    comilla: 'কুমিল্লা',
    cumilla: 'কুমিল্লা',
    noakhali: 'নোয়াখালী',
    feni: 'ফেনী',
    coxsbazar: 'কক্সবাজার',
    'cox\'s bazar': 'কক্সবাজার',
    tangail: 'টাঙ্গাইল',
    jashore: 'যশোর',
    jessore: 'যশোর',
    kushtia: 'কুষ্টিয়া',
    faridpur: 'ফরিদপুর',
    netrokona: 'নেত্রকোণা',
    jamalpur: 'জামালপুর',
    sherpur: 'শেরপুর',
    lalmonirhat: 'লালমনিরহাট',
    nilphamari: 'নীলফামারী',
    thakurgaon: 'ঠাকুরগাঁও',
    panchagarh: 'পঞ্চগড়',
    natore: 'নাটোর',
    joypurhat: 'জয়পুরহাট',
    satkhira: 'সাতক্ষীরা',
    bagerhat: 'বাগেরহাট',
    meherpur: 'মেহেরপুর',
    jhenaidah: 'ঝিনাইদহ',
    magura: 'মাগুরা',
    narail: 'নড়াইল',
    pirojpur: 'পিরোজপুর',
    jhalokathi: 'ঝালকাঠি',
    brahmanbaria: 'ব্রাহ্মণবাড়িয়া',
    chandpur: 'চাঁদপুর',
    lakshmipur: 'লক্ষ্মীপুর',
    moulvibazar: 'মৌলভীবাজার',
    gazipur: 'গাজীপুর',
    narayanganj: 'নারায়ণগঞ্জ',
    narsingdi: 'নরসিংদী',
    manikganj: 'মানিকগঞ্জ',
    munshiganj: 'মুন্সীগঞ্জ',
    rajbari: 'রাজবাড়ী',
    madaripur: 'মাদারীপুর',
    gopalganj: 'গোপালগঞ্জ',
    shariatpur: 'শরীয়তপুর',
    kishoreganj: 'কিশোরগঞ্জ'
  };

  /**
   * Checks whether districtCodesCsv contains the given queryDistrict,
   * supporting both English and Bengali spellings and case insensitivity.
   */
  public static matches(districtCodesCsv: string, queryDistrict: string): boolean {
    if (!districtCodesCsv || !queryDistrict) return false;

    const cleanQuery = queryDistrict.trim().toLowerCase();
    const cleanCsv = districtCodesCsv.trim().toLowerCase();

    // Direct substring match
    if (cleanCsv.includes(cleanQuery)) {
      return true;
    }

    // Bidirectional translation check
    for (const [en, bn] of Object.entries(DistrictMatcher.districtMap)) {
      if (cleanQuery === en || cleanQuery === bn) {
        if (cleanCsv.includes(en) || cleanCsv.includes(bn)) {
          return true;
        }
      }
    }

    return false;
  }
}
