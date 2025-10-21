const express = require("express");
const { getAll, create, update, remove } = require("../controllers/returns.controller");

const router = express.Router();

// CRUD de retornos
router.get('/:id', getAll);
router.post('/:id', create);
router.put('/:id/:date', update);
router.delete('/:id/:date', remove);

module.exports = router;
