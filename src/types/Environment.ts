export interface AppProcessEnv {
  SESSION_SECRET?: string;
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
  NODE_ENV?: "development" | "production" | "test";
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends AppProcessEnv {}
  }
}

export {};
