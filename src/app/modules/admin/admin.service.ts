import status from "http-status";
import { BookingStatus, PaymentStatus, Role } from "../../../../prisma/generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { TUpdateUserStatusPayload, TUpdateVendorApprovalPayload } from "./admin.validation";

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

const getAllUsers = async () => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return users;
};

const getAllBookings = async () => {
    const bookings = await prisma.booking.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                }
            },
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
            },
            employee: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true
                        }
                    },
                    serviceCategory: true
                }
            },
            payment: true,
            review: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return bookings;
};

const getAllPayments = async () => {
    const payments = await prisma.payment.findMany({
        include: {
            booking: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true
                        }
                    },
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
                    },
                    employee: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true
                                }
                            },
                            serviceCategory: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return payments;
};

const getPaymentDetails = async (id: string) => {
    const payment = await prisma.payment.findUnique({
        where: {
            id
        },
        include: {
            booking: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true
                        }
                    },
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
                    },
                    employee: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true
                                }
                            },
                            serviceCategory: true
                        }
                    }
                }
            }
        }
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
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                }
            },
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
            },
            employee: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true
                        }
                    },
                    serviceCategory: true
                }
            },
            payment: true,
            review: true
        }
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
