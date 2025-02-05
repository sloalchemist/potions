create or replace view
  character_worlds as
select
  characters.character_id,
  worlds.world_id,
  worlds.ably_api_key,
  characters.health,
  characters.gold,
  characters.pname
from
  characters
  join worlds on worlds.id = characters.current_world_id;