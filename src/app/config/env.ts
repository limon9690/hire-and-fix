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
}

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
    "ADMIN_PASSWORD"
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
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string
  };
}

export const envVars = setEnvVariables();
