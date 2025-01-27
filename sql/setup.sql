create table
  worlds (
    id bigint generated by default as identity not null,
    created_at timestamp with time zone not null default now(),
    world_id text not null,
    ably_api_key text null,
    constraint worlds_pkey primary key (id),
    constraint worlds_world_id_key unique (world_id)
  ) tablespace pg_default;

create table
  characters (
    id bigint generated by default as identity not null,
    created_at timestamp with time zone not null default now(),
    character_id uuid not null,
    current_world_id bigint null,
    health smallint not null default 100,
    pname text not null,
    gold bigint not null default 0,
    appearance int[] default '{16734003, 4367253, 1752748}', -- Random default value for now
    constraint characters_pkey primary key (id),
    constraint characters_character_id_key unique (character_id),
    constraint characters_current_world_id_fkey foreign key (current_world_id) references worlds (id)
  ) tablespace pg_default;

create or replace view
  character_worlds as
select
  characters.character_id,
  worlds.world_id,
  worlds.ably_api_key
from
  characters
  join worlds on worlds.id = characters.current_world_id;

CREATE OR REPLACE FUNCTION load_world(
    p_character_id UUID,
    p_name TEXT,
    p_appearance TEXT[]
)
RETURNS TABLE (
    character_id UUID,
    world_id TEXT,
    ably_api_key TEXT,
    pname NAME,
    health SMALLINT,
    gold BIGINT,
    appearance INT[]
) AS $$
DECLARE
    existing_character RECORD;
BEGIN
    SELECT *
    INTO existing_character
    FROM characters c
    WHERE c.character_id = p_character_id;

    IF FOUND THEN
        RETURN QUERY
        SELECT cw.character_id, cw.world_id, cw.ably_api_key
        FROM character_worlds cw
        WHERE cw.character_id = p_character_id;
    ELSE
        INSERT INTO characters (character_id, current_world_id, pname, appearance)
        VALUES (p_character_id, 1, p_name, p_appearance);

        RETURN QUERY
        SELECT cw.character_id, cw.world_id, cw.ably_api_key
        FROM character_worlds cw
        WHERE cw.character_id = p_character_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_world(p_character_id TEXT, p_world_id TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE characters
    SET current_world_id = (SELECT id FROM worlds WHERE world_id = p_world_id)
    WHERE character_id = p_character_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No update occurred. Check if character_id (%) or world_id (%) exists.', p_character_id, p_world_id;
    END IF;
END;
$$ LANGUAGE plpgsql;
