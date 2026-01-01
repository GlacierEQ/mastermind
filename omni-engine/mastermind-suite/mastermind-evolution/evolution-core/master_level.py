import json

class RepoEvolution:
    """Manages the 'Power Level' of the repository, unlocking new UIs and Agents."""
    def __init__(self):
        self.current_xp = 0
        self.level = 1
        self.unlocked_frontends = ["ghost-ui"]
        self.active_agents = ["logic-engine"]

    def gain_xp(self, amount):
        self.current_xp += amount
        if self.current_xp >= 100 * self.level:
            self.level_up()

    def level_up(self):
        self.level += 1
        if self.level == 2:
            self.unlocked_frontends.append("nexus-hud")
            self.active_agents.append("ui-weaver")
        if self.level == 3:
            self.unlocked_frontends.append("matrix-view")
            self.active_agents.append("forensic-architect")
        print(f"🚀 REPO EVOLVED TO LEVEL {self.level}")
    def level_up_to_ecosystem(self):
        if self.level == 4:
            self.level = 5
            self.unlocked_frontends.append("mcp-registry-view")
            self.active_agents.append("ecosystem-scout")
            print("🌌 REPO EVOLVED TO LEVEL 5: MCP ECOSYSTEM ACTIVE")
