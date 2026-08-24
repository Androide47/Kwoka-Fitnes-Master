/** Public Cognito settings for pool `kwoka-fitness-dev`. No client secret. */
export const cognitoConfig = {
  poolName: "kwoka-fitness-dev",
  region: process.env.EXPO_PUBLIC_COGNITO_REGION || "us-east-1",
  userPoolId: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID || "",
  clientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID || "",
  domain: process.env.EXPO_PUBLIC_COGNITO_DOMAIN || "",
};

export function isCognitoConfigured() {
  return Boolean(
    cognitoConfig.userPoolId && cognitoConfig.clientId && !cognitoConfig.userPoolId.includes("xxxxxxxx"),
  );
}
