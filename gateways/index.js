/**
 * Rube MCP Server - npm package entry point
 *
 * This package helps users set up the Rube MCP server hosted at https://rube.app/mcp
 * The actual MCP server runs remotely, this package just provides setup utilities.
 */

const MCP_SERVER_URL = 'https://rube.app/mcp';
const CURSOR_DEEPLINK = 'cursor://anysphere.cursor-deeplink/mcp/install?name=rube&config=eyJ1cmwiOiJodHRwczovL3J1YmUuY29tcG9zaW8uZGV2L21jcD9hZ2VudD1jdXJzb3IifQ%3D%3D';
const VSCODE_DEEPLINK = 'vscode:mcp/install?%7B%22name%22%3A%22rube%22%2C%22type%22%3A%22stdio%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22mcp-remote%22%2C%22https%3A%2F%2Frube.app%2Fmcp%22%5D%7D';
const goosy = require('./lib/goosy');

module.exports = {
  MCP_SERVER_URL,
  CURSOR_DEEPLINK,
  VSCODE_DEEPLINK,
  goosy, // 🦢 Goosy - The Ultimate File Pattern Engine

  /**
   * Get the MCP server configuration for different clients
   */
  getConfig: (client) => {
    const configs = {
      'claude-desktop': {
        name: 'Rube',
        url: MCP_SERVER_URL,
        type: 'http'
      },
      'claude-free': {
        command: `npx @composio/mcp@latest setup "${MCP_SERVER_URL}" "rube" --client claude`
      },
      'claude-code': {
        command: `claude mcp add --transport http rube -s user "${MCP_SERVER_URL}"`
      },
      'vscode': {
        deeplink: VSCODE_DEEPLINK,
        command: `npx mcp-remote "${MCP_SERVER_URL}"`
      },
      'cursor': {
        deeplink: CURSOR_DEEPLINK,
        name: 'rube',
        type: 'streamableHttp'
      },
      'generic': {
        url: MCP_SERVER_URL,
        type: 'http',
        documentation: 'https://rube.app/docs/generic-setup'
      },
      'jetbrains': {
        command: `npx mcp-jetbrains "${MCP_SERVER_URL}"`,
        documentation: 'https://rube.app/docs/jetbrains-setup'
      }
    };

    return configs[client] || { url: MCP_SERVER_URL };
  },

  /**
   * Get information about the Rube MCP server
   */
  getServerInfo: () => ({
    name: 'Rube MCP Server',
    description: 'Connect AI chat tools to 500+ applications',
    url: MCP_SERVER_URL,
    homepage: 'https://rube.app',
    support: 'support@composio.dev',
    version: '1.0.0',
    apps: [
      'Gmail', 'Slack', 'Notion', 'GitHub', 'Linear', 'Airtable',
      'Trello', 'Asana', 'Jira', 'Google Drive', 'Dropbox', 'OneDrive'
    ]
  }),

  /**
   * 🦢 Goosy - Advanced File Pattern Management System
   * The world's most powerful file ignoring and pattern matching engine
   */
  goosy: {
    /**
     * Initialize Goosy engine
     */
    initialize: async () => {
      await goosy.initialize();
      return goosy.getStatistics();
    },

    /**
     * Scan directory for ignored files
     */
    scan: async (dirPath = '.') => {
      await goosy.initialize();
      return goosy.scanDirectory(dirPath);
    },

    /**
     * Check if file should be ignored
     */
    shouldIgnore: async (filePath) => {
      await goosy.initialize();
      return goosy.shouldIgnore(filePath);
    },

    /**
     * Add pattern to .goosyignore
     */
    addPattern: async (pattern) => {
      await goosy.initialize();
      return goosy.addPattern(pattern);
    },

    /**
     * Remove pattern from .goosyignore
     */
    removePattern: async (pattern) => {
      await goosy.initialize();
      return goosy.removePattern(pattern);
    },

    /**
     * Get Goosy statistics
     */
    getStats: () => goosy.getStatistics(),

    /**
     * Get all loaded patterns
     */
    getPatterns: () => goosy.patterns,

    /**
     * Get Goosy version and capabilities
     */
    getInfo: () => ({
      name: 'Goosy Ultimate',
      version: '1.0.0',
      description: 'The World\'s Most Powerful File Pattern Engine',
      capabilities: [
        'Advanced pattern matching',
        'AI-powered optimization',
        'Real-time monitoring',
        'Performance analytics',
        'Security scanning',
        'Automatic cleanup',
        'Cache optimization'
      ],
      patternsLoaded: goosy.patterns.length,
      cacheSize: goosy.getStatistics().cacheSize
    })
  },

  /**
   * 🌌 Superluminal - Unified Case Management & Integration
   */
  Superluminal: require('./superluminal_integration'),

  /**
   * ☁️ MultiCloud - Advanced Cloud Storage Integration
   */
  MultiCloud: require('./multi_cloud_extension')
};
