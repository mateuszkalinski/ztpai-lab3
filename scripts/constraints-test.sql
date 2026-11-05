-- Test constraintów: każdy INSERT poniżej linii "OK" powinien zakończyć się błędem
TRUNCATE reservations, rooms, buildings RESTART IDENTITY CASCADE;

-- OK: dane potrzebne do testów
INSERT INTO buildings (name, address) VALUES ('Budynek A - Informatyka', 'ul. Kampusowa 12, Kraków');
INSERT INTO rooms (building_id, name, capacity) VALUES (1, 'A101', 30);
INSERT INTO rooms (building_id, name, capacity) VALUES (1, 'A102', 35);
INSERT INTO reservations (room_id, reserved_by, participants, start_time, end_time) VALUES (1, 'Mateusz Kaliński', 12, '2026-11-18 08:15+01', '2026-11-18 09:45+01');

-- 1. UNIQUE buildings.name - drugi budynek o tej samej nazwie
INSERT INTO buildings (name, address) VALUES ('Budynek A - Informatyka', 'ul. Lea 114, Kraków');

-- 2. UNIQUE (building_id, name) - druga sala A101 w tym samym budynku
INSERT INTO rooms (building_id, name, capacity) VALUES (1, 'A101', 24);

-- 3. CHECK capacity > 0 - sala bez miejsc
INSERT INTO rooms (building_id, name, capacity) VALUES (1, 'A103', 0);

-- 4. FK rooms -> buildings - budynek, który nie istnieje
INSERT INTO rooms (building_id, name, capacity) VALUES (999, 'A104', 45);

-- 5. CHECK end_time > start_time - koniec przed początkiem
INSERT INTO reservations (room_id, reserved_by, participants, start_time, end_time) VALUES (2, 'Karolina Nowak', 20, '2026-11-19 14:00+01', '2026-11-19 12:30+01');

-- 6. CHECK status - status spoza listy
INSERT INTO reservations (room_id, reserved_by, participants, start_time, end_time, status) VALUES (2, 'Karolina Nowak', 20, '2026-11-19 12:30+01', '2026-11-19 14:00+01', 'PENDING');

-- 7. CHECK participants > 0 - rezerwacja na 0 osób
INSERT INTO reservations (room_id, reserved_by, participants, start_time, end_time) VALUES (1, 'Tomasz Zając', 0, '2026-11-20 10:00+01', '2026-11-20 11:30+01');

-- 8. FK reservations -> rooms - sala, która nie istnieje
INSERT INTO reservations (room_id, reserved_by, participants, start_time, end_time) VALUES (999, 'Tomasz Zając', 15, '2026-11-20 10:00+01', '2026-11-20 11:30+01');

-- 9. NOT NULL - brak osoby rezerwującej
INSERT INTO reservations (room_id, participants, start_time, end_time) VALUES (1, 15, '2026-11-21 16:00+01', '2026-11-21 17:30+01');

-- 10. ON DELETE RESTRICT - sala ma rezerwację, budynek ma sale
DELETE FROM rooms WHERE id = 1;
DELETE FROM buildings WHERE id = 1;
