#!/usr/bin/env bash
set -euo pipefail

skill_name="terminal-context"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
skill_src_dir="$(cd "${script_dir}/.." && pwd)"

codex_skills_dir="${CODEX_HOME:-$HOME/.codex}/skills"
install_skill_dir="${codex_skills_dir}/${skill_name}"

bin_dir="${HOME}/.local/bin"

echo "Installing Codex skill '${skill_name}'..."
mkdir -p "${codex_skills_dir}"

rm -rf "${install_skill_dir}"
cp -R "${skill_src_dir}" "${install_skill_dir}"
chmod -R u+rwX "${install_skill_dir}"

mkdir -p "${bin_dir}"

for tool in tc-context tc-output tc-send tc-watch; do
  ln -sf "${install_skill_dir}/scripts/${tool}" "${bin_dir}/${tool}"
done

echo ""
echo "Installed:"
echo "  Skill: ${install_skill_dir}"
echo "  Tools: ${bin_dir}/tc-*"
echo ""
echo "Next:"
echo "  - Ensure ${bin_dir} is on your PATH"
echo "  - Ensure Kitty remote control socket is enabled (recommended):"
echo "      ~/.config/kitty/kitty.conf -> listen_on unix:/tmp/kitty-{user}"
echo "    Then restart Kitty."
echo "  - Optional: install zsh hooks from:"
echo "      ${install_skill_dir}/references/ZSH_HOOKS.md"
