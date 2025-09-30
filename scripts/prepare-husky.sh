#!/bin/sh

# Only run husky in local development, skip in CI/CD
if [ "$CI" != "true" ] && [ "$VERCEL" != "1" ]; then
  husky
fi