import status from "http-status";
import AppError from "../errorHelpers/AppError";
import { envVars } from "../config/env";
import { resend } from "../lib/resend";

type TSendEmailPayload = {
    to: string;
    subject: string;
    html: string;
    text: string;
};

export const sendEmail = async (payload: TSendEmailPayload): Promise<void> => {
    if (!resend || !envVars.EMAIL_FROM) {
        throw new AppError(
            status.INTERNAL_SERVER_ERROR,
            "Email service is not configured. Please set RESEND_API_KEY and EMAIL_FROM."
        );
    }

    const response = await resend.emails.send({
        from: envVars.EMAIL_FROM,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        ...(envVars.EMAIL_REPLY_TO ? { replyTo: envVars.EMAIL_REPLY_TO } : {})
    });

    if (response.error) {
        throw new AppError(
            status.BAD_GATEWAY,
            response.error.message || "Email delivery failed"
        );
    }
};
