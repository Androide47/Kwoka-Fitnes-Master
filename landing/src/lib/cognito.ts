/** Public Cognito settings for pool `kwoka-fitness-dev`. No client secret. */
export const cognitoConfig = {
  poolName: "kwoka-fitness-dev",
  region: import.meta.env.VITE_COGNITO_REGION || "us-east-1",
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || "",
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID || "",
  domain: import.meta.env.VITE_COGNITO_DOMAIN || "",
};

export function cognitoRedirectUrls() {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return {
    signIn: `${origin}${base}/login`,
    signOut: `${origin}${base}/`,
  };
}

export function isCognitoConfigured() {
  return Boolean(cognitoConfig.userPoolId && cognitoConfig.clientId && !cognitoConfig.userPoolId.includes("xxxxxxxx"));
}
