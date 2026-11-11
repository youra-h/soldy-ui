#!/usr/bin/env bash
set -euo pipefail

# Hosted runners can lose the Azure mirror while the primary Ubuntu archive
# remains available. Keep the package sources intact unless that DNS check fails.
azure_sources=()
for apt_source in /etc/apt/apt-mirrors.txt /etc/apt/sources.list.d/ubuntu.sources /etc/apt/sources.list; do
  if [[ -f "$apt_source" ]]; then
    printf 'APT source: %s\n' "$apt_source"
    cat "$apt_source"
    if grep -Fq 'azure.archive.ubuntu.com' "$apt_source"; then
      azure_sources+=("$apt_source")
    fi
  fi
done

if [[ ${#azure_sources[@]} -eq 0 ]]; then
  exit 0
fi

if timeout 10s getent ahostsv4 azure.archive.ubuntu.com; then
  exit 0
fi

# Fail before editing sources if the official fallback is also unavailable.
timeout 10s getent ahostsv4 archive.ubuntu.com
sudo sed -i 's/azure\.archive\.ubuntu\.com/archive.ubuntu.com/g' "${azure_sources[@]}"
