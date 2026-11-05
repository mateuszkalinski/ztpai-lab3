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

function createReservationsRepository(seed = defaultReservations()) {
  const reservations = structuredClone(seed);
  let nextReservationId = Math.max(0, ...reservations.map(r => r.id)) + 1;

  return {
    async findAll({ roomId } = {}) {
      return reservations.filter(r => roomId === undefined || r.roomId === roomId);
    },

    async findById(id) {
      return reservations.find(r => r.id === id) ?? null;
    },

    async findByRoomAndStatus(roomId, status) {
      return reservations.filter(r => r.roomId === roomId && r.status === status);
    },

    async create(data) {
      const reservation = { id: nextReservationId++, ...data };
      reservations.push(reservation);
      return reservation;
    },

    async update(id, changes) {
      const reservation = reservations.find(r => r.id === id);
      Object.assign(reservation, changes);
      return reservation;
    }
  };
}

module.exports = { createReservationsRepository };