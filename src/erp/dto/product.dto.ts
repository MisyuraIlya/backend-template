export interface ProductDto {
  sku?: string | null;
  barcode?: string | null;
  title?: string | null;
  titleEnglish?: string | null;
  description?: string | null;
  categoryLvl1Id?: string | null;
  categoryLvl1Name?: string | null;
  categoryLvl2Id?: string | null;
  categoryLvl2Name?: string | null;
  categoryLvl3Id?: string | null;
  categoryLvl3Name?: string | null;
  categoryDescription?: string | null;
  status: boolean;
  baseprice?: string | null;
  minimumPrice?: number | null;
  intevntory_managed: boolean;
  parent?: string | null;
  packQuantity?: number | null;

  // CUSTOM
  isHumane?: boolean | null;
  isVetrinary?: boolean | null;
  isPharamecies?: boolean | null;
  isMedicalCenter?: boolean | null;
  isHospital?: boolean | null;

  link?: string | null;
  linkTitle?: string | null;
  isDrugNotInBasket?: boolean | null;

  Extra1?: string | null;
  Extra2?: string | null;
  Extra3?: string | null;
  Extra4?: string | null;
  Extra5?: string | null;
  Extra6?: string | null;
  Extra7?: string | null;
  Extra8?: string | null;
  Extra9?: string | null;
  Extra10?: string | null;
  Extra11?: string | null;
  Extra12?: string | null;
  Extra13?: string | null;
  Extra14?: string | null;
  Extra15?: string | null;
  Extra16?: string | null;
  Extra17?: string | null;
  Extra18?: string | null;
  Extra19?: string | null;
  Extra20?: string | null;
  Extra21?: string | null;
  Extra22?: string | null;
  Extra23?: string | null;
}