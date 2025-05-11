import UserCtrl from "../controllers/account/lib.js";

async function userRoutes(fastify, options) {
  fastify.post("/login", UserCtrl.login);
  fastify.post("/signup", UserCtrl.signup);
  fastify.delete("/user/:id", UserCtrl.deleteUser);
  fastify.get("/users", UserCtrl.getUsers);
}

export default userRoutes;
