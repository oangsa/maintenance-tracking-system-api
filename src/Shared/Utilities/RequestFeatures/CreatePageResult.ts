import { createMetaData } from "./CreateMetaData"
import { PagedResult } from "../../../Domains/RequestFeatures/Core/PageResult";

export function createPagedResult<T>( items: T[], totalCount: number, pageNumber: number, pageSize: number): PagedResult<T> {
  return {
    items,
    meta: createMetaData(pageNumber, totalCount, pageSize)
  }
}
