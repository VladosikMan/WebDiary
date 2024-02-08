create table public.user(
	id bigserial primary key,
	name varchar(30) not null unique,
    mail varchar(30) not null unique,
	password varchar(50) not null
);