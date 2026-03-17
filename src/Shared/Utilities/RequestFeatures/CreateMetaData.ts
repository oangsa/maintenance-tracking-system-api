import { MetaData } from "../../../Domains/RequestFeatures/Core/MetaData";

export function createMetaData(currentPage: number, pageSize: number, totalCount: number): MetaData {
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
        currentPage,
        totalPages,
        pageSize,
        totalCount,
        hasPrevious: currentPage > 1,
        hasNext: currentPage < totalPages
    };
}
