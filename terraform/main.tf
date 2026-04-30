terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0.0" 
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

variable "openai_api_key" {
  description = "The API Key for OpenAI"
  type        = string
  sensitive   = true
}

# ---------------------------------------------------------
# Declarative Imports (Terraform 1.5+)
# ---------------------------------------------------------
import {
  to = aws_ecr_repository.frontend
  id = "meridian-chatbot-frontend"
}

import {
  to = aws_ecr_repository.backend
  id = "meridian-chatbot-backend"
}

import {
  to = aws_iam_role.apprunner_access_role
  id = "omni-apprunner-access-role"
}

# ---------------------------------------------------------
# 1. ECR Repositories 
# ---------------------------------------------------------
resource "aws_ecr_repository" "frontend" {
  name                 = "meridian-chatbot-frontend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}

resource "aws_ecr_repository" "backend" {
  name                 = "meridian-chatbot-backend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}

# ---------------------------------------------------------
# 2. IAM Roles for App Runner
# ---------------------------------------------------------
resource "aws_iam_role" "apprunner_access_role" {
  name = "omni-apprunner-access-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "build.apprunner.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "apprunner_access_role_ecr" {
  role       = aws_iam_role.apprunner_access_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

# ---------------------------------------------------------
# 3. App Runner Services
# ---------------------------------------------------------
resource "aws_apprunner_service" "backend" {
  service_name = "meridian-chatbot-backend"

  source_configuration {
    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_access_role.arn
    }
    image_repository {
      image_identifier      = "${aws_ecr_repository.backend.repository_url}:latest"
      image_repository_type = "ECR"
      image_configuration {
        port = "8000"
        runtime_environment_variables = {
          ENVIRONMENT           = "production"
          OPENAI_API_KEY        = var.openai_api_key
          
          # ✨ UPDATED: Point to the Meridian remote MCP server via SSE
          MCP_SERVER_URL        = "https://order-mcp-74afyau24q-uc.a.run.app/mcp"
        }
      }
    }
    auto_deployments_enabled = true
  }
}

resource "aws_apprunner_service" "frontend" {
  service_name = "meridian-chatbot-frontend"

  source_configuration {
    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_access_role.arn
    }
    image_repository {
      image_identifier      = "${aws_ecr_repository.frontend.repository_url}:latest"
      image_repository_type = "ECR"
      image_configuration {
        port = "3000"
        runtime_environment_variables = {
          NEXT_PUBLIC_API_URL = "https://${aws_apprunner_service.backend.service_url}"
          BACKEND_URL         = "https://${aws_apprunner_service.backend.service_url}"
        }
      }
    }
    auto_deployments_enabled = true
  }
}

# ---------------------------------------------------------
# 4. Outputs
# ---------------------------------------------------------
output "frontend_url" {
  value = "https://${aws_apprunner_service.frontend.service_url}"
}

output "backend_url" {
  value = "https://${aws_apprunner_service.backend.service_url}"
}