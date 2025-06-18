# Variables for Terraform Podman configuration

variable "environment" {
  description = "Environment name (development, staging, production)"
  type        = string
  default     = "development"
  
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be one of: development, staging, production."
  }
}

variable "node_env" {
  description = "Node.js environment"
  type        = string
  default     = "production"
}

# Database configuration
variable "postgres_db" {
  description = "PostgreSQL database name"
  type        = string
  default     = "master_data"
}

variable "postgres_user" {
  description = "PostgreSQL username"
  type        = string
  default     = "admin"
}

variable "postgres_password" {
  description = "PostgreSQL password"
  type        = string
  sensitive   = true
  default     = "admin123"
}

variable "postgres_external_port" {
  description = "External port for PostgreSQL"
  type        = number
  default     = 5432
}

variable "postgres_memory_limit" {
  description = "Memory limit for PostgreSQL container"
  type        = string
  default     = "512m"
}

variable "postgres_cpu_limit" {
  description = "CPU limit for PostgreSQL container"
  type        = string
  default     = "0.5"
}

# Redis configuration
variable "redis_password" {
  description = "Redis password"
  type        = string
  sensitive   = true
  default     = "redis123"
}

variable "redis_external_port" {
  description = "External port for Redis"
  type        = number
  default     = 6379
}

variable "redis_memory_limit" {
  description = "Memory limit for Redis container"
  type        = string
  default     = "128m"
}

variable "redis_cpu_limit" {
  description = "CPU limit for Redis container"
  type        = string
  default     = "0.2"
}

# API configuration
variable "api_image" {
  description = "Docker image for API service"
  type        = string
  default     = "localhost/master-data-api:latest"
}

variable "api_external_port" {
  description = "External port for API service"
  type        = number
  default     = 3000
}

variable "api_memory_limit" {
  description = "Memory limit for API container"
  type        = string
  default     = "512m"
}

variable "api_cpu_limit" {
  description = "CPU limit for API container"
  type        = string
  default     = "0.5"
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
  default     = "your-jwt-secret-key-change-in-production"
}

variable "cors_origin" {
  description = "CORS origin for API"
  type        = string
  default     = "http://localhost:8080"
}

variable "log_level" {
  description = "Log level for API service"
  type        = string
  default     = "info"
  
  validation {
    condition     = contains(["error", "warn", "info", "debug"], var.log_level)
    error_message = "Log level must be one of: error, warn, info, debug."
  }
}

# Frontend configuration
variable "frontend_image" {
  description = "Docker image for frontend service"
  type        = string
  default     = "localhost/master-data-frontend:latest"
}

variable "frontend_external_port" {
  description = "External port for frontend service"
  type        = number
  default     = 8080
}

variable "frontend_memory_limit" {
  description = "Memory limit for frontend container"
  type        = string
  default     = "256m"
}

variable "frontend_cpu_limit" {
  description = "CPU limit for frontend container"
  type        = string
  default     = "0.3"
}

variable "api_url" {
  description = "API URL for frontend"
  type        = string
  default     = "http://localhost:3000/api"
}