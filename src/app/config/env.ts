import "dotenv/config";

interface IEnvVariable {
  NODE_ENV: string;
  PORT: string;
  DATABASE_URL: string;
  BCRYPT_SALT_ROUNDS: number;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  ADMIN_NAME: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  CLIENT_SUCCESS_URL: string;
  CLIENT_CANCEL_URL: string;
  STRIPE_CURRENCY: string;
  FRONTEND_URLS: string;
  REDIS_URL: string | null;
  REDIS_ENABLED: boolean;
  TRUST_PROXY: boolean;
  LOGIN_RATE_LIMIT_WINDOW_SECONDS: number;
  LOGIN_RATE_LIMIT_MAX_ATTEMPTS: number;
  BOOKING_RATE_LIMIT_WINDOW_SECONDS: number;
  BOOKING_RATE_LIMIT_MAX_REQUESTS: number;
}

const parseIntegerWithDefault = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number.parseInt(value, 10);

  return Number.isNaN(parsedValue) ? fallback : parsedValue;
};

const setEnvVariables = (): IEnvVariable => {
  const envVars = [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "BCRYPT_SALT_ROUNDS",
    "JWT_ACCESS_SECRET",
    "JWT_ACCESS_EXPIRES_IN",
    "ADMIN_NAME",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
    "STRIPE_SECRET_KEY",
    "STRIPE_PUBLISHABLE_KEY", 
    "STRIPE_WEBHOOK_SECRET",
    "CLIENT_SUCCESS_URL",
    "CLIENT_CANCEL_URL",
    "FRONTEND_URLS"
  ]

  envVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(`Missing environment variable: ${envVar}`);
    }
  });

  return {
    NODE_ENV: process.env.NODE_ENV as string,
    PORT: process.env.PORT as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
    BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS as string, 10),
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN as string,
    ADMIN_NAME: process.env.ADMIN_NAME as string,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL as string,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY as string,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string,
    CLIENT_SUCCESS_URL: process.env.CLIENT_SUCCESS_URL as string,
    CLIENT_CANCEL_URL: process.env.CLIENT_CANCEL_URL as string,
    STRIPE_CURRENCY: (process.env.STRIPE_CURRENCY as string) || "usd",
    FRONTEND_URLS: process.env.FRONTEND_URLS as string,
    REDIS_URL: process.env.REDIS_URL || null,
    REDIS_ENABLED: process.env.REDIS_ENABLED
      ? process.env.REDIS_ENABLED === "true"
      : true,
    TRUST_PROXY: process.env.TRUST_PROXY
      ? process.env.TRUST_PROXY === "true"
      : true,
    LOGIN_RATE_LIMIT_WINDOW_SECONDS: parseIntegerWithDefault(
      process.env.LOGIN_RATE_LIMIT_WINDOW_SECONDS,
      900
    ),
    LOGIN_RATE_LIMIT_MAX_ATTEMPTS: parseIntegerWithDefault(
      process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
      5
    ),
    BOOKING_RATE_LIMIT_WINDOW_SECONDS: parseIntegerWithDefault(
      process.env.BOOKING_RATE_LIMIT_WINDOW_SECONDS,
      300
    ),
    BOOKING_RATE_LIMIT_MAX_REQUESTS: parseIntegerWithDefault(
      process.env.BOOKING_RATE_LIMIT_MAX_REQUESTS,
      10
    )
  };
}

export const envVars = setEnvVariables();
