import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.string().optional().default("development"),
  PORT: z.coerce.number().optional().default(8080),
  MONGODB_URI: z.string().min(1).default("mongodb://localhost:27017/defisecure"),
  JWT_SECRET: z.string().min(16).default("dev_only_change_me_please_32chars"),
  CORS_ORIGIN: z.string().optional().default("http://localhost:3000"),
  ADMIN_WALLETS: z.string().optional().default(""),
  ADMIN_EMAIL: z.string().optional().default("admin@defisecure.local"),
  ADMIN_PASSWORD: z.string().optional().default("Admin@123"),
  AI_ENGINE_URL: z.string().optional().default("http://localhost:8000"),
  AUTO_BOOTSTRAP_ADMIN: z
    .string()
    .optional()
    .default("true")
    .transform((v) => v.toLowerCase() === "true")
});

export type Env = z.infer<typeof EnvSchema>;
export const env: Env = EnvSchema.parse(process.env);

export function adminWalletSet(): Set<string> {
  const raw = env.ADMIN_WALLETS.trim();
  if (!raw) return new Set<string>();
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

