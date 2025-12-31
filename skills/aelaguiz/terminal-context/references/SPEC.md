# Terminal Context Skill — Full Specification

This file is the “full spec” captured from the initial design prompt. It is intentionally long and detailed.

If you are trying to *use* the skill day-to-day, start with `../SKILL.md` and `SETUP.md`.

---

## Vision

Give coding agents complete situational awareness of your development environment. They should know what's running, what you just did, what failed, and what's happening across all your terminals—without you having to explain it.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              YOUR TERMINALS                                  │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Tab 1     │  │   Tab 2     │  │   Tab 3     │  │   Tab 4     │        │
│  │  npm run    │  │   vim       │  │  psql       │  │  agent      │        │
│  │  dev        │  │             │  │             │  │  (claude)   │        │
│  │  :3000      │  │  myapp/     │  │  mydb       │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│         │               │               │                   │              │
│         └───────────────┴───────────────┴───────────────────┘              │
│                                    │                                        │
│                            Kitty IPC Socket                                 │
│                         unix:/tmp/kitty-$USER                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TERMINAL CONTEXT LAYER                            │
│                                                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │  Kitty IPC       │  │  Shell Hooks     │  │  System State    │          │
│  │  (kitten @)      │  │  (zsh/bash)      │  │  (ps/lsof/git)   │          │
│  │                  │  │                  │  │                  │          │
│  │  • windows/panes │  │  • cmd history   │  │  • port listeners│          │
│  │  • cwd/pid/env   │  │  • exit codes    │  │  • process tree  │          │
│  │  • scrollback    │  │  • timestamps    │  │  • git status    │          │
│  │  • user vars     │  │  • durations     │  │  • docker/k8s    │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                     │                                       │
│                                     ▼                                       │
│                      ┌──────────────────────────┐                           │
│                      │   Unified Context API    │                           │
│                      │                          │                           │
│                      │   • get_full_context()   │                           │
│                      │   • get_pane_output()    │                           │
│                      │   • find_service()       │                           │
│                      │   • send_to_pane()       │                           │
│                      │   • watch_for_output()   │                           │
│                      └──────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CODING AGENT                                   │
│                                                                             │
│  \"I can see you have a dev server on :3000 in tab 1, you're editing        │
│   src/auth.ts in tab 2, and your last build failed 3 minutes ago            │
│   with 'Cannot find module'. Want me to fix the import?\"                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Models

### TerminalContext (Full Snapshot)

```typescript
interface TerminalContext {
  timestamp: string;                    // ISO timestamp of snapshot

  // Kitty state
  kitty: {
    os_windows: OSWindow[];
    focused_window_id: number;
  };

  // Enhanced per-pane data (from shell hooks)
  pane_metadata: Map<number, PaneMetadata>;

  // System state
  system: {
    listening_ports: PortListener[];
    docker_containers: Container[];
    background_jobs: Job[];
  };

  // Derived insights
  insights: Insight[];
}
```

```typescript
interface OSWindow {
  id: number;
  is_focused: boolean;
  tabs: Tab[];
}

interface Tab {
  id: number;
  title: string;
  is_active: boolean;
  windows: Pane[];  // Kitty calls panes "windows"
}

interface Pane {
  id: number;
  title: string;
  cwd: string;
  pid: number;
  cmdline: string[];
  env: Record<string, string>;
  is_focused: boolean;
  is_self: boolean;              // Is this the agent's own pane?

  // From user variables (set by shell hooks)
  user_vars: {
    git_branch?: string;
    git_dirty?: boolean;
    last_command?: string;
    last_exit_code?: number;
    last_command_duration?: number;
    project_type?: string;       // "node", "python", "rust", etc.
    virtual_env?: string;
    custom_label?: string;       // User-assigned label
  };
}

interface PaneMetadata {
  pane_id: number;

  // Recent command history (from shell hooks)
  recent_commands: {
    command: string;
    cwd: string;
    started_at: string;
    finished_at?: string;
    exit_code?: number;
    duration_ms?: number;
  }[];

  // Detected services
  detected_service?: {
    type: "dev_server" | "database" | "watcher" | "repl" | "shell" | "editor" | "other";
    name?: string;
    port?: number;
    framework?: string;          // "next", "vite", "rails", etc.
  };
}

interface PortListener {
  port: number;
  protocol: "tcp" | "udp";
  pid: number;
  process_name: string;
  pane_id?: number;              // Mapped back to pane if possible
}

interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
  ports: string[];
}

interface Insight {
  type: "info" | "warning" | "suggestion";
  category: "build" | "server" | "test" | "git" | "dependency" | "other";
  message: string;
  pane_id?: number;
  actionable?: {
    description: string;
    command?: string;
    pane_id?: number;
  };
}
```

---

## Core Capabilities

### 1. Observation (Read)

| Capability | Source | Use Case |
|------------|--------|----------|
| List all panes with state | `kitten @ ls` | "What terminals are open?" |
| Get pane scrollback | `kitten @ get-text` | "What was the error message?" |
| Get recent commands | Shell hooks → file | "What did I just run?" |
| Get listening ports | `lsof -i -P` | "Is my server running?" |
| Get git status per pane | Shell hooks | "What branch is that terminal on?" |
| Get docker containers | `docker ps` | "What services are up?" |
| Detect service types | Heuristics on cmdline/output | "That's a Next.js dev server" |

### 2. Control (Write)

| Capability | Method | Use Case |
|------------|--------|----------|
| Send text to pane | `kitten @ send-text` | "Run this command over there" |
| Create new pane/tab | `kitten @ launch` | "Open a new terminal for tests" |
| Focus pane | `kitten @ focus-window` | "Switch to the server terminal" |
| Set pane title | `kitten @ set-window-title` | "Label this as 'API Server'" |
| Set user variable | `kitten @ set-user-vars` | "Mark this pane as 'primary'" |
| Close pane | `kitten @ close-window` | "Close that finished process" |

### 3. Intelligence (Derive)

| Insight | Detection Method |
|---------|------------------|
| "Dev server already running on :3000" | Port listener + process match |
| "Build failed 2 min ago" | Recent command with exit_code != 0 |
| "You're on wrong branch" | Git branch mismatch across panes |
| "Tests are still running" | Process detection + no exit code yet |
| "Database not running" | Expected port not listening |
| "Uncommitted changes in /app" | Git dirty flag |
| "npm install might be needed" | Package.json newer than node_modules |

---

## Shell Integration (zsh)

The shell hooks enrich the base Kitty data with timing, exit codes, and semantic information.

### `~/.zshrc` additions

```zsh
# =============================================================================
# Terminal Context - Shell Integration for Coding Agents
# =============================================================================

TERMINAL_CONTEXT_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/terminal-context"
TERMINAL_CONTEXT_HISTORY="$TERMINAL_CONTEXT_DIR/history.jsonl"
TERMINAL_CONTEXT_SESSION="$TERMINAL_CONTEXT_DIR/sessions/$$"

# Ensure directories exist
mkdir -p "$TERMINAL_CONTEXT_DIR/sessions"

# -----------------------------------------------------------------------------
# Kitty User Variables (visible to kitten @ ls)
# -----------------------------------------------------------------------------

function __tc_update_kitty_vars() {
  # Only run in Kitty
  [[ -z "$KITTY_WINDOW_ID" ]] && return

  local git_branch=""
  local git_dirty="false"

  if git rev-parse --git-dir &>/dev/null 2>&1; then
    git_branch=$(git symbolic-ref --short HEAD 2>/dev/null || git describe --tags --exact-match 2>/dev/null || git rev-parse --short HEAD 2>/dev/null)
    [[ -n $(git status --porcelain 2>/dev/null) ]] && git_dirty="true"
  fi

  # Set user variables visible to kitten @ ls
  printf "\e]1337;SetUserVar=%s=%s\a" "git_branch" "$(echo -n "$git_branch" | base64)"
  printf "\e]1337;SetUserVar=%s=%s\a" "git_dirty" "$(echo -n "$git_dirty" | base64)"
  printf "\e]1337;SetUserVar=%s=%s\a" "last_exit_code" "$(echo -n "${__tc_last_exit:-0}" | base64)"
  printf "\e]1337;SetUserVar=%s=%s\a" "last_command" "$(echo -n "${__tc_last_cmd:-}" | base64)"
  printf "\e]1337;SetUserVar=%s=%s\a" "last_duration" "$(echo -n "${__tc_last_duration:-0}" | base64)"

  # Detect project type
  local project_type=""
  [[ -f "package.json" ]] && project_type="node"
  [[ -f "Cargo.toml" ]] && project_type="rust"
  [[ -f "pyproject.toml" || -f "setup.py" ]] && project_type="python"
  [[ -f "go.mod" ]] && project_type="go"
  [[ -f "Gemfile" ]] && project_type="ruby"
  printf "\e]1337;SetUserVar=%s=%s\a" "project_type" "$(echo -n "$project_type" | base64)"

  # Virtual env
  local venv="${VIRTUAL_ENV##*/}"
  printf "\e]1337;SetUserVar=%s=%s\a" "virtual_env" "$(echo -n "$venv" | base64)"
}

# -----------------------------------------------------------------------------
# Command Tracking
# -----------------------------------------------------------------------------

__tc_last_cmd=""
__tc_cmd_start=""
__tc_last_exit=""
__tc_last_duration=""

function __tc_preexec() {
  __tc_last_cmd="$1"
  __tc_cmd_start=$EPOCHREALTIME

  # Log command start
  local json=$(jq -n -c \
    --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg cmd "$1" \
    --arg cwd "$PWD" \
    --arg pane "${KITTY_WINDOW_ID:-unknown}" \
    --arg pid "$$" \
    '{event:"start", ts:$ts, cmd:$cmd, cwd:$cwd, pane:$pane, pid:$pid}'
  )
  echo "$json" >> "$TERMINAL_CONTEXT_HISTORY"
}

function __tc_precmd() {
  __tc_last_exit=$?

  if [[ -n "$__tc_cmd_start" ]]; then
    local end=$EPOCHREALTIME
    __tc_last_duration=$(( (end - __tc_cmd_start) * 1000 ))
    __tc_last_duration=${__tc_last_duration%.*}  # Truncate to int

    # Log command end
    local json=$(jq -n -c \
      --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
      --arg cmd "$__tc_last_cmd" \
      --arg cwd "$PWD" \
      --arg pane "${KITTY_WINDOW_ID:-unknown}" \
      --arg pid "$$" \
      --argjson exit "$__tc_last_exit" \
      --argjson duration "$__tc_last_duration" \
      '{event:"end", ts:$ts, cmd:$cmd, cwd:$cwd, pane:$pane, pid:$pid, exit:$exit, duration_ms:$duration}'
    )
    echo "$json" >> "$TERMINAL_CONTEXT_HISTORY"
  fi

  __tc_cmd_start=""
  __tc_update_kitty_vars
}

# Register hooks
autoload -Uz add-zsh-hook
add-zsh-hook preexec __tc_preexec
add-zsh-hook precmd __tc_precmd

# Initial update
__tc_update_kitty_vars

# -----------------------------------------------------------------------------
# Manual Pane Labeling
# -----------------------------------------------------------------------------

function label-pane() {
  local label="$1"
  printf "\e]1337;SetUserVar=%s=%s\a" "custom_label" "$(echo -n "$label" | base64)"
  echo "Pane labeled: $label"
}

# -----------------------------------------------------------------------------
# Cleanup on exit
# -----------------------------------------------------------------------------

function __tc_cleanup() {
  rm -f "$TERMINAL_CONTEXT_SESSION" 2>/dev/null
}
trap __tc_cleanup EXIT
```

---

## Scripts

### 1. `tc-context` - Get Full Terminal Context

The primary script that agents call to understand the environment.

```python
#!/usr/bin/env python3
"""
tc-context: Get complete terminal context for coding agents.

Usage:
  tc-context                    # Full JSON context
  tc-context --summary          # Human-readable summary
  tc-context --pane <id>        # Details for specific pane
  tc-context --find-service <n> # Find pane running service
  tc-context --insights         # Just the derived insights
"""

import json
import subprocess
import os
import sys
import argparse
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional
import base64

HISTORY_FILE = Path(os.environ.get("XDG_STATE_HOME", Path.home() / ".local/state")) / "terminal-context/history.jsonl"
KITTY_SOCKET = os.environ.get("KITTY_LISTEN_ON", f"unix:/tmp/kitty-{os.environ.get('USER', 'user')}")


def run_cmd(cmd: list[str], timeout: int = 5) -> Optional[str]:
    \"\"\"Run a command and return stdout, or None on failure.\"\"\"
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return result.stdout if result.returncode == 0 else None
    except Exception:
        return None


def get_kitty_state() -> Optional[dict]:
    \"\"\"Get full Kitty window/tab/pane state.\"\"\"
    output = run_cmd(["kitten", "@", "--to", KITTY_SOCKET, "ls"])
    if output:
        return json.loads(output)
    return None


def decode_user_var(encoded: str) -> str:
    \"\"\"Decode base64-encoded Kitty user variable.\"\"\"
    try:
        return base64.b64decode(encoded).decode("utf-8")
    except Exception:
        return encoded


def get_listening_ports() -> list[dict]:
    \"\"\"Get list of listening ports with process info.\"\"\"
    ports = []
    output = run_cmd(["lsof", "-i", "-P", "-n"])
    if not output:
        return ports

    for line in output.strip().split("\\n")[1:]:  # Skip header
        parts = line.split()
        if len(parts) >= 9 and "LISTEN" in line:
            try:
                name = parts[0]
                pid = int(parts[1])
                addr = parts[8]
                if ":" in addr:
                    port = int(addr.split(":")[-1])
                    ports.append({
                        "port": port,
                        "pid": pid,
                        "process": name,
                        "protocol": "tcp"
                    })
            except (ValueError, IndexError):
                continue

    return ports


def get_docker_containers() -> list[dict]:
    \"\"\"Get running Docker containers.\"\"\"
    output = run_cmd(["docker", "ps", "--format", "json"])
    if not output:
        return []

    containers = []
    for line in output.strip().split("\\n"):
        if line:
            try:
                containers.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return containers


def get_recent_history(minutes: int = 30, pane_id: Optional[int] = None) -> list[dict]:
    \"\"\"Get recent command history from all panes.\"\"\"
    if not HISTORY_FILE.exists():
        return []

    cutoff = datetime.utcnow() - timedelta(minutes=minutes)
    commands = []

    with open(HISTORY_FILE) as f:
        for line in f:
            try:
                entry = json.loads(line)
                ts = datetime.fromisoformat(entry["ts"].replace("Z", "+00:00")).replace(tzinfo=None)
                if ts > cutoff:
                    if pane_id is None or entry.get("pane") == str(pane_id):
                        commands.append(entry)
            except (json.JSONDecodeError, KeyError):
                continue

    return commands[-100:]  # Last 100 entries


def detect_service_type(pane: dict) -> Optional[dict]:
    \"\"\"Heuristically detect what kind of service is running in a pane.\"\"\"
    cmdline = " ".join(pane.get("cmdline", []))
    title = pane.get("title", "")
    cwd = pane.get("cwd", "")

    # Dev servers
    if any(x in cmdline for x in ["next dev", "vite", "webpack serve", "npm run dev", "yarn dev"]):
        return {"type": "dev_server", "framework": "node"}
    if "runserver" in cmdline:
        return {"type": "dev_server", "framework": "django"}
    if "rails s" in cmdline or "rails server" in cmdline:
        return {"type": "dev_server", "framework": "rails"}
    if "cargo run" in cmdline or "cargo watch" in cmdline:
        return {"type": "dev_server", "framework": "rust"}

    # Databases
    if any(x in cmdline for x in ["psql", "mysql", "mongosh", "redis-cli"]):
        return {"type": "database", "name": cmdline.split()[0]}

    # Editors
    if any(x in cmdline for x in ["vim", "nvim", "emacs", "nano", "code"]):
        return {"type": "editor", "name": cmdline.split()[0]}

    # Watchers
    if any(x in cmdline for x in ["jest --watch", "pytest-watch", "cargo watch", "nodemon", "tsc --watch"]):
        return {"type": "watcher"}

    # REPL
    if any(x in cmdline for x in ["python", "node", "irb", "iex", "ghci"]) and len(pane.get("cmdline", [])) == 1:
        return {"type": "repl", "name": cmdline.split()[0]}

    # Shell
    if any(x in cmdline for x in ["zsh", "bash", "fish"]) or cmdline == "":
        return {"type": "shell"}

    return None


def generate_insights(context: dict) -> list[dict]:
    \"\"\"Generate actionable insights from the context.\"\"\"
    insights = []

    kitty = context.get("kitty", {})
    ports = context.get("system", {}).get("listening_ports", [])
    history = context.get("recent_history", [])

    # Map ports to panes
    port_to_pane = {}
    for os_window in kitty:
        for tab in os_window.get("tabs", []):
            for pane in tab.get("windows", []):
                pid = pane.get("pid")
                for port_info in ports:
                    if port_info.get("pid") == pid:
                        port_to_pane[port_info["port"]] = pane["id"]

    # Check for common dev ports
    common_ports = {3000: "dev server", 8000: "backend", 5432: "postgres", 6379: "redis", 5173: "vite"}
    for port, name in common_ports.items():
        matching = [p for p in ports if p["port"] == port]
        if matching:
            insights.append({
                "type": "info",
                "category": "server",
                "message": f"{name} is running on :{port} (pid {matching[0]['pid']})",
                "pane_id": port_to_pane.get(port)
            })

    # Check for recent failures
    recent_failures = [h for h in history if h.get("event") == "end" and h.get("exit", 0) != 0]
    for failure in recent_failures[-3:]:  # Last 3 failures
        insights.append({
            "type": "warning",
            "category": "build",
            "message": f"Command failed: `{failure['cmd'][:50]}...` (exit {failure['exit']})",
            "pane_id": failure.get("pane")
        })

    # Check for long-running commands
    running = [h for h in history if h.get("event") == "start"]
    ended = {(h["cmd"], h["pane"]) for h in history if h.get("event") == "end"}
    for cmd in running:
        if (cmd["cmd"], cmd["pane"]) not in ended:
            insights.append({
                "type": "info",
                "category": "other",
                "message": f"Still running: `{cmd['cmd'][:40]}...`",
                "pane_id": cmd.get("pane")
            })

    # Git branch mismatches
    branches = {}
    for os_window in kitty:
        for tab in os_window.get("tabs", []):
            for pane in tab.get("windows", []):
                user_vars = pane.get("user_vars", {})
                branch = decode_user_var(user_vars.get("git_branch", ""))
                cwd = pane.get("cwd", "")
                if branch and cwd:
                    # Group by project root (simplified)
                    project = cwd.split("/")[-1] if "/" in cwd else cwd
                    if project not in branches:
                        branches[project] = []
                    branches[project].append((branch, pane["id"]))

    for project, branch_list in branches.items():
        unique_branches = set(b for b, _ in branch_list)
        if len(unique_branches) > 1:
            insights.append({
                "type": "warning",
                "category": "git",
                "message": f"Multiple branches for {project}: {', '.join(unique_branches)}"
            })

    return insights


def get_full_context() -> dict:
    \"\"\"Build complete terminal context.\"\"\"
    kitty = get_kitty_state() or []

    # Enrich panes with service detection
    for os_window in kitty:
        for tab in os_window.get("tabs", []):
            for pane in tab.get("windows", []):
                pane["detected_service"] = detect_service_type(pane)

    context = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "kitty": kitty,
        "system": {
            "listening_ports": get_listening_ports(),
            "docker_containers": get_docker_containers(),
        },
        "recent_history": get_recent_history(minutes=30),
    }

    context["insights"] = generate_insights(context)

    return context


def format_summary(context: dict) -> str:
    \"\"\"Format context as human-readable summary.\"\"\"
    lines = []
    lines.append("=" * 60)
    lines.append("TERMINAL CONTEXT SUMMARY")
    lines.append("=" * 60)

    kitty = context.get("kitty", [])
    for os_window in kitty:
        lines.append(f"\\n📺 Window {os_window['id']}")
        for tab in os_window.get("tabs", []):
            lines.append(f"  📑 Tab: {tab.get('title', 'untitled')}")
            for pane in tab.get("windows", []):
                focused = "→" if pane.get("is_focused") else " "
                user_vars = pane.get("user_vars", {})
                branch = decode_user_var(user_vars.get("git_branch", ""))
                label = decode_user_var(user_vars.get("custom_label", ""))
                service = pane.get("detected_service", {})
                service_str = f" [{service.get('type', '')}]" if service else ""
                branch_str = f" ({branch})" if branch else ""
                label_str = f" «{label}»" if label else ""

                cmdline = " ".join(pane.get("cmdline", []))[:40]
                lines.append(f"    {focused} Pane {pane['id']}: {cmdline}{service_str}{branch_str}{label_str}")
                lines.append(f"        cwd: {pane.get('cwd', 'unknown')}")

    ports = context.get("system", {}).get("listening_ports", [])
    if ports:
        lines.append(f"\\n🌐 Listening Ports:")
        for p in ports[:10]:
            lines.append(f"    :{p['port']} → {p['process']} (pid {p['pid']})")

    insights = context.get("insights", [])
    if insights:
        lines.append(f"\\n💡 Insights:")
        for i in insights:
            icon = {\"info\": \"ℹ️\", \"warning\": \"⚠️\", \"suggestion\": \"💡\"}.get(i[\"type\"], \"•\")
            lines.append(f"    {icon} {i['message']}")

    return \"\\n\".join(lines)


def main():
    parser = argparse.ArgumentParser(description=\"Get terminal context for coding agents\")
    parser.add_argument(\"--summary\", action=\"store_true\", help=\"Human-readable summary\")
    parser.add_argument(\"--pane\", type=int, help=\"Get details for specific pane\")
    parser.add_argument(\"--insights\", action=\"store_true\", help=\"Just show insights\")
    parser.add_argument(\"--find-service\", type=str, help=\"Find pane running a service type\")
    parser.add_argument(\"--compact\", action=\"store_true\", help=\"Compact JSON output\")
    args = parser.parse_args()

    context = get_full_context()

    if args.summary:
        print(format_summary(context))
    elif args.insights:
        for i in context.get(\"insights\", []):
            print(json.dumps(i))
    elif args.pane:
        for os_window in context.get(\"kitty\", []):
            for tab in os_window.get(\"tabs\", []):
                for pane in tab.get(\"windows\", []):
                    if pane[\"id\"] == args.pane:
                        print(json.dumps(pane, indent=2))
                        return
        print(f\"Pane {args.pane} not found\", file=sys.stderr)
        sys.exit(1)
    elif args.find_service:
        for os_window in context.get(\"kitty\", []):
            for tab in os_window.get(\"tabs\", []):
                for pane in tab.get(\"windows\", []):
                    service = pane.get(\"detected_service\", {})
                    if service.get(\"type\") == args.find_service or service.get(\"framework\") == args.find_service:
                        print(json.dumps(pane, indent=2))
                        return
        print(f\"Service '{args.find_service}' not found\", file=sys.stderr)
        sys.exit(1)
    else:
        indent = None if args.compact else 2
        print(json.dumps(context, indent=indent))


if __name__ == \"__main__\":
    main()
```

### 2. `tc-output` - Get Pane Output/Scrollback

```python
#!/usr/bin/env python3
"""
tc-output: Get text content from a pane.

Usage:
  tc-output <pane_id>                    # Last screenful
  tc-output <pane_id> --lines 100        # Last 100 lines
  tc-output <pane_id> --all              # Full scrollback
  tc-output <pane_id> --match "error"    # Lines matching pattern
  tc-output --cwd /path/to/project       # Find pane by cwd
"""

import argparse
import subprocess
import os
import sys
import re
import json

KITTY_SOCKET = os.environ.get("KITTY_LISTEN_ON", f"unix:/tmp/kitty-{os.environ.get('USER', 'user')}")


def get_pane_text(pane_id: int, extent: str = "screen") -> str:
    \"\"\"Get text from a pane.\"\"\"
    cmd = [
        "kitten", "@", "--to", KITTY_SOCKET,
        "get-text", "--match", f"id:{pane_id}",
        f"--extent={extent}"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout


def find_pane_by_cwd(cwd: str) -> int | None:
    \"\"\"Find pane ID by working directory.\"\"\"
    cmd = ["kitten", "@", "--to", KITTY_SOCKET, "ls"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        return None

    data = json.loads(result.stdout)
    for os_window in data:
        for tab in os_window.get("tabs", []):
            for pane in tab.get("windows", []):
                if pane.get("cwd", "").endswith(cwd) or cwd in pane.get("cwd", ""):
                    return pane["id"]
    return None


def main():
    parser = argparse.ArgumentParser(description="Get pane output")
    parser.add_argument("pane_id", nargs="?", type=int, help="Pane ID")
    parser.add_argument("--cwd", help="Find pane by working directory")
    parser.add_argument("--lines", type=int, help="Number of lines from end")
    parser.add_argument("--all", action="store_true", help="Full scrollback")
    parser.add_argument("--match", help="Filter lines by pattern")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    args = parser.parse_args()

    pane_id = args.pane_id
    if args.cwd:
        pane_id = find_pane_by_cwd(args.cwd)
        if pane_id is None:
            print(f"No pane found with cwd matching '{args.cwd}'", file=sys.stderr)
            sys.exit(1)

    if pane_id is None:
        print("Must specify pane_id or --cwd", file=sys.stderr)
        sys.exit(1)

    extent = "all" if args.all else "screen"
    text = get_pane_text(pane_id, extent)

    lines = text.split("\\n")

    if args.lines:
        lines = lines[-args.lines:]

    if args.match:
        pattern = re.compile(args.match, re.IGNORECASE)
        lines = [l for l in lines if pattern.search(l)]

    if args.json:
        print(json.dumps({"pane_id": pane_id, "lines": lines}))
    else:
        print("\\n".join(lines))


if __name__ == "__main__":
    main()
```

### 3. `tc-send` - Send Commands to Panes

```python
#!/usr/bin/env python3
"""
tc-send: Send text/commands to a pane.

Usage:
  tc-send <pane_id> "npm test"           # Send command
  tc-send <pane_id> --interrupt          # Send Ctrl+C
  tc-send --cwd /path "command"          # Send to pane by cwd
  tc-send --service dev_server --interrupt  # Interrupt dev server
"""

import argparse
import subprocess
import os
import sys
import json

KITTY_SOCKET = os.environ.get("KITTY_LISTEN_ON", f"unix:/tmp/kitty-{os.environ.get('USER', 'user')}")


def send_text(pane_id: int, text: str):
    \"\"\"Send text to a pane.\"\"\"
    cmd = [
        "kitten", "@", "--to", KITTY_SOCKET,
        "send-text", "--match", f"id:{pane_id}",
        text
    ]
    subprocess.run(cmd)


def send_interrupt(pane_id: int):
    \"\"\"Send Ctrl+C to a pane.\"\"\"
    cmd = [
        "kitten", "@", "--to", KITTY_SOCKET,
        "send-text", "--match", f"id:{pane_id}",
        "\\x03"  # Ctrl+C
    ]
    subprocess.run(cmd)


def find_pane_by_cwd(cwd: str) -> int | None:
    \"\"\"Find pane ID by working directory.\"\"\"
    cmd = ["kitten", "@", "--to", KITTY_SOCKET, "ls"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        return None

    data = json.loads(result.stdout)
    for os_window in data:
        for tab in os_window.get("tabs", []):
            for pane in tab.get("windows", []):
                if cwd in pane.get("cwd", ""):
                    return pane["id"]
    return None


def find_pane_by_service(service_type: str) -> int | None:
    \"\"\"Find pane running a specific service type.\"\"\"
    # Re-use logic from tc-context
    cmd = ["tc-context", "--find-service", service_type]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        data = json.loads(result.stdout)
        return data.get("id")
    return None


def main():
    parser = argparse.ArgumentParser(description="Send commands to panes")
    parser.add_argument("pane_id", nargs="?", type=int, help="Pane ID")
    parser.add_argument("text", nargs="?", help="Text to send")
    parser.add_argument("--cwd", help="Find pane by working directory")
    parser.add_argument("--service", help="Find pane by service type")
    parser.add_argument("--interrupt", action="store_true", help="Send Ctrl+C")
    parser.add_argument("--enter", action="store_true", default=True, help="Append Enter key (default)")
    parser.add_argument("--no-enter", action="store_true", help="Don't append Enter key")
    args = parser.parse_args()

    # Resolve pane ID
    pane_id = args.pane_id
    if args.cwd:
        pane_id = find_pane_by_cwd(args.cwd)
    elif args.service:
        pane_id = find_pane_by_service(args.service)

    if pane_id is None:
        print("Could not find target pane", file=sys.stderr)
        sys.exit(1)

    if args.interrupt:
        send_interrupt(pane_id)
        print(f"Sent interrupt to pane {pane_id}")
    elif args.text:
        text = args.text
        if args.enter and not args.no_enter:
            text += "\\n"
        send_text(pane_id, text)
        print(f"Sent to pane {pane_id}: {args.text}")
    else:
        print("Must specify text or --interrupt", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
```

### 4. `tc-watch` - Watch for Output Patterns

```python
#!/usr/bin/env python3
"""
tc-watch: Watch a pane for specific output patterns.

Usage:
  tc-watch <pane_id> "Server ready"      # Wait for pattern
  tc-watch <pane_id> "error" --alert     # Alert on pattern
  tc-watch --cwd /path "pattern"         # Watch by cwd
"""

import argparse
import subprocess
import os
import sys
import time
import re
import json

KITTY_SOCKET = os.environ.get("KITTY_LISTEN_ON", f"unix:/tmp/kitty-{os.environ.get('USER', 'user')}")


def get_pane_text(pane_id: int) -> str:
    cmd = [
        "kitten", "@", "--to", KITTY_SOCKET,
        "get-text", "--match", f"id:{pane_id}",
        "--extent=screen"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout


def find_pane_by_cwd(cwd: str) -> int | None:
    cmd = ["kitten", "@", "--to", KITTY_SOCKET, "ls"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        return None

    data = json.loads(result.stdout)
    for os_window in data:
        for tab in os_window.get("tabs", []):
            for pane in tab.get("windows", []):
                if cwd in pane.get("cwd", ""):
                    return pane["id"]
    return None


def main():
    parser = argparse.ArgumentParser(description="Watch for output patterns")
    parser.add_argument("pane_id", nargs="?", type=int)
    parser.add_argument("pattern", help="Pattern to watch for")
    parser.add_argument("--cwd", help="Find pane by cwd")
    parser.add_argument("--timeout", type=int, default=300, help="Timeout in seconds")
    parser.add_argument("--interval", type=float, default=1.0, help="Poll interval")
    parser.add_argument("--alert", action="store_true", help="Show notification on match")
    args = parser.parse_args()

    pane_id = args.pane_id
    if args.cwd:
        pane_id = find_pane_by_cwd(args.cwd)

    if pane_id is None:
        print("Could not find target pane", file=sys.stderr)
        sys.exit(1)

    pattern = re.compile(args.pattern, re.IGNORECASE)
    seen_text = set()
    start = time.time()

    print(f"Watching pane {pane_id} for '{args.pattern}'...")

    while time.time() - start < args.timeout:
        text = get_pane_text(pane_id)

        for line in text.split("\\n"):
            if line not in seen_text:
                seen_text.add(line)
                if pattern.search(line):
                    print(f"MATCH: {line}")
                    if args.alert:
                        # macOS notification
                        subprocess.run([
                            "osascript", "-e",
                            f'display notification \"{line[:100]}\" with title \"Terminal Watch\"'
                        ])
                    sys.exit(0)

        time.sleep(args.interval)

    print(f"Timeout after {args.timeout}s", file=sys.stderr)
    sys.exit(1)


if __name__ == "__main__":
    main()
```

---

## SKILL.md

```markdown
---
name: terminal-context
description: |
  Complete terminal awareness for coding agents. Provides visibility into all
  Kitty terminal panes: running processes, working directories, command history,
  listening ports, and git status. Enables sending commands to other panes.

  Use when:
  - Agent needs to know what's running (servers, watchers, tests)
  - Agent needs command history or recent output from other terminals
  - Agent needs to run commands in a different terminal
  - User references something happening "in another terminal"
  - User says things like "check if my server is running"
  - Agent is about to suggest running something that might already be running
  - User reports an error but doesn't paste it
---

# Terminal Context Skill

Provides complete situational awareness of the user's terminal environment
through Kitty terminal IPC integration.

## Quick Reference

### Get Full Context
```bash
tc-context              # Full JSON
tc-context --summary    # Human-readable
tc-context --insights   # Just insights
```

### Get Pane Output
```bash
tc-output <pane_id>                  # Current screen
tc-output <pane_id> --lines 50       # Last 50 lines
tc-output <pane_id> --all            # Full scrollback
tc-output --cwd /path/to/project     # Find pane by directory
tc-output <pane_id> --match "error"  # Filter for errors
```

### Send Commands
```bash
tc-send <pane_id> "npm test"         # Run command
tc-send --cwd /myapp "npm test"      # By directory
tc-send --service dev_server --interrupt  # Stop server
```

### Watch for Output
```bash
tc-watch <pane_id> "ready on port"   # Wait for pattern
tc-watch --cwd /myapp "error" --alert
```
```

---

## Kitty Configuration

```conf
# ~/.config/kitty/kitty.conf

# Enable remote control (required)
allow_remote_control yes

# Socket for IPC
listen_on unix:/tmp/kitty-{user}

# Shell integration (enhances context)
shell_integration enabled

# Optional: show git branch in tab title
tab_title_template "{index}: {title} ({tab.active_exe})"
```

---

## Installation Script

```bash
#!/bin/bash
# install-terminal-context.sh

set -e

INSTALL_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/terminal-context"
BIN_DIR="${HOME}/.local/bin"
STATE_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/terminal-context"

echo "Installing Terminal Context..."

# Create directories
mkdir -p "$INSTALL_DIR/scripts"
mkdir -p "$BIN_DIR"
mkdir -p "$STATE_DIR/sessions"

# Copy scripts (assuming they're in current dir)
cp tc-context tc-output tc-send tc-watch "$INSTALL_DIR/scripts/"
chmod +x "$INSTALL_DIR/scripts/"*

# Symlink to bin
ln -sf "$INSTALL_DIR/scripts/tc-context" "$BIN_DIR/tc-context"
ln -sf "$INSTALL_DIR/scripts/tc-output" "$BIN_DIR/tc-output"
ln -sf "$INSTALL_DIR/scripts/tc-send" "$BIN_DIR/tc-send"
ln -sf "$INSTALL_DIR/scripts/tc-watch" "$BIN_DIR/tc-watch"

# Check Kitty config
KITTY_CONF="${XDG_CONFIG_HOME:-$HOME/.config}/kitty/kitty.conf"
if [[ -f "$KITTY_CONF" ]]; then
  if ! grep -q "allow_remote_control" "$KITTY_CONF"; then
    echo ""
    echo "⚠️  Add to $KITTY_CONF:"
    echo "    allow_remote_control yes"
    echo "    listen_on unix:/tmp/kitty-$USER"
  fi
else
  echo ""
  echo "⚠️  Create $KITTY_CONF with:"
  echo "    allow_remote_control yes"
  echo "    listen_on unix:/tmp/kitty-$USER"
fi

# Remind about shell integration
echo ""
echo "📝 Add shell integration to ~/.zshrc (see SKILL.md)"
echo ""
echo "✅ Installation complete!"
echo "   Restart Kitty and source your shell config."
```

---

## Example Agent Workflows

### 1. "Help me fix this build error"

```
Agent thinks: User mentioned a build error. Let me check their terminals.

$ tc-context --summary
→ Sees pane 3 has npm in cwd, last_exit_code=1

$ tc-output 3 --lines 50 --match "error"
→ Gets: "Module not found: Can't resolve './components/Button'"

Agent: "I can see the build failed because './components/Button' can't be found.
Looking at your project... [checks files] The file exists but is named
'button.tsx' (lowercase). Want me to fix the import?"
```

### 2. "Is my server running?"

```
Agent thinks: Check for running services.

$ tc-context --insights
→ "dev server is running on :3000 (pid 12345)"

Agent: "Yes, your Next.js dev server is running on port 3000 in pane 2."
```

### 3. "Run the tests"

```
Agent thinks: Find where tests should run, send command.

$ tc-context | jq '.kitty[].tabs[].windows[] | select(.user_vars.custom_label == "tests")'
→ Found pane 5 labeled "tests"

$ tc-send 5 "npm test"

Agent: "Running tests in your test terminal (pane 5)."

$ tc-watch 5 "Tests:.*passed\\|failed" --timeout 120
→ "Tests: 42 passed, 1 failed"

Agent: "Tests complete: 42 passed, 1 failed. Want me to look at the failure?"
```
