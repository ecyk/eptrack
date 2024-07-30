import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";

import { jwtSecret } from "../../../vars";
import userModel from "../user/user-model";

const opt = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

const jwtStrategy = new JWTStrategy(opt, (payload, done) => {
  userModel
    .findById(payload.userId)
    .exec()
    .then((user) => {
      if (user != null) {
        done(null, user);
      } else {
        done(null, false);
      }
    })
    .catch((err) => {
      done(err, false);
    });
});

export default jwtStrategy;
