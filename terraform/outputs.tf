output "ably_root_key" {
  description = "The root API key for Ably"
  value       = ably_api_key.root.key
  sensitive   = true
}
