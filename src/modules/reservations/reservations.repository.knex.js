// camelCase (aplikacja) -> snake_case (baza)
const COLUMNS = {
  roomId: "room_id",
  reservedBy: "reserved_by",
  participants: "participants",
  startTime: "start_time",
  endTime: "end_time",
  status: "status",
  cancelledAt: "cancelled_at",
  createdAt: "created_at"
};

function toRow(data) {
  const row = {};
  for (const [field, column] of Object.entries(COLUMNS)) {
    if (data[field] !== undefined) row[column] = data[field];
  }
  return row; // pola spoza tabeli (np. internalNote) są pomijane
}

function toReservation(row) {
  if (!row) return null;
  return {
    id: row.id,
    roomId: row.room_id,
    reservedBy: row.reserved_by,
    participants: row.participants,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    createdAt: row.created_at,
    cancelledAt: row.cancelled_at
  };
}

function createReservationsRepository(db) {
  return {
    async findAll({ roomId } = {}) {
      const rows = await db("reservations")
        .modify(qb => {
          if (roomId !== undefined) qb.where("room_id", roomId);
        })
        .orderBy("id");
      return rows.map(toReservation);
    },

    async findById(id) {
      return toReservation(await db("reservations").where({ id }).first());
    },

    async findByRoomAndStatus(roomId, status) {
      const rows = await db("reservations").where({ room_id: roomId, status });
      return rows.map(toReservation);
    },

    async create(data) {
      const [row] = await db("reservations").insert(toRow(data)).returning("*");
      return toReservation(row);
    },

    async update(id, changes) {
      const [row] = await db("reservations").where({ id }).update(toRow(changes)).returning("*");
      return toReservation(row);
    }
  };
}

module.exports = { createReservationsRepository };
