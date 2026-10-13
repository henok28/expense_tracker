import { AuthUser } from "./../services/authService";
// import User from "../../generated/prisma/client.js";
AuthUser;
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
// this file is to make typescript accept Request have a fild called user that holds our user schema and excluded password_hash form the type
