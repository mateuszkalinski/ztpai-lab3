const { Router } = require("express");
const validate = require("../../middleware/validate");
const {
  reservationIdParams,
  createReservationBody,
  listReservationsQuery
} = require("./reservations.schemas");

function createReservationsRouter(controller) {
  const router = Router();

  router.get("/", validate({ query: listReservationsQuery }), controller.list);
  router.get("/:id", validate({ params: reservationIdParams }), controller.getById);
  router.post("/", validate({ body: createReservationBody }), controller.create);
  router.patch("/:id/cancel", validate({ params: reservationIdParams }), controller.cancel);

  return router;
}

module.exports = { createReservationsRouter };