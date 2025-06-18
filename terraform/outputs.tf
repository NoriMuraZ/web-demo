# Outputs for Terraform Podman configuration

output "network_info" {
  description = "Network information"
  value = {
    name   = podman_network.master_data_network.name
    subnet = podman_network.master_data_network.subnet
  }
}

output "database_info" {
  description = "Database connection information"
  value = {
    container_name = podman_container.database.name
    internal_port  = 5432
    external_port  = var.postgres_external_port
    database_name  = var.postgres_db
    username       = var.postgres_user
    host          = "localhost"
  }
  sensitive = false
}

output "redis_info" {
  description = "Redis connection information"
  value = {
    container_name = podman_container.redis.name
    internal_port  = 6379
    external_port  = var.redis_external_port
    host          = "localhost"
  }
  sensitive = false
}

output "api_info" {
  description = "API service information"
  value = {
    container_name = podman_container.api.name
    internal_port  = 3000
    external_port  = var.api_external_port
    url           = "http://localhost:${var.api_external_port}"
    health_url    = "http://localhost:${var.api_external_port}/health"
  }
}

output "frontend_info" {
  description = "Frontend service information"
  value = {
    container_name = podman_container.frontend.name
    internal_port  = 8080
    external_port  = var.frontend_external_port
    url           = "http://localhost:${var.frontend_external_port}"
  }
}

output "volumes_info" {
  description = "Volume information"
  value = {
    postgres_data = podman_volume.postgres_data.name
    redis_data    = podman_volume.redis_data.name
    api_logs      = podman_volume.api_logs.name
  }
}

output "container_status" {
  description = "Container status information"
  value = {
    redis = {
      name   = podman_container.redis.name
      status = podman_container.redis.state
    }
    database = {
      name   = podman_container.database.name
      status = podman_container.database.state
    }
    api = {
      name   = podman_container.api.name
      status = podman_container.api.state
    }
    frontend = {
      name   = podman_container.frontend.name
      status = podman_container.frontend.state
    }
  }
}

output "access_urls" {
  description = "Application access URLs"
  value = {
    frontend    = "http://localhost:${var.frontend_external_port}"
    api         = "http://localhost:${var.api_external_port}"
    api_health  = "http://localhost:${var.api_external_port}/health"
    database    = "postgresql://${var.postgres_user}:${var.postgres_password}@localhost:${var.postgres_external_port}/${var.postgres_db}"
    redis       = "redis://localhost:${var.redis_external_port}"
  }
  sensitive = true
}