const express = require("express");
const { getAll, create, update, remove } = require("../controllers/returns.controller");

const router = express.Router();

// CRUD de retornos
router.get('/:userId', getAll);
router.post('/:userId', create);
router.put('/:userId/:date', update);
router.delete('/:userId/:date', remove);

module.exports = router;
