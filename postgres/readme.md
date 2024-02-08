SELECT table_name FROM information_schema.tables  WHERE table_schema='public' ORDER BY table_name;
// получить список таблиц их схемы

psql -U diaryus -d diarydb
gonkpong
#выборка по дате
select * from public.task where date(data) = '2022-01-03';