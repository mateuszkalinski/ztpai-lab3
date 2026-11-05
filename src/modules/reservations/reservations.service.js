const { NotFoundError, ConflictError, ValidationError } = require("../../errors/AppError");

const MINUTE = 60 * 1000;
const MIN_DURATION = 15 * MINUTE;  // 15 minut
const MAX_DURATION = 8 * 60 * MINUTE; // 8 godzin

// state machine: dozwolone przejścia statusów zapisane jako dane
const ALLOWED_TRANSITIONS = {
  CONFIRMED: ["CANCELLED"],
  CANCELLED: [] // stan końcowy
};

// przedziały półotwarte [start, end): nakładają się, gdy A.start < B.end i B.start < A.end
function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function bodyError(field, message) {
  return new ValidationError([{ location: "body", field, message }]);
}

function createReservationsService({ runInTransaction, now = () => new Date() }) {
  async function listReservations({ roomId }) {
    return runInTransaction(({ reservations }) => reservations.findAll({ roomId }));
  }

  async function getReservation(id) {
    return runInTransaction(async ({ reservations }) => {
      const reservation = await reservations.findById(id);
      if (!reservation) throw new NotFoundError("Reservation");
      return reservation;
    });
  }

  async function createReservation(input) {
    const start = new Date(input.startTime).getTime();
    const end = new Date(input.endTime).getTime();
    const duration = end - start;

    // reguły czasu -> 400
    if (end <= start) {
      throw bodyError("endTime", "Czas zakonczenia musi byc pozniejszy niz czas rozpoczecia");
    }
    if (duration < MIN_DURATION) {
      throw bodyError("endTime", "Rezerwacja musi trwac minimum 15 minut");
    }
    if (duration > MAX_DURATION) {
      throw bodyError("endTime", "Rezerwacja nie moze byc dluzsza niz 8 godzin");
    }
    if (start < now().getTime()) {
      throw bodyError("startTime", "Czas rozpoczecia musi byc w przyszlosci");
    }

    return runInTransaction(async ({ rooms, reservations }) => {
      // sala musi istnieć -> 404
      const room = await rooms.findById(input.roomId);
      if (!room) throw new NotFoundError("Room");

      // pojemność sali -> 409
      if (input.participants > room.capacity) {
        throw new ConflictError("Przekroczono pojemnosc sali", "ROOM_CAPACITY_EXCEEDED");
      }

      // brak nakładających się aktywnych rezerwacji -> 409
      const active = await reservations.findByRoomAndStatus(room.id, "CONFIRMED");
      const collision = active.some(r =>
        overlaps(start, end, new Date(r.startTime).getTime(), new Date(r.endTime).getTime())
      );
      if (collision) {
        throw new ConflictError("Sala jest juz zarezerwowana w tym czasie", "ROOM_ALREADY_BOOKED");
      }

      return reservations.create({
        roomId: room.id,
        reservedBy: input.reservedBy,
        participants: input.participants,
        startTime: new Date(start),
        endTime: new Date(end),
        status: "CONFIRMED",
        createdAt: now(),
        cancelledAt: null,
        internalNote: "created via API v2"
      });
    });
  }

  async function cancelReservation(id) {
    return runInTransaction(async ({ reservations }) => {
      const reservation = await reservations.findById(id);
      if (!reservation) throw new NotFoundError("Reservation");

      const newStatus = "CANCELLED";

      // idempotentność: ponowne anulowanie zwraca rezerwację bez zmian
      if (reservation.status === newStatus) return reservation;

      if (!ALLOWED_TRANSITIONS[reservation.status].includes(newStatus)) {
        throw new ConflictError(
          `Nie mozna zmienic statusu z ${reservation.status} na ${newStatus}`,
          "INVALID_STATUS_TRANSITION"
        );
      }

      if (new Date(reservation.startTime).getTime() <= now().getTime()) {
        throw new ConflictError(
          "Nie mozna anulowac rezerwacji, ktora juz sie rozpoczela",
          "RESERVATION_ALREADY_STARTED"
        );
      }

      return reservations.update(id, { status: newStatus, cancelledAt: now() });
    });
  }

  return { listReservations, getReservation, createReservation, cancelReservation };
}

module.exports = { createReservationsService };
