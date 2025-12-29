# 🖥️ Desktop Commander & Apple MCP Integration

## Overview
The Desktop Commander is the unified interface for local machine control, integrating the Apple MCP and the native Filesystem MCP.

## Components
- **Apple MCP**: Located in `zenith_logic/apple-mcp/`. Handles macOS specific automation and deep system integration.
- **Filesystem MCP**: (Slug: `filesystem`). Provides direct access to the local directories for exhibit search and document assembly.
- **Mac MCP**: (Slug: `mac`). Provides machine-level metadata (MAC address, etc.)

## Key Operations
- **Exhibit Search**: Combined Filesystem MCP + Apple Spotlight (via Apple MCP) for instant document retrieval.
- **Motion Merging**: Apple MCP provides the rendering layer for high-fidelity PDF generation on macOS.
- **Commander Interface**: Orchestrated via `ULTIMATE_LEGAL_ORCHESTRATOR.py` to call local terminal commands.

