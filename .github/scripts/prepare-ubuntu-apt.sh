#!/usr/bin/env bash
set -euo pipefail

# Hosted runners can lose the Azure mirror while another official Ubuntu mirror
# remains available. Preserve the sources unless that DNS check fails.
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

ubuntu_codename=$(. /etc/os-release; printf '%s' "$VERSION_CODENAME")
for ubuntu_mirror in archive.ubuntu.com mirrors.us.kernel.org; do
  # Verify DNS and release metadata reachability; APT still verifies signatures.
  if timeout 10s getent ahostsv4 "$ubuntu_mirror" &&
    curl --fail --silent --show-error --location --proto '=https' --proto-redir '=https' \
      --max-redirs 3 --output /dev/null --connect-timeout 5 --max-time 15 \
      "https://$ubuntu_mirror/ubuntu/dists/$ubuntu_codename/InRelease"; then
    sudo sed -i "s/azure\.archive\.ubuntu\.com/$ubuntu_mirror/g" "${azure_sources[@]}"
    exit 0
  fi
done

printf '%s\n' 'No verified Ubuntu mirror is available; package sources were not changed.' >&2
exit 1
