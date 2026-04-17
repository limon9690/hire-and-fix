type TBookingConfirmationEmailArgs = {
    bookingId: string;
    userName: string;
    vendorName: string;
    employeeName: string;
    startTime: Date;
    endTime: Date;
    totalPrice: number;
    currency: string;
};

const formatDateTime = (value: Date) =>
    new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(value);

export const buildBookingConfirmationEmail = ({
    bookingId,
    userName,
    vendorName,
    employeeName,
    startTime,
    endTime,
    totalPrice,
    currency
}: TBookingConfirmationEmailArgs) => {
    const formattedStartTime = formatDateTime(startTime);
    const formattedEndTime = formatDateTime(endTime);
    const formattedPrice = `${currency.toUpperCase()} ${totalPrice.toFixed(2)}`;

    const subject = `Booking confirmed - ${bookingId}`;
    const text = [
        `Hi ${userName},`,
        "",
        "Your payment was successful and your booking is now confirmed.",
        `Booking ID: ${bookingId}`,
        `Vendor: ${vendorName}`,
        `Employee: ${employeeName}`,
        `Start: ${formattedStartTime}`,
        `End: ${formattedEndTime}`,
        `Amount paid: ${formattedPrice}`,
        "",
        "Thank you for booking with Hire & Fix."
    ].join("\n");

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Booking confirmed</h2>
        <p>Hi ${userName},</p>
        <p>Your payment was successful and your booking is now confirmed.</p>
        <ul>
          <li><strong>Booking ID:</strong> ${bookingId}</li>
          <li><strong>Vendor:</strong> ${vendorName}</li>
          <li><strong>Employee:</strong> ${employeeName}</li>
          <li><strong>Start:</strong> ${formattedStartTime}</li>
          <li><strong>End:</strong> ${formattedEndTime}</li>
          <li><strong>Amount paid:</strong> ${formattedPrice}</li>
        </ul>
        <p>Thank you for booking with Hire & Fix.</p>
      </div>
    `;

    return {
        subject,
        text,
        html
    };
};
