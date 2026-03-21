type TSortOrder = "asc" | "desc";

type TQueryHelperConfig = {
    defaultLimit?: number;
    maxLimit?: number;
    defaultSortBy?: string;
    allowedSortFields?: string[];
};

type TQueryOptions = {
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: TSortOrder;
};

type TPaginationMeta = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

const getQueryString = (value: unknown): string | undefined => {
    if (typeof value === "string") {
        return value;
    }

    if (Array.isArray(value) && typeof value[0] === "string") {
        return value[0];
    }

    return undefined;
};

const getPositiveNumber = (value: unknown, fallback: number) => {
    const numericValue = Number(getQueryString(value));

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
        return fallback;
    }

    return Math.floor(numericValue);
};

export const parseQueryOptions = (
    query: Record<string, unknown>,
    config: TQueryHelperConfig = {}
): TQueryOptions => {
    const {
        defaultLimit = 10,
        maxLimit = 100,
        defaultSortBy = "createdAt",
        allowedSortFields = []
    } = config;

    const page = getPositiveNumber(query.page, 1);
    const rawLimit = getPositiveNumber(query.limit, defaultLimit);
    const limit = Math.min(rawLimit, maxLimit);

    const querySortBy = getQueryString(query.sortBy);
    const sortBy = querySortBy && (
        allowedSortFields.length === 0 || allowedSortFields.includes(querySortBy)
    )
        ? querySortBy
        : defaultSortBy;

    const querySortOrder = getQueryString(query.sortOrder);
    const sortOrder: TSortOrder = querySortOrder === "asc" ? "asc" : "desc";

    return {
        page,
        limit,
        skip: (page - 1) * limit,
        sortBy,
        sortOrder
    };
};

export const buildPaginationMeta = (total: number, page: number, limit: number): TPaginationMeta => ({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
});

export type { TPaginationMeta, TQueryOptions };
