const account = require("./account/lib.js");
let express = require('express'),
     router = express.Router();

router.post("/login", account.login);
// router.post("/signup", account.signup);
router.get("/getusers", account.getUsers);
// router.delete("/deleteuser", account.deleteUser);

module.exports = router