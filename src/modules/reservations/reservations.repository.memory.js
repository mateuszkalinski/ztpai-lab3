const HOUR = 60 * 60 * 1000;

// dane startowe (seed): rezerwacja, która już trwa (zaczęła się godzinę temu)
// potrzebna do pokazania, że nie da się anulować rozpoczętej rezerwacji
function defaultReservations() {
  const now = Date.now();
  return [
    {
      id: 1,
      roomId: 4,
      reservedBy: "Mateusz Kaliński",
      participants: 10,
      startTime: new Date(now - HOUR),
      endTime: new Date(now + HOUR),
      status: "CONFIRMED",
      createdAt: new Date(now - 24 * HOUR),
      cancelledAt: null,
      internalNote: "seed data"
    }
  ];
}

// findRoom(id) - podawane przez unit of work, żeby zwracać rezerwację razem z salą i budynkiem
function createReservationsRepository(seed = defaultReservations(), { findRoom = async () => null } = {}) {
  const reservations = structuredClone(seed);
  let nextReservationId = Math.max(0, ...reservations.map(r => r.id)) + 1;

  async function withRoom(reservation) {
    if (!reservation) return null;
    const room = await findRoom(reservation.roomId);
    return { ...reservation, room: room ? { id: room.id, name: room.name, building: room.building } : null };
  }

  return {
    async list({ roomId, buildingId, status, from, to, page, limit, sort }) {
      const all = await Promise.all(reservations.map(withRoom));
      const fromMs = from && new Date(from).getTime();
      const toMs = to && new Date(to).getTime();

      const filtered = all.filter(r =>
        (roomId === undefined || r.roomId === roomId) &&
        (buildingId === undefined || r.room?.building?.id === buildingId) &&
        (status === undefined || r.status === status) &&
        (to === undefined || new Date(r.startTime).getTime() < toMs) &&
        (from === undefined || new Date(r.endTime).getTime() > fromMs)
      );

      const desc = sort.startsWith("-");
      const field = desc ? sort.slice(1) : sort;
      const value = r => (field === "participants" ? r.participants : new Date(r[field]).getTime());
      filtered.sort((a, b) => (desc ? value(b) - value(a) : value(a) - value(b)) || a.id - b.id);

      const start = (page - 1) * limit;
      return { items: filtered.slice(start, start + limit), total: filtered.length };
    },

    async findById(id) {
      return withRoom(reservations.find(r => r.id === id));
    },

    async findByRoomAndStatus(roomId, status) {
      return Promise.all(reservations.filter(r => r.roomId === roomId && r.status === status).map(withRoom));
    },

    async create(data) {
      const reservation = { id: nextReservationId++, ...data };
      reservations.push(reservation);
      return withRoom(reservation);
    },

    async update(id, changes) {
      const reservation = reservations.find(r => r.id === id);
      Object.assign(reservation, changes);
      return withRoom(reservation);
    }
  };
}

module.exports = { createReservationsRepository };
