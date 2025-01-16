output "ably_root_key" {
  description = "The root API key for Ably"
  value       = ably_api_key.root.key
  sensitive   = true
}

output "db_connection_string" {
  description = "Database connection string for psql"
  value       = local.db_connection_string
  sensitive   = true
}
