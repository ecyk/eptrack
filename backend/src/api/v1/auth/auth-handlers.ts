import { generateCodeVerifier, generateState } from "arctic";
import { type Request, type Response, type NextFunction } from "express";
import status from "http-status";
import { type CookieAttributes, generateId, type Session } from "lucia";
import { parseCookies, serializeCookie } from "oslo/cookie";

import { lucia, google } from "./auth-strategy.js";
import { AppError } from "../../../app-error.js";
import config from "../../../config.js";
import { userModel } from "../user/user-model.js";

export async function handleGoogleAuth(
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = await google.createAuthorizationURL(state, codeVerifier, {
    scopes: ["profile", "email"],
  });
  res
    .append(
      "Set-Cookie",
      serializeCookie("google_oauth_state", state, {
        path: "/",
        secure: config.env === "production",
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "lax",
      })
    )
    .append(
      "Set-Cookie",
      serializeCookie("google_code_verifier", codeVerifier, {
        path: "/",
        secure: config.env === "production",
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "lax",
      })
    )
    .redirect(url.toString());
}

interface GoogleUser {
  sub: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}

export async function handleGoogleAuthCallback(
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  const state = req.query.state?.toString() ?? null;
  const code = req.query.code?.toString() ?? null;
  const cookies = parseCookies(req.headers.cookie ?? "");
  const storedState = cookies.get("google_oauth_state") ?? null;
  const storedCodeVerifier = cookies.get("google_code_verifier") ?? null;
  if (
    state == null ||
    code == null ||
    storedState == null ||
    storedCodeVerifier == null ||
    state !== storedState
  ) {
    throw new AppError(status.BAD_REQUEST, status[status.BAD_REQUEST]);
  }

  const tokens = await google.validateAuthorizationCode(
    code,
    storedCodeVerifier
  );
  const googleUserResponse = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    }
  );
  const googleUser = (await googleUserResponse.json()) as GoogleUser;
  const existingUser = await userModel
    .findOne({ google_id: googleUser.sub })
    .exec();

  const createAuthenticatedCookie = (
    sessionCookieAttrs: CookieAttributes
  ): string => {
    return serializeCookie("authenticated", "1", {
      ...sessionCookieAttrs,
      httpOnly: false,
    });
  };

  if (existingUser != null) {
    const session = await lucia.createSession(existingUser._id as string, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    res
      .append("Set-Cookie", createAuthenticatedCookie(sessionCookie.attributes))
      .append("Set-Cookie", sessionCookie.serialize())
      .redirect("/");
    return;
  }

  const userId = generateId(15);
  await userModel.create({
    _id: userId,
    google_id: googleUser.sub,
  });

  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  res
    .append("Set-Cookie", createAuthenticatedCookie(sessionCookie.attributes))
    .append("Set-Cookie", sessionCookie.serialize())
    .redirect("/");
}

export async function handleLogout(
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  await lucia.invalidateSession((res.locals.session as Session).id);
  res
    .appendHeader("Set-Cookie", lucia.createBlankSessionCookie().serialize())
    .clearCookie("authenticated")
    .clearCookie("google_oauth_state")
    .clearCookie("google_code_verifier")
    .status(status.NO_CONTENT)
    .send();
}
