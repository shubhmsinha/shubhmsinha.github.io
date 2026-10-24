-- Supabase SQL for The Menu Edit (Raj Bagh). Run only in a new project.
-- AFTER running: enable anonymous sign-ins; set organizer account in private.organizers.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table if not exists private.organizers(user_id uuid primary key references auth.users(id) on delete cascade);
alter table private.organizers enable row level security;
revoke all on private.organizers from public, anon, authenticated;
create or replace function public.user_is_organizer()
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from private.organizers where user_id=auth.uid());
$$;
revoke all on function public.user_is_organizer() from public;
grant execute on function public.user_is_organizer() to authenticated;

create table if not exists public.menu_options(
 item_id text primary key check(length(item_id)=12), section_id text not null, enabled boolean not null default true
);
alter table public.menu_options enable row level security;
revoke all on public.menu_options from anon, authenticated;
update public.menu_options set enabled=false;
insert into public.menu_options(item_id,section_id) values
('ea26eb6bafff','drinks'),
('98b935d7acf1','drinks'),
('8eea090e3dbd','drinks'),
('9a09e570c183','drinks'),
('20787516db9e','drinks'),
('01f6640bcf0b','drinks'),
('56a9143acf12','drinks'),
('09101a637c98','drinks'),
('a54d7116fc20','drinks'),
('21c90ed152ff','drinks'),
('97e58ac7f554','drinks'),
('f2a27e28f418','drinks'),
('7e04374b6a49','drinks'),
('b79cbc888a4d','drinks'),
('de7b3e3cf857','drinks'),
('b55e59dda0e3','drinks'),
('93503af72143','drinks'),
('3febc875ace1','drinks'),
('f0a49f00f923','drinks'),
('41a45ac18392','drinks'),
('6cd926a32142','drinks'),
('7895bd8a8d16','drinks'),
('13e42af5f1a1','drinks'),
('15036a153540','drinks'),
('40e91e22bdba','drinks'),
('7117a1cc0803','drinks'),
('b0e093761978','drinks'),
('481dc89ae693','drinks'),
('2af64db87c33','drinks'),
('94ba464a14c5','starters'),
('bcd2b51b91a1','starters'),
('d810b095a92e','starters'),
('7612f62cb883','starters'),
('4c65222483c0','starters'),
('44a89a972edf','starters'),
('3e2dc721b76e','starters'),
('5a5231f5bd1e','starters'),
('7354c2022a2a','starters'),
('52e6ac7599c4','starters'),
('29a432e9deef','starters'),
('9053fab1d9f0','starters'),
('be69e46c2367','starters'),
('05f6172424ee','starters'),
('da2b4bc557b2','starters'),
('20e7347fee83','starters'),
('14d5286128bd','starters'),
('4eabb15225ac','starters'),
('d34c67d16fed','starters'),
('9c621ee8cac6','starters'),
('28106a498d69','starters'),
('32b9383ab847','starters'),
('c463fcbf026d','starters'),
('75ec65e4d339','starters'),
('f8e928124f54','starters'),
('51ab341ac69b','starters'),
('6043fd7865f8','starters'),
('f923fbb72bce','starters'),
('35ea1b4b5c43','starters'),
('a7454c7ff3f0','starters'),
('1f9d9b9dc53e','starters'),
('3e6f724bd837','starters'),
('77df8e5d8794','starters'),
('d5182905bc6d','starters'),
('61f69e7ffe2f','starters'),
('eb11265b4e1e','starters'),
('b3515c8225d1','starters'),
('a149e227b8b0','starters'),
('94d63bf3dfbb','starters'),
('6e2597b79c69','starters'),
('93d910121da9','starters'),
('9a0933cdc4c6','salads'),
('c4d5bee3dcbc','salads'),
('cde7e5109e69','salads'),
('bb760c63b296','salads'),
('e65c531243ee','salads'),
('4e7753286ec3','salads'),
('759b6d71d801','salads'),
('1de3d4db7d85','salads'),
('902f2b17db46','salads'),
('9627fc51f463','salads'),
('053daadbe01d','salads'),
('49c32206f4c1','salads'),
('fbc16e7f7a81','salads'),
('757193e39e1d','salads'),
('ba52ec3dae60','salads'),
('b2415b5159ef','salads'),
('d003171c3a4b','salads'),
('dce853a862a9','salads'),
('1d50b7d76e33','salads'),
('f89d9f0be6c2','salads'),
('509853d4d1e0','salads'),
('5ced42536e94','salads'),
('a19565912583','salads'),
('50e8a0179a89','salads'),
('987ad0c0f564','salads'),
('b6a071b8a5a0','salads'),
('387f92b28e9a','salads'),
('d4ec4ece5206','salads'),
('1dd588f2c4bc','salads'),
('cab1553001aa','salads'),
('3f2d22c0dfe7','salads'),
('47f2a89c4b86','salads'),
('c1d495854b2b','salads'),
('4caa3aad4285','salads'),
('b71514242a98','salads'),
('5a836906c5d1','salads'),
('3eb77fa751e9','salads'),
('1a1cd8ed6796','curd'),
('bb3f9cdf7968','curd'),
('28e1da01bbce','curd'),
('22d157c330d5','curd'),
('0f95b0726b75','curd'),
('803e1271ce5b','curd'),
('8c643f506bc7','curd'),
('efa22a0284cd','curd'),
('0f02669c94f7','curd'),
('03c47515ecad','curd'),
('432f08adbfa5','curd'),
('489851aee0e5','curd'),
('4b9405553046','curd'),
('6293e272599a','soups'),
('5f7b2134d05c','soups'),
('6b9427368488','soups'),
('653c89e62689','soups'),
('df8fa8613c72','soups'),
('780edbbbbf1e','soups'),
('34d7ef1408c5','soups'),
('5b6ecb4744f2','soups'),
('b2f987c97adf','soups'),
('c0e100ee294c','soups'),
('209b9de641cf','soups'),
('17e8b45e3d53','soups'),
('901db429a713','soups'),
('081df35a4418','soups'),
('bc2926095af5','soups'),
('817d05ac01f5','soups'),
('a7f021b45563','soups'),
('3c208b0f500f','soups'),
('94fc30757f27','soups'),
('1a5ad6e1ba19','soups'),
('ca665dc19cea','soups'),
('2e36d063f1c2','soups'),
('3e305b0107c2','soups'),
('18e6142ee8ce','soups'),
('456b724032d9','soups'),
('26f6c9b5a4ce','soups'),
('6bfc9a09f309','soups'),
('314760ecde41','soups'),
('3f1f888446f4','soups'),
('3e078615f5c7','soups'),
('60b1ca9c5f11','soups'),
('349b12be9753','soups'),
('092e39b4a712','soups'),
('205a4d22a034','soups'),
('9732891a3e4a','paneer'),
('75ed34948821','paneer'),
('62d3223592f0','paneer'),
('5186691b327c','paneer'),
('fb2dba51096f','paneer'),
('adbf81245aea','paneer'),
('5440170c4b48','paneer'),
('77045ff51042','paneer'),
('879a24cd920d','paneer'),
('7a9761c88079','paneer'),
('d44f02da7561','paneer'),
('e281d0c027fb','paneer'),
('bd3e569ea084','paneer'),
('ac91fc4764a6','paneer'),
('7d7fdb19f85e','paneer'),
('854d061b90bf','paneer'),
('37c166b15375','paneer'),
('805b3cc06304','dal'),
('13781da6b108','dal'),
('82f18b3bace0','dal'),
('c2fdc8615205','dal'),
('6002c1b1ea53','dal'),
('b7d9a331dd9f','dal'),
('57d298079a55','dal'),
('af4df016bc06','dal'),
('f25dd8fda80f','dal'),
('5dd9d845855d','dal'),
('0ab1fc129f1e','dal'),
('43de16ce0a2b','dal'),
('cabcf0973a57','dal'),
('8bf3ebfbe0d2','dal'),
('f9688e0af440','vegetables'),
('f79bb7972044','vegetables'),
('897721be70e8','vegetables'),
('e8b8a47c511f','vegetables'),
('3ae55ad7279f','vegetables'),
('967b3bf4650c','vegetables'),
('526f2d08c9ba','vegetables'),
('e9db7c9847c0','vegetables'),
('2ab777e458aa','vegetables'),
('7092e185808f','vegetables'),
('9312eb66555c','vegetables'),
('f878f3b4f38d','vegetables'),
('7a179cadeb81','vegetables'),
('26a1d45093db','vegetables'),
('71e4190a42dc','vegetables'),
('ad52e783f5e8','vegetables'),
('67f764ee0f47','vegetables'),
('e6bcfc47deac','vegetables'),
('0116fc6bffba','vegetables'),
('19dd4feb3710','vegetables'),
('06581e3dddae','vegetables'),
('292c56682927','vegetables'),
('b2c7c3255bf9','vegetables'),
('296d09a6953a','vegetables'),
('bb8f29aa3329','vegetables'),
('9f112ff19e11','vegetables'),
('d2a9a6b83058','vegetables'),
('8204ccbe932d','vegetables'),
('9106e17662c4','vegetables'),
('4f68e5828cc9','vegetables'),
('8592344a09bc','vegetables'),
('43f90b3496ce','vegetables'),
('576aa2b40f3e','vegetables'),
('32f889427229','vegetables'),
('fedb94a71cc7','vegetables'),
('9007d8933374','vegetables'),
('110634a1ffa3','vegetables'),
('4808deb249a8','world'),
('1edea3e9dfba','world'),
('16ab6762f49b','world'),
('eac6b808a999','world'),
('9ce94a2b0e1a','world'),
('00539263b6c6','world'),
('4982a7491d27','world'),
('78728478a3da','world'),
('86d205827f62','world'),
('45ba70160279','world'),
('ddfcaf70b6c8','world'),
('21cdffdd0893','world'),
('89fd0c30ce7f','world'),
('29a62132add5','world'),
('71bf6b027adc','world'),
('1a73870858e7','world'),
('214d71a9a427','world'),
('786d9c19b922','world'),
('2b8dcfd06507','world'),
('0a70f1713de3','world'),
('fbdf547abaa9','world'),
('42a4b2faddfe','world'),
('4d9d608e8b2c','world'),
('34fbc908c484','world'),
('4bf37a16a5a3','world'),
('5e1b590507f8','world'),
('25ffdfc45173','world'),
('3b0f43143b30','world'),
('6461a32645d0','world'),
('ee79f8d1d5e9','world'),
('bfc8bfc4761d','world'),
('291d943c1807','world'),
('c0a0da17675f','rice'),
('d2fc9b4240f2','rice'),
('44c040b63d41','rice'),
('0ea0bbabf441','rice'),
('d4288af2407c','rice'),
('e912d7533b49','rice'),
('5be2cff848c3','rice'),
('6de0f80d3ef1','rice'),
('908caffcd32c','rice'),
('1a48c91ca080','rice'),
('0369ade5ef59','rice'),
('472604cf034d','rice'),
('0b283a001ae8','rice'),
('3d2d34ae63e2','rice'),
('f5700d950787','rice'),
('edb5ea7df764','rice'),
('d266de2b6c51','rice'),
('2c6d2c715d7c','rice'),
('83477f681e75','rice'),
('8011daa55090','breads'),
('76ae8ee3edb0','breads'),
('b39c3fed4bb6','breads'),
('707805768d13','breads'),
('1829befda8e0','breads'),
('cf718a6149aa','breads'),
('fb3c26e65342','breads'),
('9540bddbb623','breads'),
('9dbbcdc32a4a','breads'),
('db4666eeeb40','breads'),
('a92d35bb4ba9','breads'),
('d5a4e4bb733f','breads'),
('c8cca0ae8e39','desserts'),
('ce8f21ba5259','desserts'),
('0cedd61992f6','desserts'),
('f0d69a188aef','desserts'),
('5209b4597c3d','desserts'),
('79e9388328d1','desserts'),
('0fb91c04509b','desserts'),
('2d466e9736e0','desserts'),
('d4c1648457f9','desserts'),
('91af141f9cf1','desserts'),
('3e51eaf0b17b','desserts'),
('ee6076ff20fa','desserts'),
('d9b3d8d6e940','desserts'),
('261696f55ca5','desserts'),
('e0cbd32a374c','desserts'),
('a419ec5e2991','desserts'),
('39e85f3acf68','desserts'),
('53ef3b883d46','desserts'),
('a5e4f1ad55bf','desserts'),
('d88a945d2f4a','desserts'),
('924e1f3c5350','desserts'),
('7f55b33cc209','desserts'),
('49154067e43c','desserts'),
('6e147cd741b1','desserts'),
('dc4150ec8c5f','desserts'),
('bc1595bd8b58','desserts'),
('966a16bda4f5','desserts'),
('4272a9ed27ae','desserts'),
('138f8aaf8fbe','desserts'),
('98795deb81f0','desserts'),
('8d716ce18b67','desserts'),
('10c84ade48fe','desserts'),
('644cbffe4417','desserts'),
('905f341aecad','desserts'),
('a54dc721a9b0','desserts'),
('ef0a60bcbf6c','desserts'),
('67b6df2e6a6d','live'),
('9ca896936738','live'),
('6175f8942d3c','live'),
('00cc36e09796','live'),
('2eb545d48b6d','live'),
('0476d616316c','live'),
('b765a51d20c3','live'),
('e201347ccd04','live'),
('846c358bec8c','live'),
('04ac769f16bc','live'),
('52c3a3fe653a','live'),
('4f43138d8277','live'),
('f8b6fe8075e2','live'),
('de36c2154538','nonveg_starters'),
('9c357ed9840c','nonveg_starters'),
('7bf7f1fe45e7','nonveg_starters'),
('86d230433444','nonveg_starters'),
('2ec53889a316','nonveg_starters'),
('859e2e05c9db','nonveg_starters'),
('bb94defd89c7','nonveg_starters'),
('475d5e6a62f0','nonveg_starters'),
('77363b8629d9','nonveg_starters'),
('f402ff43fbe0','nonveg_starters'),
('aa10d21e05cf','nonveg_starters'),
('1c8b4cd2f6df','nonveg_starters'),
('cf48bb228c09','nonveg_starters'),
('b8c52770a01d','nonveg_starters'),
('c90f3f499186','nonveg_starters'),
('59d1f60f8162','nonveg_starters'),
('d0cbacc9141c','nonveg_starters'),
('b81675bbe1ce','nonveg_starters'),
('623b56ee1605','nonveg_starters'),
('d4cef6a57f4d','nonveg_starters'),
('d0e72677732b','nonveg_starters'),
('635cefd7fd55','nonveg_starters'),
('14efcc16cffb','nonveg_starters'),
('7699645d9723','nonveg_starters'),
('daada1e7bb0d','nonveg_mains'),
('ec748e56190f','nonveg_mains'),
('46c47a1f2420','nonveg_mains'),
('968f1497ce81','nonveg_mains'),
('4be712f6e8ae','nonveg_mains'),
('8ec352deff03','nonveg_mains'),
('e1ac7ca373fc','nonveg_mains'),
('4e086f22b680','nonveg_mains'),
('75d8fa2d283c','nonveg_mains'),
('b4743ae3f5f0','nonveg_mains'),
('4313932c0a61','nonveg_mains'),
('00ab26336296','nonveg_mains'),
('d214adec9d19','nonveg_mains'),
('65432f623d3e','nonveg_mains'),
('2776fa8bc5cf','nonveg_mains'),
('a6e3e36dd8a2','nonveg_mains'),
('9f0b8076988d','nonveg_mains'),
('a736fdcd8ecc','nonveg_mains'),
('6581e5a70438','nonveg_mains'),
('f41878c6b67f','nonveg_mains'),
('54329f4e2049','nonveg_mains'),
('0a383f3231c4','nonveg_mains'),
('f2adff29c0a0','nonveg_mains'),
('bf992a4dadc8','breakfast_cold'),
('044303a864c3','breakfast_cold'),
('f21a6d3dc560','breakfast_cold'),
('c2c4c2774a41','breakfast_cold'),
('d153f776ecf6','breakfast_cold'),
('0eb26ec63f6e','breakfast_cold'),
('4b0ddded0a82','breakfast_breads'),
('f12cb1edea85','breakfast_breads'),
('047628f40b11','breakfast_breads'),
('c44caa122615','breakfast_breads'),
('17f95e5942d4','breakfast_breads'),
('9196cac5e7f9','breakfast_breads'),
('faa64c544248','breakfast_live'),
('729000744c30','breakfast_hot'),
('cdec05dd69a1','breakfast_hot'),
('3f721872cc60','breakfast_hot'),
('2c2fa0828f7a','breakfast_hot'),
('82de5a5d648e','breakfast_hot'),
('8a1161ecc371','breakfast_hot'),
('9da075952175','breakfast_hot'),
('555d92919132','breakfast_hot'),
('cb72baca9dd4','breakfast_hot'),
('12259df7dd8c','breakfast_hot'),
('29a08eb1852e','breakfast_hot'),
('327c95e9181a','breakfast_beverages'),
('e2fc480f79f4','breakfast_beverages'),
('1df17fee502b','breakfast_beverages'),
('323e7e21c5d5','breakfast_beverages'),
('473a0c584f05','breakfast_beverages'),
('f33b020cab17','breakfast_beverages'),
('b6310ec6b310','breakfast_beverages')
on conflict(item_id) do update set section_id=excluded.section_id,enabled=true;

create table if not exists public.menu_limits(
 event_id text not null,section_id text not null,
 max_primary smallint not null check(max_primary between 1 and 30),
 primary key(event_id,section_id)
);
alter table public.menu_limits enable row level security;
revoke all on public.menu_limits from anon, authenticated;
delete from public.menu_limits;
insert into public.menu_limits(event_id,section_id,max_primary) values
('lunch1','drinks',2),
('lunch1','starters',2),
('lunch1','soups',2),
('lunch1','salads',3),
('lunch1','curd',1),
('lunch1','paneer',1),
('lunch1','dal',1),
('lunch1','rice',2),
('lunch1','vegetables',2),
('lunch1','world',2),
('lunch1','breads',4),
('lunch1','desserts',3),
('lunch2','drinks',2),
('lunch2','starters',2),
('lunch2','soups',2),
('lunch2','salads',3),
('lunch2','curd',1),
('lunch2','paneer',1),
('lunch2','dal',1),
('lunch2','rice',2),
('lunch2','vegetables',2),
('lunch2','world',2),
('lunch2','breads',4),
('lunch2','desserts',3),
('sangeet','drinks',3),
('sangeet','starters',3),
('sangeet','soups',2),
('sangeet','salads',5),
('sangeet','curd',1),
('sangeet','paneer',1),
('sangeet','dal',1),
('sangeet','rice',2),
('sangeet','vegetables',3),
('sangeet','world',2),
('sangeet','breads',4),
('sangeet','live',2),
('sangeet','desserts',3),
('gala','drinks',5),
('gala','starters',6),
('gala','soups',2),
('gala','salads',6),
('gala','paneer',2),
('gala','dal',2),
('gala','rice',2),
('gala','vegetables',5),
('gala','world',3),
('gala','breads',4),
('gala','live',6),
('gala','desserts',5)
on conflict(event_id,section_id) do update set max_primary=excluded.max_primary;

create table if not exists public.votes(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 user_name text not null check(char_length(btrim(user_name)) between 2 and 50),
 event_id text not null check(event_id in ('breakfast','lunch1','lunch2','sangeet','gala')),
 section_id text not null, item_id text not null references public.menu_options(item_id),
 rank text not null check(rank in ('primary','backup')),
 created_at timestamptz not null default now(),
 unique(user_id,event_id,item_id)
);
create index if not exists votes_event_item on public.votes(event_id,item_id);
delete from public.votes where item_id in (select item_id from public.menu_options where not enabled);
alter table public.votes enable row level security;

create or replace function public.enforce_menu_limits()
returns trigger language plpgsql security definer set search_path='' as $$
declare limit_count integer; current_count integer; section_allowed text;
begin
 if auth.uid() is null or new.user_id<>auth.uid() then
   raise exception 'You cannot vote for someone else';
 end if;
 if tg_op='UPDATE' and (old.user_id<>new.user_id or old.event_id<>new.event_id or old.item_id<>new.item_id)
 then raise exception 'Cannot transfer a vote'; end if;
 select section_id into section_allowed from public.menu_options
 where item_id=new.item_id and enabled;
 if section_allowed is null or section_allowed<>new.section_id then
  raise exception 'Item is not selectable for this category'; end if;
 if new.section_id in ('nonveg_starters','nonveg_mains') then
   if new.event_id='breakfast' then raise exception 'Non-veg choices are not allowed at breakfast'; end if;
   limit_count:=case when new.rank='backup' then 1 else 2 end;
 elsif new.event_id='breakfast' then
   if new.section_id not in ('breakfast_cold','breakfast_breads','breakfast_live','breakfast_hot','breakfast_beverages')
    or new.rank<>'primary' then raise exception 'Not a breakfast preference'; end if;
   return new;
 else
   if new.rank<>'primary' then raise exception 'Backups only permitted for non-veg starters and mains'; end if;
   select max_primary into limit_count from public.menu_limits
    where event_id=new.event_id and section_id=new.section_id;
   if limit_count is null then raise exception 'Category awaiting venue confirmation'; end if;
 end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
  new.user_id::text||':'||new.event_id||':'||new.section_id||':'||new.rank,0));
 select count(*) into current_count from public.votes
  where user_id=new.user_id and event_id=new.event_id
  and section_id=new.section_id and rank=new.rank and id<>new.id;
 if current_count>=limit_count then raise exception 'Selection quota exceeded'; end if;
 return new;
end;
$$;
drop trigger if exists check_menu_vote_limits on public.votes;
create trigger check_menu_vote_limits before insert or update on public.votes
for each row execute function public.enforce_menu_limits();

drop policy if exists "Guests can see each other's votes" on public.votes;
drop policy if exists "Users or organizer can read named votes" on public.votes;
drop policy if exists "Guests can add their own votes" on public.votes;
drop policy if exists "Guests can edit their own votes" on public.votes;
drop policy if exists "Guests can remove their own votes" on public.votes;
create policy "Users or organizer can read named votes" on public.votes
for select to authenticated
using (user_id=(select auth.uid()) or (select public.user_is_organizer()));
create policy "Guests can add their own votes" on public.votes for insert to authenticated
with check (user_id=(select auth.uid()));
create policy "Guests can edit their own votes" on public.votes for update to authenticated
using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy "Guests can remove their own votes" on public.votes for delete to authenticated
using (user_id=(select auth.uid()));
revoke all on public.votes from anon;
grant select,insert,update,delete on public.votes to authenticated;

create or replace function public.vote_totals()
returns table(event_id text,item_id text,primary_count bigint,backup_count bigint)
language sql stable security definer set search_path='' as $$
 select v.event_id,v.item_id,
 count(*) filter(where v.rank='primary') as primary_count,
 count(*) filter(where v.rank='backup') as backup_count
 from public.votes v where auth.uid() is not null
 group by v.event_id,v.item_id;
$$;
revoke all on function public.vote_totals() from public;
grant execute on function public.vote_totals() to authenticated;

create or replace function public.vote_participants()
returns table(event_id text,participants bigint)
language sql stable security definer set search_path='' as $$
 select v.event_id,count(distinct v.user_id) as participants
 from public.votes v where auth.uid() is not null group by v.event_id;
$$;
revoke all on function public.vote_participants() from public;
grant execute on function public.vote_participants() to authenticated;

create or replace function public.organizer_reset_all_votes(confirmation text)
returns void language plpgsql volatile security definer set search_path='' as $$
begin
 if not public.user_is_organizer() then raise exception 'Organizer only'; end if;
 if confirmation<>'RESET ALL VOTES' then raise exception 'Wrong confirmation'; end if;
 delete from public.votes;
end;
$$;
revoke all on function public.organizer_reset_all_votes(text) from public;
grant execute on function public.organizer_reset_all_votes(text) to authenticated;

do $$begin
 if exists(select 1 from pg_catalog.pg_publication_tables
  where pubname='supabase_realtime' and schemaname='public' and tablename='votes')
 then alter publication supabase_realtime drop table public.votes; end if;
end$$;
-- PRIVATE organizer onboarding (after creating and verifying email/password Auth user):
-- insert into private.organizers(user_id) values ('YOUR-VERIFIED-AUTH-USER-UUID') on conflict do nothing;

-- Supabase default grants can accidentally expose SECURITY DEFINER RPCs.
-- Explicitly revoke from all implicit/public API roles, then grant only intended RPCs.
revoke all on function public.enforce_menu_limits() from public, anon, authenticated;
revoke all on function public.user_is_organizer() from public, anon, authenticated;
revoke all on function public.vote_totals() from public, anon, authenticated;
revoke all on function public.vote_participants() from public, anon, authenticated;
revoke all on function public.organizer_reset_all_votes(text) from public, anon, authenticated;
grant execute on function public.user_is_organizer() to authenticated;
grant execute on function public.vote_totals() to authenticated;
grant execute on function public.vote_participants() to authenticated;
grant execute on function public.organizer_reset_all_votes(text) to authenticated;
