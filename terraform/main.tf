# Terraform configuration for Podman-based Master Data Maintenance System
terraform {
  required_version = ">= 1.0"
  required_providers {
    podman = {
      source  = "registry.terraform.io/containers/podman"
      version = "~> 0.1"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.4"
    }
  }
}

# Provider configuration
provider "podman" {
  # Podman provider configuration
}

# Local variables
locals {
  project_name = "master-data-maintenance"
  network_name = "${local.project_name}-network"
  
  # Environment variables
  postgres_env = {
    POSTGRES_DB       = var.postgres_db
    POSTGRES_USER     = var.postgres_user
    POSTGRES_PASSWORD = var.postgres_password
    POSTGRES_INITDB_ARGS = "--encoding=UTF-8"
  }
  
  redis_env = {
    REDIS_PASSWORD = var.redis_password
  }
  
  api_env = {
    NODE_ENV         = var.node_env
    PORT            = "3000"
    DB_HOST         = "database"
    DB_PORT         = "5432"
    DB_NAME         = var.postgres_db
    DB_USER         = var.postgres_user
    DB_PASSWORD     = var.postgres_password
    REDIS_HOST      = "redis"
    REDIS_PORT      = "6379"
    REDIS_PASSWORD  = var.redis_password
    JWT_SECRET      = var.jwt_secret
    CORS_ORIGIN     = var.cors_origin
    LOG_LEVEL       = var.log_level
  }
  
  frontend_env = {
    VITE_API_URL = var.api_url
  }
}

# Create Podman network
resource "podman_network" "master_data_network" {
  name = local.network_name
  
  # Network configuration
  subnet = "172.21.0.0/16"
  
  # Enable DNS resolution
  dns_enabled = true
  
  # Internal network
  internal = false
  
  labels = {
    project     = local.project_name
    environment = var.environment
    managed_by  = "terraform"
  }
}

# Create volumes
resource "podman_volume" "postgres_data" {
  name = "${local.project_name}-postgres-data"
  
  labels = {
    project     = local.project_name
    environment = var.environment
    managed_by  = "terraform"
    service     = "database"
  }
}

resource "podman_volume" "redis_data" {
  name = "${local.project_name}-redis-data"
  
  labels = {
    project     = local.project_name
    environment = var.environment
    managed_by  = "terraform"
    service     = "redis"
  }
}

resource "podman_volume" "api_logs" {
  name = "${local.project_name}-api-logs"
  
  labels = {
    project     = local.project_name
    environment = var.environment
    managed_by  = "terraform"
    service     = "api"
  }
}

# Redis container
resource "podman_container" "redis" {
  name  = "${local.project_name}-redis"
  image = "redis:7-alpine"
  
  # Environment variables
  env = local.redis_env
  
  # Command
  command = [
    "redis-server",
    "--appendonly", "yes",
    "--requirepass", var.redis_password
  ]
  
  # Network
  networks_advanced {
    name = podman_network.master_data_network.name
    aliases = ["redis"]
  }
  
  # Ports
  ports {
    internal = 6379
    external = var.redis_external_port
    host_ip  = "127.0.0.1"
  }
  
  # Volumes
  volumes {
    volume_name    = podman_volume.redis_data.name
    container_path = "/data"
  }
  
  # Resource limits
  memory = var.redis_memory_limit
  cpus   = var.redis_cpu_limit
  
  # Health check
  healthcheck {
    test         = ["CMD", "redis-cli", "-a", var.redis_password, "ping"]
    interval     = "10s"
    timeout      = "5s"
    retries      = 5
    start_period = "10s"
  }
  
  # Restart policy
  restart = "unless-stopped"
  
  # Security
  user = "1001:1001"
  
  # Labels
  labels = {
    project     = local.project_name
    environment = var.environment
    managed_by  = "terraform"
    service     = "redis"
  }
  
  depends_on = [podman_network.master_data_network]
}

# PostgreSQL container
resource "podman_container" "database" {
  name  = "${local.project_name}-db"
  image = "postgres:15-alpine"
  
  # Environment variables
  env = local.postgres_env
  
  # Network
  networks_advanced {
    name = podman_network.master_data_network.name
    aliases = ["database", "postgresql"]
  }
  
  # Ports
  ports {
    internal = 5432
    external = var.postgres_external_port
    host_ip  = "127.0.0.1"
  }
  
  # Volumes
  volumes {
    volume_name    = podman_volume.postgres_data.name
    container_path = "/var/lib/postgresql/data"
  }
  
  volumes {
    host_path      = abspath("${path.root}/../supabase/migrations")
    container_path = "/docker-entrypoint-initdb.d"
    read_only      = true
  }
  
  # Resource limits
  memory = var.postgres_memory_limit
  cpus   = var.postgres_cpu_limit
  
  # Health check
  healthcheck {
    test = [
      "CMD-SHELL",
      "pg_isready -U ${var.postgres_user} -d ${var.postgres_db}"
    ]
    interval     = "10s"
    timeout      = "5s"
    retries      = 5
    start_period = "30s"
  }
  
  # Restart policy
  restart = "unless-stopped"
  
  # Security
  user = "999:999"
  
  # Labels
  labels = {
    project     = local.project_name
    environment = var.environment
    managed_by  = "terraform"
    service     = "database"
  }
  
  depends_on = [
    podman_network.master_data_network,
    podman_container.redis
  ]
}

# API container
resource "podman_container" "api" {
  name  = "${local.project_name}-api"
  image = var.api_image
  
  # Environment variables
  env = local.api_env
  
  # Network
  networks_advanced {
    name = podman_network.master_data_network.name
    aliases = ["api", "backend"]
  }
  
  # Ports
  ports {
    internal = 3000
    external = var.api_external_port
    host_ip  = "127.0.0.1"
  }
  
  # Volumes
  volumes {
    volume_name    = podman_volume.api_logs.name
    container_path = "/app/logs"
  }
  
  # Resource limits
  memory = var.api_memory_limit
  cpus   = var.api_cpu_limit
  
  # Health check
  healthcheck {
    test         = ["CMD", "curl", "-f", "http://localhost:3000/health"]
    interval     = "30s"
    timeout      = "10s"
    retries      = 3
    start_period = "60s"
  }
  
  # Restart policy
  restart = "unless-stopped"
  
  # Security
  user = "1001:1001"
  
  # Labels
  labels = {
    project     = local.project_name
    environment = var.environment
    managed_by  = "terraform"
    service     = "api"
  }
  
  depends_on = [
    podman_network.master_data_network,
    podman_container.database,
    podman_container.redis
  ]
}

# Frontend container
resource "podman_container" "frontend" {
  name  = "${local.project_name}-frontend"
  image = var.frontend_image
  
  # Environment variables
  env = local.frontend_env
  
  # Network
  networks_advanced {
    name = podman_network.master_data_network.name
    aliases = ["frontend", "web"]
  }
  
  # Ports
  ports {
    internal = 8080
    external = var.frontend_external_port
    host_ip  = "0.0.0.0"
  }
  
  # Resource limits
  memory = var.frontend_memory_limit
  cpus   = var.frontend_cpu_limit
  
  # Health check
  healthcheck {
    test         = ["CMD", "curl", "-f", "http://localhost:8080"]
    interval     = "30s"
    timeout      = "10s"
    retries      = 3
    start_period = "30s"
  }
  
  # Restart policy
  restart = "unless-stopped"
  
  # Security
  user = "1001:1001"
  
  # Labels
  labels = {
    project     = local.project_name
    environment = var.environment
    managed_by  = "terraform"
    service     = "frontend"
  }
  
  depends_on = [
    podman_network.master_data_network,
    podman_container.api
  ]
}