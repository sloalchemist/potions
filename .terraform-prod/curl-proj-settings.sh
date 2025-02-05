curl -s \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  https://api.supabase.io/v1/projects/irwwaqmfcarqspzhllcd \
  | jq -r '.status'