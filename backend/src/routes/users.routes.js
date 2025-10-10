const express = require("express");
const router = express.Router();
const controller = require("../controllers/users.controller");

router.get("/", controller.getAll);
router.post("/", controller.create);
router.post("/login", controller.login);
router.put("/:user", controller.update);
router.delete("/:user", controller.remove);

module.exports = router;
