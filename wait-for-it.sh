#!/bin/sh
# Simple wait-for-it script compatible with sh

set -e

host="$1"
port="$2"
timeout="${3:-60}"

if [ -z "$host" ] || [ -z "$port" ]; then
    echo "Usage: $0 host port [timeout]"
    exit 1
fi

echo "Waiting for $host:$port..."

i=0
while [ $i -lt $timeout ]; do
    if nc -z "$host" "$port" 2>/dev/null; then
        echo "$host:$port is available!"
        exit 0
    fi
    sleep 1
    i=$((i + 1))
done

echo "Timeout waiting for $host:$port"
exit 1