import status from "http-status";
import { BookingStatus, PaymentStatus } from "../../../../prisma/generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { buildPaginationMeta, TQueryOptions } from "../../utils/queryHelpers";
import { TUpdateMyVendorPayload } from "./vendor.validation";

const vendorUserSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    createdAt: true,
    updatedAt: true
} as const;

const vendorWithUserInclude = {
    user: {
        select: vendorUserSelect
    }
} as const;

type TGetAllVendorsFilters = {
    isApproved?: boolean;
    isActive?: boolean;
    searchTerm?: string;
};

const getReviewSummaryByVendorId = async (vendorId: string) => {
    const reviewStats = await prisma.review.aggregate({
        where: {
            employee: {
                vendorId,
                isDeleted: false
            }
        },
        _avg: {
            rating: true
        },
        _count: {
            _all: true
        }
    });

    return {
        averageRating: Number((reviewStats._avg.rating ?? 0).toFixed(2)),
        totalReviews: reviewStats._count._all
    };
};

const getAllVendors = async (queryOptions: TQueryOptions, filters: TGetAllVendorsFilters) => {
    const whereClause = {
        ...(filters.isActive !== undefined && { isActive: filters.isActive }),
        ...(filters.isApproved !== undefined && { isApproved: filters.isApproved }),
        ...(filters.searchTerm && {
            vendorName: {
                contains: filters.searchTerm,
                mode: "insensitive" as const
            }
        })
    };

    const [vendors, total] = await Promise.all([
        prisma.vendorProfile.findMany({
            where: whereClause,
            include: vendorWithUserInclude,
            skip: queryOptions.skip,
            take: queryOptions.limit,
            orderBy: {
                [queryOptions.sortBy]: queryOptions.sortOrder
            }
        }),
        prisma.vendorProfile.count({
            where: whereClause
        })
    ]);

    return {
        data: vendors,
        meta: buildPaginationMeta(total, queryOptions.page, queryOptions.limit)
    };
};

const getVendorDetails = async (id: string) => {
    const vendor = await prisma.vendorProfile.findFirst({
        where: {
            id,
            isActive: true,
            isApproved: true
        },
        include: vendorWithUserInclude
    });

    if (!vendor) {
        throw new AppError(status.NOT_FOUND, "Vendor not found");
    }

    const [employeeCount, reviewSummary] = await Promise.all([
        prisma.employeeProfile.count({
            where: {
                vendorId: vendor.id,
                isDeleted: false
            }
        }),
        getReviewSummaryByVendorId(vendor.id)
    ]);

    return {
        ...vendor,
        reviewSummary: {
            ...reviewSummary,
            employeeCount
        }
    };
};

const updateMyVendorProfile = async (vendorUserId: string, payload: TUpdateMyVendorPayload) => {
    const vendorProfile = await prisma.vendorProfile.findUnique({
        where: {
            userId: vendorUserId
        }
    });

    if (!vendorProfile) {
        throw new AppError(status.NOT_FOUND, "Vendor profile not found");
    }

    if (payload.email) {
        const existingUser = await prisma.user.findUnique({
            where: {
                email: payload.email.toLowerCase()
            }
        });

        if (existingUser && existingUser.id !== vendorUserId) {
            throw new AppError(status.CONFLICT, "Email already exists");
        }
    }

    if (payload.vendorName) {
        const existingVendor = await prisma.vendorProfile.findUnique({
            where: {
                vendorName: payload.vendorName
            }
        });

        if (existingVendor && existingVendor.id !== vendorProfile.id) {
            throw new AppError(status.CONFLICT, "Vendor name already exists");
        }
    }

    const updatedVendor = await prisma.$transaction(async (tx) => {
        if (payload.name || payload.email) {
            await tx.user.update({
                where: {
                    id: vendorUserId
                },
                data: {
                    ...(payload.name && { name: payload.name }),
                    ...(payload.email && { email: payload.email.toLowerCase() })
                }
            });
        }

        return tx.vendorProfile.update({
            where: {
                id: vendorProfile.id
            },
            data: {
                ...(payload.vendorName && { vendorName: payload.vendorName }),
                ...(payload.logo && { logo: payload.logo }),
                ...(payload.phone && { phone: payload.phone }),
                ...(payload.description && { description: payload.description }),
                ...(payload.address && { address: payload.address })
            },
            include: vendorWithUserInclude
        });
    });

    return updatedVendor;
};

const getDashboardSummary = async (vendorUserId: string) => {
    const vendorProfile = await prisma.vendorProfile.findUnique({
        where: {
            userId: vendorUserId
        }
    });

    if (!vendorProfile) {
        throw new AppError(status.NOT_FOUND, "Vendor profile not found");
    }

    const [
        totalEmployees,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        revenueAggregate,
        reviewSummary
    ] = await Promise.all([
        prisma.employeeProfile.count({
            where: {
                vendorId: vendorProfile.id,
                isDeleted: false
            }
        }),
        prisma.booking.count({
            where: {
                vendorId: vendorProfile.id
            }
        }),
        prisma.booking.count({
            where: {
                vendorId: vendorProfile.id,
                bookingStatus: BookingStatus.PENDING
            }
        }),
        prisma.booking.count({
            where: {
                vendorId: vendorProfile.id,
                bookingStatus: BookingStatus.ACCEPTED
            }
        }),
        prisma.booking.count({
            where: {
                vendorId: vendorProfile.id,
                bookingStatus: BookingStatus.COMPLETED
            }
        }),
        prisma.booking.count({
            where: {
                vendorId: vendorProfile.id,
                bookingStatus: BookingStatus.CANCELLED
            }
        }),
        prisma.booking.aggregate({
            where: {
                vendorId: vendorProfile.id,
                bookingStatus: BookingStatus.COMPLETED,
                paymentStatus: PaymentStatus.SUCCESSFUL
            },
            _sum: {
                totalPrice: true
            }
        }),
        getReviewSummaryByVendorId(vendorProfile.id)
    ]);

    return {
        totalEmployees,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue: Number(revenueAggregate._sum.totalPrice ?? 0),
        reviewSummary
    };
};

export const VendorServices = {
    getAllVendors,
    getVendorDetails,
    updateMyVendorProfile,
    getDashboardSummary
};
