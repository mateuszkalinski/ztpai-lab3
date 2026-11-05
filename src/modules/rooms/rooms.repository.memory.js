const DEFAULT_ROOMS = [
  { id: 1, name: "A101", capacity: 30 },
  { id: 2, name: "A102", capacity: 35 },
  { id: 3, name: "A103", capacity: 40 },
  { id: 4, name: "A104", capacity: 45 }
];

function createRoomsRepository(seed = DEFAULT_ROOMS) {
  const rooms = structuredClone(seed);

  return {
    async findAll() {
      return rooms;
    },

    async findById(id) {
      return rooms.find(room => room.id === id) ?? null;
    }
  };
}

module.exports = { createRoomsRepository };