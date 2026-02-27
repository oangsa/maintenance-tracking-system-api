import { Search } from "./Search";
import { SearchTerm } from "./SearchTerm";

export interface RequestParameters {
  pageNumber: number
  pageSize: number
  search?: Search[]
  searchTerm?: SearchTerm
  orderBy?: string
  deleted?: boolean
  isDownload?: boolean
}
