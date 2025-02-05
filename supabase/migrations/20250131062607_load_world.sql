DROP FUNCTION IF EXISTS load_world(UUID);

CREATE FUNCTION load_world(
    p_character_id UUID
)
RETURNS TABLE (
    character_id UUID,
    world_id TEXT,
    ably_api_key TEXT,
    pname TEXT,
    health SMALLINT,
    gold BIGINT
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
        SELECT cw.character_id, cw.world_id, cw.ably_api_key, cw.pname,  cw.health, cw.gold
        FROM character_worlds cw
        WHERE cw.character_id = p_character_id;
    ELSE
        INSERT INTO characters (character_id, current_world_id)
        VALUES (p_character_id, 1);

        RETURN QUERY
        SELECT cw.character_id, cw.world_id, cw.ably_api_key, cw.pname,  cw.health, cw.gold
        FROM character_worlds cw
        WHERE cw.character_id = p_character_id;
    END IF;
END;
$$ LANGUAGE plpgsql;