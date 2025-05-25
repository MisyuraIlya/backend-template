// raw values
const COMPANY_NAME_HE = 'טכנולייט בע״מ';
const COMPANY_NAME_EN = 'Technolight Ltd.';

const COMPANY_ADDRESS_HE = 'דרך חיפה 44';
const COMPANY_ADDRESS_EN = '44 Haifa Road';

const COMPANY_LOCATION_HE = '2303401 קרית אתא';
const COMPANY_LOCATION_EN = '2303401 Kiryat Ata';

const COMPANY_PHONE = '072-3304841';
const COMPANY_FAX = '03-558-1420';
const COMPANY_BUSINESS_NUMBER = '123';
const COMPANY_VAT_NUMBER = '123';

// asset domain (same in both languages)
const MEDIA_DOMAIN = 'https://digi-dev.work';

// exported enums
export const projectEnums = {
  companyName: {
    he: COMPANY_NAME_HE,
    en: COMPANY_NAME_EN,
  },
  companyAddress: {
    he: COMPANY_ADDRESS_HE,
    en: COMPANY_ADDRESS_EN,
  },
  companyLocation: {
    he: COMPANY_LOCATION_HE,
    en: COMPANY_LOCATION_EN,
  },
  companyPhone: COMPANY_PHONE,
  companyFax: COMPANY_FAX,
  companyBusinessNumber: COMPANY_BUSINESS_NUMBER,
  companyVatNumber: COMPANY_VAT_NUMBER,
  mediaDomain: MEDIA_DOMAIN,
} as const;

export type ProjectEnums = typeof projectEnums;
