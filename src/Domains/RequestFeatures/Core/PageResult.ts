import { MetaData } from "./MetaData";

export interface PagedResult<T> {
  items: T[]
  meta: MetaData
}
