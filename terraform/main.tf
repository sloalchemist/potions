terraform {
  required_providers {
    ably = {
      source = "ably/ably"
    }
    supabase = {
      source = "supabase/supabase"
    }
  }
}

# Configure Ably provider
provider "ably" {
  token = var.ably_account_token
}

# Configure Supabase provider
provider "supabase" {
  access_token = var.supabase_access_token
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

# Create Supabase project
resource "supabase_project" "potions" {
  organization_id   = var.supabase_organization_id
  name             = "${var.project_name}-${var.environment}"
  database_password = var.supabase_db_pass
  region           = "us-west-1"

  lifecycle {
    ignore_changes = [
      database_password,
      instance_size,
    ]
  }
}

# Get pooler connection string
data "supabase_pooler" "main" {
  project_ref = supabase_project.potions.id
}

locals {
  db_connection_string = replace(data.supabase_pooler.main.url["transaction"], "[YOUR-PASSWORD]", var.supabase_db_pass)
}

# Execute database setup SQL
resource "null_resource" "database_setup" {
  depends_on = [supabase_project.potions]

  provisioner "local-exec" {
    command = "psql -f ../sql/setup.sql \"${local.db_connection_string}\""
  }
}

# Insert test world
resource "null_resource" "insert_test_world" {
  depends_on = [null_resource.database_setup]

  provisioner "local-exec" {
    command = "psql \"${local.db_connection_string}\" -c \"INSERT INTO worlds (world_id, ably_api_key) VALUES ('test-world', '${ably_api_key.root.key}')\""
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
