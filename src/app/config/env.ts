import "dotenv/config";

interface IEnvVariable {
  NODE_ENV: string;
  PORT: string;
  DATABASE_URL: string;
}

const setEnvVariables = (): IEnvVariable => {
  const envVars = [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
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
  };
}

export const envVars = setEnvVariables();

