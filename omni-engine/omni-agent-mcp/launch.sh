#!/bin/bash
cd "/bin"
# Overclocked Node settings for high throughput
export NODE_OPTIONS="--max-old-space-size=4096 --no-warnings"
node dist/index.js
