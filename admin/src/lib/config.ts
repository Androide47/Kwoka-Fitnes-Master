export const config = {
  useMocks: import.meta.env.VITE_USE_MOCKS !== "false",
  apiUrl: import.meta.env.VITE_API_URL ?? "",
  cognito: {
    region: import.meta.env.VITE_COGNITO_REGION ?? "us-east-1",
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID ?? "",
    clientId: import.meta.env.VITE_COGNITO_CLIENT_ID ?? "",
    domain: import.meta.env.VITE_COGNITO_DOMAIN ?? "",
  },
};
