const { z } = require("zod");

const reservationIdParams = z.object({
  id: z.coerce.number().int().positive()
});

const createReservationBody = z.object({
  roomId: z.number().int().positive(),
  reservedBy: z.string().trim().min(3).max(100),
  participants: z.number().int().positive(),
  startTime: z.iso.datetime({ offset: true }),
  endTime: z.iso.datetime({ offset: true })
}).strict();

const listReservationsQuery = z.object({
  roomId: z.coerce.number().int().positive().optional()
});

module.exports = { reservationIdParams, createReservationBody, listReservationsQuery };