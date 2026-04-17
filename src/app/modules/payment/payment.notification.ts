import { envVars } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { sendEmail } from "../../utils/email";
import { buildBookingConfirmationEmail } from "./payment.email";

export const sendBookingConfirmationEmail = async (bookingId: string): Promise<void> => {
    const booking = await prisma.booking.findUnique({
        where: {
            id: bookingId
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true
                }
            },
            vendor: {
                select: {
                    vendorName: true
                }
            },
            employee: {
                include: {
                    user: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    });

    if (!booking || !booking.user?.email) {
        return;
    }

    const emailContent = buildBookingConfirmationEmail({
        bookingId: booking.id,
        userName: booking.user.name,
        vendorName: booking.vendor.vendorName,
        employeeName: booking.employee.user.name,
        startTime: booking.startTime,
        endTime: booking.endTime,
        totalPrice: Number(booking.totalPrice),
        currency: envVars.STRIPE_CURRENCY
    });

    await sendEmail({
        to: booking.user.email,
        ...emailContent
    });
};
