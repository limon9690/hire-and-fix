import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

const getAllVendors = async () => {
    const vendors = await prisma.vendorProfile.findMany({
        where: {
            isActive: true,
            isApproved: true
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

    return vendors;
};

const getVendorDetails = async (id: string) => {
    const vendor = await prisma.vendorProfile.findFirst({
        where: {
            id,
            isActive: true,
            isApproved: true
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

    if (!vendor) {
        throw new AppError(status.NOT_FOUND, "Vendor not found");
    }

    return vendor;
};

export const VendorServices = {
    getAllVendors,
    getVendorDetails
};
