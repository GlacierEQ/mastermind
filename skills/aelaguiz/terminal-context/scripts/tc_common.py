from __future__ import annotations

import base64
import getpass
import json
import os
import re
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterable, Literal


class TerminalContextError(RuntimeError):
    pass


class KittyRemoteError(TerminalContextError):
    pass


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _iso_utc(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _parse_iso_utc(ts: str) -> datetime | None:
    # Accept "Z" or explicit offset.
    try:
        if ts.endswith("Z"):
            return datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone(timezone.utc)
        return datetime.fromisoformat(ts).astimezone(timezone.utc)
    except Exception:
        return None


def history_file_path() -> Path:
    override = os.environ.get("TC_HISTORY_FILE")
    if override:
        return Path(override).expanduser()
    xdg_state_home = os.environ.get("XDG_STATE_HOME")
    base = Path(xdg_state_home).expanduser() if xdg_state_home else Path.home() / ".local/state"
    return base / "terminal-context/history.jsonl"


def decode_user_var(encoded: str | None) -> str:
    if not encoded:
        return ""
    try:
        # Kitty stores values base64-encoded. We accept both with/without padding.
        padded = encoded + "=" * (-len(encoded) % 4)
        return base64.b64decode(padded).decode("utf-8", errors="replace")
    except Exception:
        return encoded


def run_cmd(cmd: list[str], timeout_s: float = 4.0) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, capture_output=True, text=True, timeout=timeout_s)


def _normalize_to_arg(value: str) -> str:
    v = (value or "").strip()
    if not v:
        return v
    # Accept raw unix socket paths ("/tmp/kitty-...") and normalize them for kitten/kitty.
    if v.startswith("/"):
        return f"unix:{v}"
    return v


def _expand_user_placeholder(sock: str) -> list[str]:
    # Kitty supports {user} placeholder in listen_on, but some environments can expose
    # literal "{user}" in env vars, while the socket on disk may be expanded (or vice-versa).
    if "{user}" not in sock:
        return [sock]
    user = os.environ.get("USER") or getpass.getuser() or "user"
    return [sock, sock.replace("{user}", user)]


def _tmp_kitty_socket_candidates() -> list[str]:
    """
    Best-effort discovery of Kitty sockets in /tmp for the current user.

    This is what makes the tools "just work" when run outside Kitty (no KITTY_LISTEN_ON).
    """
    tmp = Path("/tmp")
    if not tmp.exists():
        return []

    uid = os.getuid()
    candidates: list[tuple[float, str]] = []
    # Support both "kitty" and "kitty-*" style naming (Kitty can append suffixes).
    for p in tmp.glob("kitty*"):
        try:
            if not p.is_socket():
                continue
            st = p.stat()
            if st.st_uid != uid:
                continue
            # Sort by mtime so the most recently touched socket is preferred when multiple exist.
            candidates.append((st.st_mtime, f"unix:{str(p)}"))
        except Exception:
            continue

    candidates.sort(key=lambda x: x[0], reverse=True)
    return [c[1] for c in candidates]


def _candidate_kitty_sockets() -> list[str]:
    # Prefer explicit override.
    override = os.environ.get("TC_KITTY_SOCKET")
    if override:
        override = _normalize_to_arg(override)
        out: list[str] = []
        for s in _expand_user_placeholder(override):
            out.append(s)
        return out

    listen_on = os.environ.get("KITTY_LISTEN_ON")
    if listen_on:
        listen_on = _normalize_to_arg(listen_on)
        out: list[str] = []
        for s in _expand_user_placeholder(listen_on):
            out.append(s)
        return out

    user = os.environ.get("USER") or getpass.getuser() or "user"
    # Prefer scanning /tmp first; it makes running from non-Kitty shells work reliably.
    scanned = _tmp_kitty_socket_candidates()
    guesses = [
        f"unix:/tmp/kitty-{user}",
        "unix:/tmp/kitty",
    ]
    out: list[str] = []
    for s in scanned + guesses:
        for expanded in _expand_user_placeholder(s):
            out.append(_normalize_to_arg(expanded))
    # Preserve ordering but de-dupe.
    seen: set[str] = set()
    deduped: list[str] = []
    for s in out:
        if s and s not in seen:
            seen.add(s)
            deduped.append(s)
    return deduped


def _socket_file_exists(sock: str) -> bool:
    if not sock.startswith("unix:"):
        return True
    path = sock.removeprefix("unix:")
    p = Path(path)
    return p.exists() and p.is_socket()


@dataclass(frozen=True)
class KittyEndpoint:
    to_arg: str | None  # None => in-band remote control


class KittyClient:
    def __init__(self, timeout_s: float = 2.0):
        self.timeout_s = timeout_s
        self._endpoint: KittyEndpoint | None = None

    def endpoint(self) -> KittyEndpoint:
        if self._endpoint is not None:
            return self._endpoint

        # First, try sockets that exist and actually respond (avoids choosing stale sockets).
        for sock in _candidate_kitty_sockets():
            if not _socket_file_exists(sock):
                continue
            try:
                probe = run_cmd(["kitten", "@", "--to", sock, "ls"], timeout_s=min(0.75, self.timeout_s))
            except Exception:
                continue
            if probe.returncode == 0:
                self._endpoint = KittyEndpoint(to_arg=sock)
                return self._endpoint

        # In-band remote control writes escape sequences directly to the controlling
        # TTY and often times out in non-interactive contexts. Default to requiring
        # a socket, unless explicitly allowed.
        allow_in_band = os.environ.get("TC_ALLOW_IN_BAND", "").strip() not in {"", "0", "false", "False"}
        if allow_in_band:
            self._endpoint = KittyEndpoint(to_arg=None)
            return self._endpoint

        raise KittyRemoteError(
            "No Kitty remote control socket detected. "
            "Set `listen_on unix:/tmp/kitty-{user}` in kitty.conf and restart Kitty "
            "(or set TC_KITTY_SOCKET to your active socket like `unix:/tmp/kitty-...`). "
            "As a fallback you can also set TC_ALLOW_IN_BAND=1 for best-effort in-band remote control."
        )

    def _run(self, args: list[str]) -> str:
        ep = self.endpoint()
        cmd = ["kitten", "@"]  # 'kitty @' is an alias; 'kitten @' is clearer.
        if ep.to_arg:
            cmd += ["--to", ep.to_arg]
        cmd += args

        try:
            result = run_cmd(cmd, timeout_s=self.timeout_s)
        except subprocess.TimeoutExpired as e:
            raise KittyRemoteError(
                "Kitty remote control timed out. "
                "Enable socket mode (listen_on) for reliable, non-interactive use."
            ) from e

        if result.returncode != 0:
            stderr = (result.stderr or "").strip()
            raise KittyRemoteError(
                "Kitty remote control failed. "
                "If you are running non-interactively, configure a socket in kitty.conf (listen_on) "
                f"and restart Kitty. Details: {stderr}"
            )

        return result.stdout

    def ls(self) -> list[dict[str, Any]]:
        out = self._run(["ls"])
        try:
            return json.loads(out)
        except Exception as e:
            raise KittyRemoteError("Failed to parse `kitten @ ls` JSON output") from e

    def get_text(self, pane_id: int, extent: Literal["screen", "all"] = "screen") -> str:
        # Extent values per kitty docs: screen, all, selection, etc.
        return self._run(["get-text", "--match", f"id:{pane_id}", f"--extent={extent}"])

    def send_text(self, pane_id: int, text: str) -> None:
        # `send-text` expects text as an argument. Newlines are honored.
        self._run(["send-text", "--match", f"id:{pane_id}", text])

    def focus_window(self, pane_id: int) -> None:
        self._run(["focus-window", "--match", f"id:{pane_id}"])

    def set_window_title(self, pane_id: int, title: str) -> None:
        self._run(["set-window-title", "--match", f"id:{pane_id}", title])

    def set_user_vars(self, pane_id: int, vars: dict[str, str]) -> None:
        # `set-user-vars` takes KEY=VALUE args.
        args = ["set-user-vars", "--match", f"id:{pane_id}"]
        for k, v in vars.items():
            args.append(f"{k}={v}")
        self._run(args)

    def close_window(self, pane_id: int) -> None:
        self._run(["close-window", "--match", f"id:{pane_id}"])


def iter_panes(kitty_ls: list[dict[str, Any]]) -> Iterable[dict[str, Any]]:
    for os_window in kitty_ls or []:
        for tab in os_window.get("tabs", []) or []:
            for pane in tab.get("windows", []) or []:
                yield pane


def find_pane_by_id(kitty_ls: list[dict[str, Any]], pane_id: int) -> dict[str, Any] | None:
    for pane in iter_panes(kitty_ls):
        if int(pane.get("id", -1)) == pane_id:
            return pane
    return None


def find_pane_by_cwd(kitty_ls: list[dict[str, Any]], cwd_query: str) -> dict[str, Any] | None:
    needle = str(cwd_query)
    for pane in iter_panes(kitty_ls):
        cwd = pane.get("cwd") or ""
        if cwd.endswith(needle) or needle in cwd:
            return pane
    return None


def normalize_cmdline(cmdline: Any) -> str:
    if cmdline is None:
        return ""
    if isinstance(cmdline, str):
        return cmdline
    if isinstance(cmdline, list):
        return " ".join(str(x) for x in cmdline)
    return str(cmdline)


def detect_service_type(pane: dict[str, Any]) -> dict[str, Any] | None:
    cmdline = normalize_cmdline(pane.get("cmdline")).strip().lower()
    title = (pane.get("title") or "").strip().lower()

    # Dev servers (node)
    if any(x in cmdline for x in ["next dev", "vite", "webpack serve", "npm run dev", "yarn dev", "pnpm dev"]):
        return {"type": "dev_server", "framework": "node"}

    # Dev servers (python)
    if "manage.py runserver" in cmdline or cmdline.endswith("runserver"):
        return {"type": "dev_server", "framework": "django"}

    # Rails
    if "rails s" in cmdline or "rails server" in cmdline:
        return {"type": "dev_server", "framework": "rails"}

    # Rust
    if "cargo run" in cmdline or "cargo watch" in cmdline:
        return {"type": "dev_server", "framework": "rust"}

    # Watchers
    if any(x in cmdline for x in ["jest --watch", "pytest-watch", "nodemon", "tsc --watch"]):
        return {"type": "watcher"}

    # Databases / clients
    if any(x in cmdline for x in ["psql", "mysql", "mongosh", "redis-cli", "sqlite3"]):
        return {"type": "database", "name": cmdline.split()[0] if cmdline else "database"}

    # Editors
    if any(x in cmdline for x in ["vim", "nvim", "emacs", "nano", "code", "hx"]):
        return {"type": "editor", "name": cmdline.split()[0] if cmdline else "editor"}
    if "vim" in title or "nvim" in title:
        return {"type": "editor", "name": "vim"}

    # REPL (single-word invocation)
    if cmdline in {"python", "python3", "node", "irb"}:
        return {"type": "repl", "name": cmdline}

    # Shell
    if cmdline in {"zsh", "bash", "fish", ""}:
        return {"type": "shell"}

    return None


def read_recent_history(minutes: int = 30, pane_id: int | None = None, limit: int = 200) -> list[dict[str, Any]]:
    path = history_file_path()
    if not path.exists():
        return []

    cutoff = _now_utc() - timedelta(minutes=minutes)
    events: list[dict[str, Any]] = []
    try:
        with path.open("r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                except json.JSONDecodeError:
                    continue

                ts = _parse_iso_utc(str(entry.get("ts", "")))
                if ts is None or ts < cutoff:
                    continue

                if pane_id is not None and str(entry.get("pane")) != str(pane_id):
                    continue

                events.append(entry)
    except Exception:
        return []

    return events[-limit:]


@dataclass(frozen=True)
class PortListener:
    port: int
    protocol: Literal["tcp", "udp"]
    pid: int
    process_name: str

    def to_json(self) -> dict[str, Any]:
        return {
            "port": self.port,
            "protocol": self.protocol,
            "pid": self.pid,
            "process_name": self.process_name,
        }


_PORT_RE = re.compile(r":(\d+)$")


def parse_lsof_listeners(output: str) -> list[PortListener]:
    listeners: list[PortListener] = []
    for line in output.splitlines():
        line = line.rstrip("\n")
        if not line or line.startswith("COMMAND "):
            continue
        if "(LISTEN)" not in line:
            continue

        parts = line.split()
        if len(parts) < 2:
            continue

        process_name = parts[0]
        try:
            pid = int(parts[1])
        except ValueError:
            continue

        # On macOS, the address is typically the token right before "(LISTEN)".
        addr = parts[-2] if parts[-1] == "(LISTEN)" and len(parts) >= 2 else parts[-1]
        match = _PORT_RE.search(addr)
        if not match:
            continue
        try:
            port = int(match.group(1))
        except ValueError:
            continue

        listeners.append(PortListener(port=port, protocol="tcp", pid=pid, process_name=process_name))

    # De-dupe (IPv4/IPv6 duplicates etc.)
    uniq: dict[tuple[int, int, str], PortListener] = {}
    for l in listeners:
        uniq[(l.port, l.pid, l.process_name)] = l
    return list(uniq.values())


def get_listening_ports(timeout_s: float = 4.0) -> list[dict[str, Any]]:
    try:
        result = run_cmd(["lsof", "-nP", "-iTCP", "-sTCP:LISTEN"], timeout_s=timeout_s)
    except Exception:
        return []

    if result.returncode != 0:
        return []

    return [p.to_json() for p in parse_lsof_listeners(result.stdout)]


def get_docker_containers(timeout_s: float = 4.0) -> list[dict[str, Any]]:
    if not shutil_which("docker"):
        return []

    # Docker "json" formatter is not universal; use json-template which is stable.
    try:
        result = run_cmd(["docker", "ps", "--format", "{{json .}}"], timeout_s=timeout_s)
    except Exception:
        return []

    if result.returncode != 0:
        return []

    containers: list[dict[str, Any]] = []
    for line in result.stdout.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            containers.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return containers


def shutil_which(cmd: str) -> str | None:
    from shutil import which

    return which(cmd)


def map_ports_to_panes(kitty_ls: list[dict[str, Any]], ports: list[dict[str, Any]]) -> dict[int, int]:
    """Return {port: pane_id} by matching port listener pid to pane pid."""
    pid_to_pane: dict[int, int] = {}
    for pane in iter_panes(kitty_ls):
        pid = pane.get("pid")
        try:
            pid_int = int(pid)
        except Exception:
            continue
        pane_id = pane.get("id")
        try:
            pane_id_int = int(pane_id)
        except Exception:
            continue
        pid_to_pane[pid_int] = pane_id_int

    port_to_pane: dict[int, int] = {}
    for p in ports:
        try:
            port = int(p.get("port"))
            pid = int(p.get("pid"))
        except Exception:
            continue
        if pid in pid_to_pane:
            port_to_pane[port] = pid_to_pane[pid]
    return port_to_pane


def generate_insights(
    kitty_ls: list[dict[str, Any]],
    ports: list[dict[str, Any]],
    history: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    insights: list[dict[str, Any]] = []

    port_to_pane = map_ports_to_panes(kitty_ls, ports)

    common_ports: dict[int, str] = {
        3000: "dev server",
        5173: "vite dev server",
        8000: "backend server",
        5432: "postgres",
        6379: "redis",
    }
    ports_by_num: dict[int, dict[str, Any]] = {}
    for p in ports:
        try:
            ports_by_num[int(p.get("port"))] = p
        except Exception:
            continue

    for port, label in common_ports.items():
        if port in ports_by_num:
            p = ports_by_num[port]
            insights.append(
                {
                    "type": "info",
                    "category": "server",
                    "message": f"{label} is listening on :{port} (pid {p.get('pid')})",
                    "pane_id": port_to_pane.get(port),
                }
            )

    recent_failures = [h for h in history if h.get("event") == "end" and int(h.get("exit", 0) or 0) != 0]
    for failure in recent_failures[-3:]:
        cmd = str(failure.get("cmd", ""))
        insights.append(
            {
                "type": "warning",
                "category": "build",
                "message": f"Command failed: `{cmd[:80]}` (exit {failure.get('exit')})",
                "pane_id": failure.get("pane"),
            }
        )

    # Heuristic: detect multi-branch situations by project leaf dir.
    branches_by_project: dict[str, set[str]] = {}
    for pane in iter_panes(kitty_ls):
        user_vars = pane.get("user_vars") or {}
        branch = decode_user_var(user_vars.get("git_branch"))
        cwd = pane.get("cwd") or ""
        if not branch or not cwd:
            continue
        project = Path(cwd).name or cwd
        branches_by_project.setdefault(project, set()).add(branch)

    for project, branches in branches_by_project.items():
        if len(branches) > 1:
            insights.append(
                {
                    "type": "warning",
                    "category": "git",
                    "message": f"Multiple git branches detected for {project}: {', '.join(sorted(branches))}",
                }
            )

    return insights


def enrich_kitty_state(kitty_ls: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Mutate a copy of kitty ls output to add derived fields (detected_service, is_self)."""
    self_id = os.environ.get("KITTY_WINDOW_ID")
    self_id_int: int | None = None
    try:
        if self_id is not None:
            self_id_int = int(self_id)
    except Exception:
        self_id_int = None

    # Deep copy minimal: we only mutate panes.
    for pane in iter_panes(kitty_ls):
        pane["detected_service"] = detect_service_type(pane)
        try:
            pane_id = int(pane.get("id"))
        except Exception:
            pane_id = None
        pane["is_self"] = bool(self_id_int is not None and pane_id == self_id_int)

    return kitty_ls
