export interface Credentials {
  email: string;
  password: string;
}

export function getCredentials(env: string): Credentials {
  const envUpper = env.toUpperCase();

  let email: string;
  let password: string;

  switch (env.toLowerCase()) {
    case "dev":
      email = process.env.DEVELOP_USER_EMAIL || "";
      password = process.env.DEVELOP_USER_PASSWORD || "";
      break;
    case "stage":
      email = process.env.STAGING_USER_EMAIL || "";
      password = process.env.STAGING_USER_PASSWORD || "";
      break;
    case "uat":
      email = process.env.UAT_USER_EMAIL || "";
      password = process.env.UAT_USER_PASSWORD || "";
      break;
    default:
      throw new Error(
        `Unknown environment: ${env}. Valid options are: dev, stage, uat`
      );
  }

  if (!email || !password) {
    throw new Error(
      `Credentials not found for environment: ${env}. Please check your .env file.`
    );
  }

  return { email, password };
}
