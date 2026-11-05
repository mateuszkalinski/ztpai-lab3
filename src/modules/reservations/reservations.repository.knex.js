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

// whitelist: wartość parametru sort -> kolumna w bazie (klient nigdy nie podaje nazwy kolumny)
const SORT_COLUMNS = {
  startTime: "res.start_time",
  createdAt: "res.created_at",
  participants: "res.participants"
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
    room: {
      id: row.room_id,
      name: row.room_name,
      building: { id: row.building_id, name: row.building_name }
    },
    reservedBy: row.reserved_by,
    participants: row.participants,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    createdAt: row.created_at,
    cancelledAt: row.cancelled_at
  };
}

// rezerwacja + sala + budynek w JEDNYM zapytaniu (dwa JOIN-y) - brak N+1
function reservationsWithRoom(db) {
  return db("reservations as res")
    .join("rooms as r", "r.id", "res.room_id")
    .join("buildings as b", "b.id", "r.building_id")
    .select("res.*", "r.name as room_name", "b.id as building_id", "b.name as building_name");
}

function createReservationsRepository(db) {
  async function findById(id) {
    return toReservation(await reservationsWithRoom(db).where("res.id", id).first());
  }

  return {
    async list({ roomId, buildingId, status, from, to, page, limit, sort }) {
      // filtry - WHERE dokładany tylko wtedy, gdy parametr został podany
      const filtered = reservationsWithRoom(db).modify(qb => {
        if (roomId !== undefined) qb.where("res.room_id", roomId);
        if (buildingId !== undefined) qb.where("r.building_id", buildingId);
        if (status !== undefined) qb.where("res.status", status);
        // nakładanie się przedziałów półotwartych [from, to): start < to AND end > from
        if (to !== undefined) qb.where("res.start_time", "<", new Date(to));
        if (from !== undefined) qb.where("res.end_time", ">", new Date(from));
      });

      const desc = sort.startsWith("-");
      const column = SORT_COLUMNS[desc ? sort.slice(1) : sort];

      const rows = await filtered.clone()
        .orderBy(column, desc ? "desc" : "asc")
        .orderBy("res.id", "asc") // tie-breaker - stabilna kolejność
        .limit(limit)
        .offset((page - 1) * limit);

      // total z tymi samymi filtrami, ale bez LIMIT/OFFSET
      const { count } = await filtered.clone().clearSelect().count({ count: "res.id" }).first();

      return { items: rows.map(toReservation), total: Number(count) };
    },

    findById,

    async findByRoomAndStatus(roomId, status) {
      const rows = await reservationsWithRoom(db).where({ "res.room_id": roomId, "res.status": status });
      return rows.map(toReservation);
    },

    async create(data) {
      const [{ id }] = await db("reservations").insert(toRow(data)).returning("id");
      return findById(id);
    },

    async update(id, changes) {
      await db("reservations").where({ id }).update(toRow(changes));
      return findById(id);
    }
  };
}

module.exports = { createReservationsRepository };
