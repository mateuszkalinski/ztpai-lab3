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

// whitelist sortowania: "pole" = rosnąco, "-pole" = malejąco
const SORT_VALUES = ["startTime", "-startTime", "createdAt", "-createdAt", "participants", "-participants"];

const listReservationsQuery = z.object({
  roomId: z.coerce.number().int().positive().optional(),
  buildingId: z.coerce.number().int().positive().optional(),
  status: z.enum(["CONFIRMED", "CANCELLED"]).optional(),
  from: z.iso.datetime({ offset: true }).optional(),
  to: z.iso.datetime({ offset: true }).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(SORT_VALUES).default("startTime")
}).refine(
  q => !q.from || !q.to || new Date(q.from).getTime() < new Date(q.to).getTime(),
  { message: "from musi byc wczesniej niz to", path: ["to"] }
);

module.exports = { reservationIdParams, createReservationBody, listReservationsQuery, SORT_VALUES };
