#!/bin/bash
#
# Generate a random IndexNow API key.
#
# IndexNow keys must be 8-128 hexadecimal characters.
# This script generates a 32-character key for a good balance of
# uniqueness and manageability.
#
# Usage:
#   ./generate-key.sh
#
# The output can be used as the INDEXNOW_API_KEY environment variable.
#

set -e

# Generate 16 random bytes and convert to hex (32 characters)
key=$(openssl rand -hex 16)

echo "Generated IndexNow API Key:"
echo ""
echo "  ${key}"
echo ""
echo "Add this to your environment variables as INDEXNOW_API_KEY"
echo ""
echo "For development (k8s/overlays/dev/.env.dev.app):"
echo "  INDEXNOW_API_KEY=${key}"
echo ""
echo "For production, add to your encrypted secrets."
