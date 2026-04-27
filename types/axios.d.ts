import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    /** If true, 401 does not navigate to /auth/login. */
    skipAuthRedirect?: boolean;
    /** If true, omit Authorization so public catalog GETs work with a stale token. */
    publicCatalog?: boolean;
  }
  export interface InternalAxiosRequestConfig {
    skipAuthRedirect?: boolean;
    publicCatalog?: boolean;
  }
}
