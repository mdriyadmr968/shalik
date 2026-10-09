export interface FarmerProfile {
  id: number;
  farmerName: string;
  district: string;
  upazila: string;
  primaryCrops: string[];
  isOnboarded: boolean;
  preferredLanguage: string;
}

export const defaultFarmerProfile: FarmerProfile = {
  id: 1,
  farmerName: 'কৃষক ভাই',
  district: 'কুড়িগ্রাম',
  upazila: 'চিলমারী',
  primaryCrops: ['ধান'],
  isOnboarded: true,
  preferredLanguage: 'bn'
};
