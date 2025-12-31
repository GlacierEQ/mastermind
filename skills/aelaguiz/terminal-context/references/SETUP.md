# Setup (Kitty + Shell Hooks)

This skill relies on Kitty remote control and optional shell hooks to enrich pane metadata.

## 1) Kitty configuration (recommended: socket mode)

Add to `~/.config/kitty/kitty.conf`:

```conf
# Required for remote control
allow_remote_control yes

# Strongly recommended for non-interactive tools (like Codex exec)
listen_on unix:/tmp/kitty-{user}
```

Then fully restart Kitty.

Why socket mode: in-band remote control (escape-sequence based) often fails in non-interactive execution contexts; socket mode is reliable.

If you want to try best-effort in-band remote control anyway, you can set:

```bash
export TC_ALLOW_IN_BAND=1
```

## 2) Shell integration (zsh)

The shell hooks:
- append JSONL events to `~/.local/state/terminal-context/history.jsonl`
- set Kitty `user_vars` (git branch/dirty, last command, exit code, duration, etc.)

Add the snippet from `references/ZSH_HOOKS.md` to `~/.zshrc`, then restart your shell.

## 3) Install the scripts on PATH

From this repo root:

```bash
bash skills/codex/terminal-context/scripts/install.sh
```

That installer:
- copies this skill into `~/.codex/skills/terminal-context`
- installs `tc-*` commands into `~/.local/bin` (symlinks)
