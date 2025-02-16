export interface IConfigService {
  get(key: string): string | undefined;
  getNumber(key: string): number | undefined;
  getBoolean(key: string): boolean;
  isProduction(): boolean;
  isDevelopment(): boolean;
  required(key: string): string;
}
