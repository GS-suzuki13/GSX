const express = require("express");
const { getAll, create, update, remove } = require("../controllers/returns.controller");

const router = express.Router();

// CRUD de retornos
router.get('/:clientUser', getAll);
router.post('/:clientUser', create);
router.put('/:clientUser/:date', update);
router.delete('/:clientUser/:date', remove);

module.exports = router;
