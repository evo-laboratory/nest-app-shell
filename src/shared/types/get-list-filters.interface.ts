// * We expect only for fields types :
// * ENUM - pass as string[], mongodb would pass as $in: []
// * BOOLEAN - pass as boolean
// * STRING - pass string, we would parse as Regex .*{STRING}.*
export interface IGetListFilters {
  [key: string]: boolean | string[] | string;
}
