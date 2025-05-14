// import UserCtrl from "../controllers/account/lib.js";
import UserCtrl from "../controllers/userController.js";

async function userRoutes(fastify, options) {
  fastify.post("/login", UserCtrl.login);
  fastify.post("/register", UserCtrl.register);
  fastify.delete("/:id", UserCtrl.deleteUser);
  // fastify.get("/users", UserCtrl.getUsers);
  fastify.post("/google-login", UserCtrl.googleLogin);
}

export default userRoutes;
