import z from "zod";
import "dotenv/config";

const envVarsSchema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"]),
  PORT: z.number().default(3000),
  MONGODB_URI: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().min(1),
});

const envVars = envVarsSchema.parse(process.env);

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url:
      envVars.MONGODB_URI +
      (envVars.NODE_ENV === "production" ? "prod" : "test") +
      "?retryWrites=true&w=majority",
  },
  google: {
    clientId: envVars.GOOGLE_CLIENT_ID,
    clientSecret: envVars.GOOGLE_CLIENT_SECRET,
    redirectUri: envVars.GOOGLE_REDIRECT_URI,
  },
};

export default config;
