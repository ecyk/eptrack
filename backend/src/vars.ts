import assert from "node:assert";

let check;
assert(process.env[(check = "JWT_SECRET")], `'${check}' is required`);
assert(
  process.env[(check = "JWT_EXPIRATION_MINUTES")],
  `'${check}' is required`
);
assert(process.env[(check = "MONGO_URI")], `'${check}' is required`);

/* eslint-disable  @typescript-eslint/no-non-null-assertion */
export const env = process.env.NODE_ENV;
export const port = process.env.PORT;
export const jwtSecret = process.env.JWT_SECRET!;
export const jwtExpirationInterval = process.env.JWT_EXPIRATION_MINUTES!;
export const mongoURI = process.env.MONGO_URI!;
