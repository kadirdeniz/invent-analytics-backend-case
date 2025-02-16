import dotenv from "dotenv";
import { IConfigService } from "./interfaces/IConfigService";

export class ConfigService implements IConfigService {
  constructor() {
    dotenv.config();
  }

  get(key: string): string | undefined {
    return process.env[key];
  }

  getNumber(key: string): number | undefined {
    const value = this.get(key);
    return value ? Number(value) : undefined;
  }

  getBoolean(key: string): boolean {
    return this.get(key)?.toLowerCase() === "true";
  }

  isProduction(): boolean {
    return this.get("NODE_ENV") === "production";
  }

  isDevelopment(): boolean {
    return this.get("NODE_ENV") === "development";
  }

  required(key: string): string {
    const value = this.get(key);
    if (!value) {
      throw new Error(`Environment variable ${key} is required`);
    }
    return value;
  }
}
