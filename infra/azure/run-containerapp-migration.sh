#!/usr/bin/env bash
set -euo pipefail

# Usage: run-containerapp-migration.sh <image>
# Expects AZ CLI logged in and environment variables DATABASE_URL and DB_SSL set (or provided via env in CI).

RESOURCE_GROUP="rg-foodclub"
JOB_NAME="run-migrations"
IMAGE="$1"

if [ -z "$IMAGE" ]; then
  echo "Usage: $0 <image>"
  exit 1
fi

# Check if job exists
if az containerapp job show --name "$JOB_NAME" --resource-group "$RESOURCE_GROUP" >/dev/null 2>&1; then
  echo "Job $JOB_NAME exists, updating image..."
  az containerapp job update \
    --name "$JOB_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --image "$IMAGE" || true
else
  echo "Creating job $JOB_NAME..."
  az containerapp job create \
    --name "$JOB_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --image "$IMAGE" \
    --command "npm run db:migrate" \
    --restart-policy Never \
    --environment-variables "DATABASE_URL=${DATABASE_URL}" "DB_SSL=${DB_SSL}"
fi

# Run the job
echo "Running job $JOB_NAME with image $IMAGE"
az containerapp job run --name "$JOB_NAME" --resource-group "$RESOURCE_GROUP"

echo "Migration job submitted. Monitor with: az containerapp job show-run --name $JOB_NAME --resource-group $RESOURCE_GROUP --run-id <runId>"
