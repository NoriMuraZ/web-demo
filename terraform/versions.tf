# Terraform version constraints

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