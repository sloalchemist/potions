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

