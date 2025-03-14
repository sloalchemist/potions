variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "potions"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "ably_account_token" {
  description = "Ably account token for authentication"
  type        = string
  sensitive   = true
}

variable "supabase_access_token" {
  description = "Supabase access token"
  type        = string
  sensitive   = true
}

variable "supabase_db_pass" {
  description = "Supabase database password"
  type        = string
}

variable "supabase_organization_id" {
  description = "Supabase organization ID"
  type        = string
}

variable "render_api_key" {
  description = "Render API key"
  type        = string
  sensitive   = true
}

variable "render_owner_id" {
  description = "Render owner ID"
  type        = string
}

variable "github_token" {
  description = "GitHub token"
  type        = string
  sensitive   = true
}

variable "test_uptime_server_url" {
  description = "Test world uptime server URL from uptime kuma"
}

variable "test_uptime_server_msg" {
  description = "Test world uptime server message"
  type        = string
}

variable "fire_uptime_server_url" {
  description = "Fire world uptime server URL from uptime kuma"
}

variable "fire_uptime_server_msg" {
  description = "Fire world uptime server message"
  type        = string
}

variable "water_uptime_server_url" {
  description = "Water world uptime server URL from uptime kuma"
}

variable "water_uptime_server_msg" {
  description = "Water world uptime server message"
  type        = string
}
