export type IBatchCreateDto<T> = {
  jsonData: T[];
  csvString: string;
  isUseCSV: boolean;
};
