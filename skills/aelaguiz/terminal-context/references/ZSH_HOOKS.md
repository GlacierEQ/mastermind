# Zsh hooks (optional but recommended)

These hooks provide per-pane metadata that Kitty itself does not expose:

- recent commands with timestamps/exit codes
- git branch + dirty flag
- last command duration
- project type detection
- optional custom label (`label-pane "api"` etc.)

Add this to your `~/.zshrc` (then restart your shell):

```zsh
# =============================================================================
# Terminal Context - Shell Integration for Coding Agents (zsh)
# =============================================================================

TERMINAL_CONTEXT_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/terminal-context"
TERMINAL_CONTEXT_HISTORY="$TERMINAL_CONTEXT_DIR/history.jsonl"

mkdir -p "$TERMINAL_CONTEXT_DIR"

__tc_last_cmd=""
__tc_cmd_start=""
__tc_cmd_id=""
__tc_last_exit=""
__tc_last_duration=""

function __tc__b64() {
  # macOS and Linux both provide base64(1), but flags differ. Keep it portable.
  printf "%s" "$1" | base64 | tr -d '\n'
}

function __tc_update_kitty_vars() {
  [[ -z "$KITTY_WINDOW_ID" ]] && return

  local git_branch=""
  local git_dirty="false"

  if command -v git >/dev/null 2>&1 && git rev-parse --git-dir >/dev/null 2>&1; then
    git_branch=$(git symbolic-ref --short HEAD 2>/dev/null || git rev-parse --short HEAD 2>/dev/null)
    [[ -n "$(git status --porcelain 2>/dev/null)" ]] && git_dirty="true"
  fi

  # Set user variables visible to `kitty @ ls` / `kitten @ ls`
  printf "\e]1337;SetUserVar=%s=%s\a" "git_branch" "$(__tc__b64 "$git_branch")"
  printf "\e]1337;SetUserVar=%s=%s\a" "git_dirty" "$(__tc__b64 "$git_dirty")"
  printf "\e]1337;SetUserVar=%s=%s\a" "last_exit_code" "$(__tc__b64 "${__tc_last_exit:-0}")"
  printf "\e]1337;SetUserVar=%s=%s\a" "last_command" "$(__tc__b64 "${__tc_last_cmd:-}")"
  printf "\e]1337;SetUserVar=%s=%s\a" "last_duration_ms" "$(__tc__b64 "${__tc_last_duration:-0}")"

  local project_type=""
  [[ -f "package.json" ]] && project_type="node"
  [[ -f "Cargo.toml" ]] && project_type="rust"
  [[ -f "pyproject.toml" || -f "setup.py" ]] && project_type="python"
  [[ -f "go.mod" ]] && project_type="go"
  [[ -f "Gemfile" ]] && project_type="ruby"
  printf "\e]1337;SetUserVar=%s=%s\a" "project_type" "$(__tc__b64 "$project_type")"

  local venv="${VIRTUAL_ENV##*/}"
  printf "\e]1337;SetUserVar=%s=%s\a" "virtual_env" "$(__tc__b64 "$venv")"
}

function __tc_preexec() {
  __tc_last_cmd="$1"
  __tc_cmd_start=$EPOCHREALTIME
  __tc_cmd_id="${KITTY_WINDOW_ID:-unknown}:$$:${EPOCHREALTIME}"

  # Append a JSON line without external deps like jq
  python3 - "$TERMINAL_CONTEXT_HISTORY" "$1" "$PWD" "${KITTY_WINDOW_ID:-unknown}" "$$" "$__tc_cmd_id" <<'PY'
import json
import sys
from datetime import datetime, timezone

history_path, cmd, cwd, pane, pid, cmd_id = sys.argv[1:]
event = {
  "event": "start",
  "ts": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
  "cmd_id": cmd_id,
  "cmd": cmd,
  "cwd": cwd,
  "pane": pane,
  "pid": pid,
}
with open(history_path, "a", encoding="utf-8") as f:
  f.write(json.dumps(event, ensure_ascii=False) + "\n")
PY
}

function __tc_precmd() {
  __tc_last_exit=$?

  if [[ -n "$__tc_cmd_start" ]]; then
    local end=$EPOCHREALTIME
    __tc_last_duration=$(( (end - __tc_cmd_start) * 1000 ))
    __tc_last_duration=${__tc_last_duration%.*}

    python3 - "$TERMINAL_CONTEXT_HISTORY" "$__tc_last_cmd" "$PWD" "${KITTY_WINDOW_ID:-unknown}" "$$" "$__tc_cmd_id" "$__tc_last_exit" "$__tc_last_duration" <<'PY'
import json
import sys
from datetime import datetime, timezone

history_path, cmd, cwd, pane, pid, cmd_id, exit_code, duration_ms = sys.argv[1:]
event = {
  "event": "end",
  "ts": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
  "cmd_id": cmd_id,
  "cmd": cmd,
  "cwd": cwd,
  "pane": pane,
  "pid": pid,
  "exit": int(exit_code),
  "duration_ms": int(duration_ms),
}
with open(history_path, "a", encoding="utf-8") as f:
  f.write(json.dumps(event, ensure_ascii=False) + "\n")
PY
  fi

  __tc_cmd_start=""
  __tc_cmd_id=""
  __tc_update_kitty_vars
}

autoload -Uz add-zsh-hook
add-zsh-hook preexec __tc_preexec
add-zsh-hook precmd __tc_precmd

__tc_update_kitty_vars

function label-pane() {
  local label="$1"
  printf "\e]1337;SetUserVar=%s=%s\a" "custom_label" "$(__tc__b64 "$label")"
  echo "Pane labeled: $label"
}
```
