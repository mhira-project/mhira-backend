#!/bin/sh
# After the real upgrade: compares the inventory taken on the installation
# before the upgrade with the one taken after it, and says whether the
# upgrade left the structure of the databases as it was. Both files hold
# counts, names and definitions only. See README.md, "After the real
# upgrade".
set -eu

here=$(cd "$(dirname "$0")" && pwd)
. "$here/versions.sh"

if [ $# -ne 2 ] || [ ! -s "$1" ] || [ ! -s "$2" ]; then
    cat >&2 <<EOF
usage: sh compare.sh INVENTORY_BEFORE INVENTORY_AFTER

Compares the inventory of the installation on MHIRA $FROM_VERSION with the one
taken after its upgrade to $TO_VERSION.
EOF
    exit 64
fi

absolute() {
    echo "$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
}

# evaluate.mjs runs in the new image's Node, which the upgraded installation
# has, without network.
exec docker run --rm --network none ${NEW_PLATFORM:+--platform "$NEW_PLATFORM"} \
    -v "$(absolute "$1"):/before.txt:ro" -v "$(absolute "$2"):/after.txt:ro" -v "$here:/tool:ro" \
    --entrypoint node "${NEW_IMAGE:-mhiraproject/mhira-backend:$TO_VERSION}" \
    /tool/evaluate.mjs --compare /before.txt /after.txt "$FROM_VERSION" "$TO_VERSION"
