#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Load variables from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo ".env file not found!"
    exit 1
fi

ECR_URL="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "Logging into AWS ECR..."
aws ecr get-login-password --region $AWS_REGION --profile $AWS_PROFILE | docker login --username AWS --password-stdin $ECR_URL

# --- BACKEND ---
echo "Checking Backend ECR Repository..."
if ! aws ecr describe-repositories --repository-names meridian-chatbot-backend --region $AWS_REGION --profile $AWS_PROFILE > /dev/null 2>&1; then
    echo "Creating backend ECR repository..."
    aws ecr create-repository --repository-name meridian-chatbot-backend --region $AWS_REGION --profile $AWS_PROFILE
fi

echo "Building Backend..."
cd backend
docker build --platform linux/amd64 -t meridian-chatbot-backend .
docker tag meridian-chatbot-backend:latest ${ECR_URL}/meridian-chatbot-backend:latest

echo "Pushing Backend to ECR..."
docker push ${ECR_URL}/meridian-chatbot-backend:latest
cd ..

# --- FRONTEND ---
echo "Checking Frontend ECR Repository..."
if ! aws ecr describe-repositories --repository-names meridian-chatbot-frontend --region $AWS_REGION --profile $AWS_PROFILE > /dev/null 2>&1; then
    echo "Creating frontend ECR repository..."
    aws ecr create-repository --repository-name meridian-chatbot-frontend --region $AWS_REGION --profile $AWS_PROFILE
fi

echo "Building Frontend..."
cd frontend
docker build --platform linux/amd64 -t meridian-chatbot-frontend .
docker tag meridian-chatbot-frontend:latest ${ECR_URL}/meridian-chatbot-frontend:latest

echo "Pushing Frontend to ECR..."
docker push ${ECR_URL}/meridian-chatbot-frontend:latest
cd ..

echo "All images pushed successfully!"