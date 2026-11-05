const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// data względem "teraz": dni do przodu + godzina (czas lokalny)
function at(daysFromNow, hour, minute = 0) {
  const date = new Date(Date.now() + daysFromNow * DAY);
  date.setHours(hour, minute, 0, 0);
  return date;
}

exports.seed = async function (knex) {
  // czyścimy tabele i resetujemy liczniki ID -> po każdym seed:run ten sam stan
  await knex.raw("TRUNCATE reservations, rooms, buildings RESTART IDENTITY CASCADE");

  await knex("buildings").insert([
    { name: "Budynek A - Informatyka", address: "ul. Kampusowa 12, Kraków" },     // id 1
    { name: "Budynek B - Elektrotechnika", address: "ul. Kampusowa 14, Kraków" }, // id 2
    { name: "Budynek C - Biblioteka", address: "ul. Kampusowa 20, Kraków" }       // id 3 - bez sal
  ]);

  await knex("rooms").insert([
    { building_id: 1, name: "A101", capacity: 30 }, // id 1
    { building_id: 1, name: "A102", capacity: 35 }, // id 2
    { building_id: 1, name: "A103", capacity: 40 }, // id 3
    { building_id: 1, name: "A104", capacity: 45 }, // id 4
    { building_id: 2, name: "B201", capacity: 20 }, // id 5
    { building_id: 2, name: "B202", capacity: 60 }  // id 6
  ]);

  const now = Date.now();

  await knex("reservations").insert([
    {
      // już trwa - zaczęła się godzinę temu
      room_id: 4,
      reserved_by: "Mateusz Kaliński",
      participants: 10,
      start_time: new Date(now - HOUR),
      end_time: new Date(now + HOUR),
      status: "CONFIRMED",
      created_at: new Date(now - 3 * DAY)
    },
    {
      room_id: 1,
      reserved_by: "Karolina Nowak",
      participants: 25,
      start_time: at(2, 8, 15),
      end_time: at(2, 9, 45),
      status: "CONFIRMED",
      created_at: new Date(now - 2 * DAY)
    },
    {
      room_id: 1,
      reserved_by: "Tomasz Zając",
      participants: 18,
      start_time: at(2, 10, 0),
      end_time: at(2, 11, 30),
      status: "CONFIRMED",
      created_at: new Date(now - 2 * DAY + 3 * HOUR)
    },
    {
      // anulowana
      room_id: 5,
      reserved_by: "Agnieszka Wójcik",
      participants: 12,
      start_time: at(3, 12, 0),
      end_time: at(3, 14, 0),
      status: "CANCELLED",
      cancelled_at: new Date(now - 2 * HOUR),
      created_at: new Date(now - DAY)
    },
    {
      room_id: 6,
      reserved_by: "Paweł Lewandowski",
      participants: 50,
      start_time: at(5, 9, 0),
      end_time: at(5, 12, 0),
      status: "CONFIRMED",
      created_at: new Date(now - 5 * HOUR)
    },
    {
      room_id: 2,
      reserved_by: "Mateusz Kaliński",
      participants: 30,
      start_time: at(7, 16, 0),
      end_time: at(7, 17, 30),
      status: "CONFIRMED",
      created_at: new Date(now - HOUR)
    }
  ]);
};
