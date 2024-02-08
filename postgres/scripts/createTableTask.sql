create table public.task(
	id bigserial primary key,
	id_user bigint  references public.user(id),
	task varchar(30) not null,
	data timestamptz,
	status smallint,
	syncing boolean
);