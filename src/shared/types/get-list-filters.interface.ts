// * We expect only for fields types :
// * ENUM - pass as string[]
// * BOOLEAN - pass as boolean
// * STRING - pass string, we would parse as Regex to exe Like
export interface IGetListFilters {
  [key: string]: boolean | string[] | string;
}
