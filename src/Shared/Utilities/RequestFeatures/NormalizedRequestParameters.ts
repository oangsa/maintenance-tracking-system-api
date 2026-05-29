import { RequestParameters } from "../../../Domains/RequestFeatures/Core/RequestParameters";

const MAX_PAGE_SIZE = 50

export function normalizeRequestParameters<T extends Partial<RequestParameters>>(params: T): T & RequestParameters
{
    let pageNumber = params.pageNumber ?? 1
    let pageSize = params.pageSize ?? 10
    const isDownload = params.isDownload ?? false

    if (pageSize === 999)
    {
        // Special case for download requests, set pageSize to a very large number to effectively disable pagination
    }
    else if (!isDownload && pageSize > MAX_PAGE_SIZE)
    {
        pageSize = MAX_PAGE_SIZE
    }

    if (isDownload)
    {
        pageSize = Number.MAX_SAFE_INTEGER
    }

    return {
        ...params,
        pageNumber,
        pageSize,
        search: params.search,
        searchTerm: params.searchTerm,
        orderBy: params.orderBy,
        deleted: params.deleted ?? false,
        isDownload
    } as T & RequestParameters
}
