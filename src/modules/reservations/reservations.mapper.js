function toIso(value) {
  return value ? new Date(value).toISOString() : null;
}

function toReservationResponse(reservation) {
  return {
    id: reservation.id,
    roomId: reservation.roomId,
    reservedBy: reservation.reservedBy,
    participants: reservation.participants,
    startTime: toIso(reservation.startTime),
    endTime: toIso(reservation.endTime),
    status: reservation.status,
    createdAt: toIso(reservation.createdAt),
    cancelledAt: toIso(reservation.cancelledAt)
    // internalNote celowo pominięte - nie może wyjść poza API
  };
}

module.exports = { toReservationResponse };