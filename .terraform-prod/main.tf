terraform {
  cloud {

    organization = "SLOPotions"

    workspaces {
      name = "SLOPotions"
    }
  }

  required_providers {
    ably = {
      source = "ably/ably"
    }
    supabase = {
      source = "supabase/supabase"
    }
    time = {
      source = "hashicorp/time"
    }
    render = {
      source  = "render-oss/render"
      version = "1.4.0"
    }
    github = {
      source  = "integrations/github"
      version = "6.5.0"
    }
    random = {
      source = "hashicorp/random"
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

provider "render" {
  api_key  = var.render_api_key
  owner_id = var.render_owner_id
}

provider "github" {
  token = var.github_token
  owner = "sloalchemist"
}

# Create Ably app
resource "ably_app" "potions" {
  name     = "${var.project_name}-${var.environment}"
  status   = "enabled"
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
  name              = "${var.project_name}-${var.environment}"
  database_password = var.supabase_db_pass
  region            = "us-west-1"

  lifecycle {
    ignore_changes = [
      database_password,
      instance_size,
    ]
  }
}

resource "null_resource" "poll_project_status" {
  depends_on = [supabase_project.potions]

  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]
    command     = <<-EOT
      set -e
      TIMEOUT=300   # 5 minutes
      INTERVAL=15   # check every 15 seconds
      ELAPSED=0

      while [ $ELAPSED -lt $TIMEOUT ]; do
        STATUS=$(curl -s -H "Authorization: Bearer ${var.supabase_access_token}" \
          https://api.supabase.io/v1/projects/${supabase_project.potions.id} \
          | jq -r '.status')

        if [ "$STATUS" == "ACTIVE_HEALTHY" ]; then
          echo "Project status is ACTIVE_HEALTHY. Continuing..."
          exit 0
        fi

        echo "Current project status is: $STATUS. Waiting..."
        sleep $INTERVAL
        ELAPSED=$((ELAPSED + INTERVAL))
      done

      echo "Project status did not reach ACTIVE_HEALTHY within $TIMEOUT seconds."
      exit 1
    EOT
  }
}

# Get pooler connection string
data "supabase_pooler" "main" {
  depends_on  = [null_resource.poll_project_status]
  project_ref = supabase_project.potions.id
}

locals {
  db_connection_string = replace(data.supabase_pooler.main.url["transaction"], "[YOUR-PASSWORD]", var.supabase_db_pass)
}

# Add delay before believing that supabase is actually setup
resource "time_sleep" "wait_for_supabase" {
  depends_on      = [data.supabase_pooler.main]
  create_duration = "30s"
}

# Execute database setup SQL
resource "null_resource" "database_setup" {
  depends_on = [time_sleep.wait_for_supabase]

  provisioner "local-exec" {
    # Force Terraform to run under bash
    interpreter = ["bash", "-c"]

    command = <<-EOT
      psql -f ../sql/setup.sql "${local.db_connection_string}"
    EOT
  }
}

# Run Supabase migrations
resource "null_resource" "supabase_migrations" {
  depends_on = [supabase_project.potions, null_resource.database_setup]

  provisioner "local-exec" {
    working_dir = "${path.module}/../"
    interpreter = ["/bin/bash", "-c"]
    command     = <<-EOT
      echo "${var.supabase_db_pass}"
      # Set supabase db password environment variable
      export SUPABASE_DB_PASSWORD="${var.supabase_db_pass}"
      
      # Login using access token (non-interactive)
      supabase login --token "${var.supabase_access_token}"
      
      # Link project (non-interactive)
      supabase link --project-ref "${supabase_project.potions.id}"
      
      echo "${var.supabase_db_pass}"
      # Run migrations
      supabase db push -p "${var.supabase_db_pass}"
    EOT
  }
}

# Insert test world
resource "null_resource" "insert_test_world" {
  depends_on = [null_resource.database_setup]

  provisioner "local-exec" {
    # Force Terraform to run under bash
    interpreter = ["bash", "-c"]

    command = <<-EOT
      psql "${local.db_connection_string}" -c "INSERT INTO worlds (world_id, ably_api_key) VALUES ('test-world', '${ably_api_key.root.key}')"
    EOT
  }
}

data "supabase_apikeys" "dev" {
  depends_on  = [time_sleep.wait_for_supabase]
  project_ref = supabase_project.potions.id
}

# Generate random string for AUTH_SERVER_SECRET
resource "random_password" "auth_server_secret" {
  length  = 32
  special = true
}

resource "render_web_service" "potions_auth" {
  name               = "${var.project_name}-${var.environment}-auth"
  plan               = "starter"
  region             = "oregon" # or "us-east", "frankfurt", etc.
  start_command      = "cd packages/auth-server && pnpm start"
  pre_deploy_command = "echo 'hello world'"
  root_directory     = "." # Changed to root directory

  runtime_source = {
    native_runtime = {
      auto_deploy   = true
      branch        = "main"
      build_command = "pnpm install && pnpm build"
      build_filter = {
        paths         = ["src/**"]
        ignored_paths = ["tests/**"]
      }
      repo_url = "https://github.com/sloalchemist/potions"
      runtime  = "node"
    }
  }

  env_vars = {
    "ABLY_API_KEY"         = { value : "${ably_api_key.root.key}" },
    "SUPABASE_URL"         = { value : "https://${supabase_project.potions.id}.supabase.co" },
    "SUPABASE_SERVICE_KEY" = { value : "${data.supabase_apikeys.dev.service_role_key}" },
    "AUTH_SERVER_SECRET"   = { value : "${random_password.auth_server_secret.result}" },
  }

  # Optionally depends on Supabase or Ably if you want to ensure
  # everything is provisioned first:
  depends_on = [
    data.supabase_apikeys.dev,
    null_resource.insert_test_world,
    null_resource.database_setup,
    ably_api_key.root,
  ]
}

data "github_repository" "repo" {
  full_name = "sloalchemist/potions"
}

resource "github_repository_environment" "repo_environment" {
  repository  = data.github_repository.repo.name
  environment = "github-pages"
}

resource "github_actions_environment_variable" "server_url" {
  repository    = data.github_repository.repo.name
  environment   = github_repository_environment.repo_environment.environment
  variable_name = "SERVER_URL"
  value         = render_web_service.potions_auth.url
}

resource "render_background_worker" "potions_test_world" {
  name               = "${var.project_name}-${var.environment}-test-world"
  plan               = "starter"
  region             = "oregon" # or "us-east", "frankfurt", etc.
  start_command      = "cd packages/server && pnpm serve test-world"
  pre_deploy_command = "echo 'hello world'"
  root_directory     = "."

  runtime_source = {
    native_runtime = {
      auto_deploy   = true
      branch        = "main"
      build_command = "pnpm install && pnpm build && cd packages/server && pnpm run create test-world"
      build_filter = {
        paths         = ["src/**"]
        ignored_paths = ["tests/**"]
      }
      repo_url = "https://github.com/sloalchemist/potions"
      runtime  = "node"
    }
  }

  env_vars = {
    "ABLY_API_KEY"         = { value : "${ably_api_key.root.key}" },
    "AUTH_SERVER_URL"      = { value : "${render_web_service.potions_auth.url}" },
    "SUPABASE_URL"         = { value : "${"https://${supabase_project.potions.id}.supabase.co"}" },
    "SUPABASE_SERVICE_KEY" = { value : "${data.supabase_apikeys.dev.service_role_key}" },
    "AUTH_SERVER_SECRET"   = { value : "${random_password.auth_server_secret.result}" }
    "SERVER_URL"           = { value : "${var.test_uptime_server_url}" }
    "UPTIME_MSG"           = { value : "${var.test_uptime_server_msg}" }
  }
}

resource "render_background_worker" "potions_fire_world" {
  name               = "${var.project_name}-${var.environment}-fire-world"
  plan               = "starter"
  region             = "oregon" # or "us-east", "frankfurt", etc.
  start_command      = "cd packages/server && pnpm serve fire-world"
  pre_deploy_command = "echo 'hello fire world'"
  root_directory     = "."

  runtime_source = {
    native_runtime = {
      auto_deploy   = true
      branch        = "main"
      build_command = "pnpm install && pnpm build && cd packages/server && pnpm run create fire-world"
      build_filter = {
        paths         = ["src/**"]
        ignored_paths = ["tests/**"]
      }
      repo_url = "https://github.com/sloalchemist/potions"
      runtime  = "node"
    }
  }

  env_vars = {
    "ABLY_API_KEY"         = { value : "${ably_api_key.root.key}" },
    "AUTH_SERVER_URL"      = { value : "${render_web_service.potions_auth.url}" },
    "SUPABASE_URL"         = { value : "${"https://${supabase_project.potions.id}.supabase.co"}" },
    "SUPABASE_SERVICE_KEY" = { value : "${data.supabase_apikeys.dev.service_role_key}" },
    "AUTH_SERVER_SECRET"   = { value : "${random_password.auth_server_secret.result}" }
    "SERVER_URL"           = { value : "${var.fire_uptime_server_url}" }
    "UPTIME_MSG"           = { value : "${var.fire_uptime_server_msg}" }
  }
}

resource "render_background_worker" "potions_water_world" {
  name               = "${var.project_name}-${var.environment}-water-world"
  plan               = "starter"
  region             = "oregon" # or "us-east", "frankfurt", etc.
  start_command      = "cd packages/server && pnpm serve water-world"
  pre_deploy_command = "echo 'hello water world'"
  root_directory     = "."

  runtime_source = {
    native_runtime = {
      auto_deploy   = true
      branch        = "main"
      build_command = "pnpm install && pnpm build && cd packages/server && pnpm run create water-world"
      build_filter = {
        paths         = ["src/**"]
        ignored_paths = ["tests/**"]
      }
      repo_url = "https://github.com/sloalchemist/potions"
      runtime  = "node"
    }
  }

  env_vars = {
    "ABLY_API_KEY"         = { value : "${ably_api_key.root.key}" },
    "AUTH_SERVER_URL"      = { value : "${render_web_service.potions_auth.url}" },
    "SUPABASE_URL"         = { value : "${"https://${supabase_project.potions.id}.supabase.co"}" },
    "SUPABASE_SERVICE_KEY" = { value : "${data.supabase_apikeys.dev.service_role_key}" },
    "AUTH_SERVER_SECRET"   = { value : "${random_password.auth_server_secret.result}" }
    "SERVER_URL"           = { value : "${var.water_uptime_server_url}" }
    "UPTIME_MSG"           = { value : "${var.water_uptime_server_msg}" }
  }
}
