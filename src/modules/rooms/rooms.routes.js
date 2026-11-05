const { Router } = require("express");
const validate = require("../../middleware/validate");
const { roomIdParams } = require("./rooms.schemas");

function createRoomsRouter(controller) {
  const router = Router();

  router.get("/", controller.list);
  router.get("/:id", validate({ params: roomIdParams }), controller.getById);

  return router;
}

module.exports = { createRoomsRouter };