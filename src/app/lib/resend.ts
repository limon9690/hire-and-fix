import { Resend } from "resend";
import { envVars } from "../config/env";

export const resend = envVars.RESEND_API_KEY
    ? new Resend(envVars.RESEND_API_KEY)
    : null;
