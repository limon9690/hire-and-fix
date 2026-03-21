import status from "http-status";
import { BookingStatus, PaymentStatus, Role } from "../../../../prisma/generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { buildPaginationMeta, TQueryOptions } from "../../utils/queryHelpers";
import { TUpdateUserStatusPayload, TUpdateVendorApprovalPayload } from "./admin.validation";

const basicUserSelect = {
    id: true,
    name: true,
    email: true,
    role: true
} as const;

const basicVendorSelect = {
    id: true,
    vendorName: true,
    logo: true,
    phone: true,
    address: true,
    isApproved: true,
    isActive: true
} as const;

const employeeWithUserAndCategoryInclude = {
    include: {
        user: {
            select: basicUserSelect
        },
        serviceCategory: true
    }
} as const;

const bookingDetailsInclude = {
    user: {
        select: basicUserSelect
    },
    vendor: {
        select: basicVendorSelect
    },
    employee: employeeWithUserAndCategoryInclude,
    payment: true,
    review: true
} as const;

const paymentDetailsInclude = {
    booking: {
        include: {
            user: {
                select: basicUserSelect
            },
            vendor: {
                select: basicVendorSelect
            },
            employee: employeeWithUserAndCategoryInclude
        }
    }
} as const;

type TGetAllBookingsFilters = {
    bookingStatus?: BookingStatus;
    paymentStatus?: PaymentStatus;
};

type TGetAllPaymentsFilters = {
    status?: PaymentStatus;
};

const getDashboardSummary = async () => {
    const [
        totalUsers,
        totalVendors,
        totalEmployees,
        totalAdmins,
        totalBookings,
        pendingBookings,
        completedBookings,
        cancelledBookings,
        totalPayments,
        pendingPayments,
        failedPayments,
        approvedVendors,
        revenueAggregate
    ] = await Promise.all([
        prisma.user.count({
            where: {
                role: Role.USER
            }
        }),
        prisma.user.count({
            where: {
                role: Role.VENDOR
            }
        }),
        prisma.user.count({
            where: {
                role: Role.EMPLOYEE
            }
        }),
        prisma.user.count({
            where: {
                role: Role.ADMIN
            }
        }),
        prisma.booking.count(),
        prisma.booking.count({
            where: {
                bookingStatus: BookingStatus.PENDING
            }
        }),
        prisma.booking.count({
            where: {
                bookingStatus: BookingStatus.COMPLETED
            }
        }),
        prisma.booking.count({
            where: {
                bookingStatus: BookingStatus.CANCELLED
            }
        }),
        prisma.payment.count(),
        prisma.payment.count({
            where: {
                status: PaymentStatus.PENDING
            }
        }),
        prisma.payment.count({
            where: {
                status: PaymentStatus.FAILED
            }
        }),
        prisma.vendorProfile.count({
            where: {
                isApproved: true
            }
        }),
        prisma.payment.aggregate({
            where: {
                status: PaymentStatus.SUCCESSFUL
            },
            _sum: {
                amount: true
            }
        })
    ]);

    return {
        totalUsers,
        totalVendors,
        totalEmployees,
        totalAdmins,
        totalBookings,
        pendingBookings,
        completedBookings,
        cancelledBookings,
        totalPayments,
        pendingPayments,
        failedPayments,
        approvedVendors,
        totalRevenue: Number(revenueAggregate._sum.amount ?? 0)
    };
};

const getAllUsers = async (queryOptions: TQueryOptions) => {
    const [users, total] = await Promise.all([
        prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true
            },
            skip: queryOptions.skip,
            take: queryOptions.limit,
            orderBy: {
                [queryOptions.sortBy]: queryOptions.sortOrder
            }
        }),
        prisma.user.count()
    ]);

    return {
        data: users,
        meta: buildPaginationMeta(total, queryOptions.page, queryOptions.limit)
    };
};

const getAllBookings = async (queryOptions: TQueryOptions, filters: TGetAllBookingsFilters) => {
    const whereClause = {
        ...(filters.bookingStatus && { bookingStatus: filters.bookingStatus }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus })
    };

    const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
            where: whereClause,
            include: bookingDetailsInclude,
            skip: queryOptions.skip,
            take: queryOptions.limit,
            orderBy: {
                [queryOptions.sortBy]: queryOptions.sortOrder
            }
        }),
        prisma.booking.count({
            where: whereClause
        })
    ]);

    return {
        data: bookings,
        meta: buildPaginationMeta(total, queryOptions.page, queryOptions.limit)
    };
};

const getAllPayments = async (queryOptions: TQueryOptions, filters: TGetAllPaymentsFilters) => {
    const whereClause = {
        ...(filters.status && { status: filters.status })
    };

    const [payments, total] = await Promise.all([
        prisma.payment.findMany({
            where: whereClause,
            include: paymentDetailsInclude,
            skip: queryOptions.skip,
            take: queryOptions.limit,
            orderBy: {
                [queryOptions.sortBy]: queryOptions.sortOrder
            }
        }),
        prisma.payment.count({
            where: whereClause
        })
    ]);

    return {
        data: payments,
        meta: buildPaginationMeta(total, queryOptions.page, queryOptions.limit)
    };
};

const getPaymentDetails = async (id: string) => {
    const payment = await prisma.payment.findUnique({
        where: {
            id
        },
        include: paymentDetailsInclude
    });

    if (!payment) {
        throw new AppError(status.NOT_FOUND, "Payment not found");
    }

    return payment;
};

const getBookingDetails = async (id: string) => {
    const booking = await prisma.booking.findUnique({
        where: {
            id
        },
        include: bookingDetailsInclude
    });

    if (!booking) {
        throw new AppError(status.NOT_FOUND, "Booking not found");
    }

    return booking;
};

const getSingleUser = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true
        }
    });

    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    let profile: unknown = null;

    if (user.role === Role.USER) {
        profile = await prisma.userProfile.findUnique({
            where: {
                userId: user.id
            }
        });
    } else if (user.role === Role.VENDOR) {
        profile = await prisma.vendorProfile.findUnique({
            where: {
                userId: user.id
            }
        });
    } else if (user.role === Role.EMPLOYEE) {
        profile = await prisma.employeeProfile.findUnique({
            where: {
                userId: user.id
            },
            include: {
                serviceCategory: true,
                vendor: {
                    select: {
                        id: true,
                        vendorName: true,
                        logo: true,
                        phone: true,
                        address: true,
                        isApproved: true,
                        isActive: true
                    }
                }
            }
        });
    }

    return {
        ...user,
        profile
    };
};

const updateUserStatus = async (id: string, payload: TUpdateUserStatusPayload) => {
    const user = await prisma.user.findUnique({
        where: {
            id
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true
        }
    });

    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    let profile: unknown = null;

    if (user.role === Role.USER) {
        profile = await prisma.userProfile.update({
            where: {
                userId: user.id
            },
            data: {
                isActive: payload.isActive
            }
        });
    } else if (user.role === Role.VENDOR) {
        profile = await prisma.vendorProfile.update({
            where: {
                userId: user.id
            },
            data: {
                isActive: payload.isActive
            }
        });
    } else if (user.role === Role.EMPLOYEE) {
        profile = await prisma.employeeProfile.update({
            where: {
                userId: user.id
            },
            data: {
                isActive: payload.isActive
            },
            include: {
                serviceCategory: true,
                vendor: {
                    select: {
                        id: true,
                        vendorName: true,
                        logo: true,
                        phone: true,
                        address: true,
                        isApproved: true,
                        isActive: true
                    }
                }
            }
        });
    } else if (user.role === Role.ADMIN) {
        throw new AppError(status.BAD_REQUEST, "Admin status cannot be updated through profile status endpoint");
    }

    return {
        ...user,
        profile
    };
};

const updateVendorApproval = async (id: string, payload: TUpdateVendorApprovalPayload) => {
    const vendor = await prisma.vendorProfile.findUnique({
        where: {
            id
        }
    });

    if (!vendor) {
        throw new AppError(status.NOT_FOUND, "Vendor not found");
    }

    const updatedVendor = await prisma.vendorProfile.update({
        where: {
            id
        },
        data: {
            isApproved: payload.isApproved
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true
                }
            }
        }
    });

    return updatedVendor;
};

export const AdminServices = {
    getDashboardSummary,
    getAllUsers,
    getAllBookings,
    getAllPayments,
    getPaymentDetails,
    getBookingDetails,
    getSingleUser,
    updateUserStatus,
    updateVendorApproval
};
