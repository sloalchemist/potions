terraform {
  required_providers {
    ably = {
      source = "ably/ably"
    }
  }
}

# Configure Ably provider
provider "ably" {
  token = var.ably_account_token
}

# Create Ably app
resource "ably_app" "potions" {
  name = "${var.project_name}-${var.environment}"
  status = "enabled"
  tls_only = false
}

# Create root API key with all capabilities
resource "ably_api_key" "root" {
  app_id = ably_app.potions.id
  name   = "root-key"
  capabilities = {
    "[*]*" = ["subscribe", "publish", "presence", "history", "push-subscribe", "push-admin", "channel-metadata", "privileged-headers"] # FIXME: root has every capability on every resource
  }
}

# Create .env files for each package
resource "local_file" "auth_server_env" {
  filename = "../packages/auth-server/.env"
  content = "ABLY_API_KEY=${ably_api_key.root.key}"
  file_permission = "0600"
}

resource "local_file" "server_env" {
  filename = "../packages/server/.env"
  content = "ABLY_API_KEY=${ably_api_key.root.key}"
  file_permission = "0600"
}
