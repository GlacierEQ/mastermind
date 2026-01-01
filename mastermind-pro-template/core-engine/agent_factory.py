import os
import importlib
from pathlib import Path

class AgentFactory:
    """The heart of Mastermind: Spawns specialized agents on demand."""
    def __init__(self):
        self.agent_registry = {}
        self.load_agents()

    def load_agents(self):
        # Dynamically discover agents in the directory
        agent_dir = Path(__file__).parent / "agents"
        agent_dir.mkdir(exist_ok=True)
        for agent_file in agent_dir.glob("*.py"):
            if agent_file.name == "__init__.py": continue
            module_name = f"agents.{agent_file.stem}"
            self.agent_registry[agent_file.stem] = module_name
            print(f"[*] Registered Agent: {agent_file.stem}")

    def spawn(self, agent_id, **kwargs):
        if agent_id not in self.agent_registry:
            raise ValueError(f"Agent {agent_id} not found in Nexus registry.")
        module = importlib.import_module(self.agent_registry[agent_id])
        return module.AgentInstance(**kwargs)

if __name__ == "__main__":
    factory = AgentFactory()

    def activate_tier_zero(self):
        """Unlocks Ring -3 Power Level across the agent ecosystem."""
        print("⚡ [FACTORY] ACTIVATING TIER ZERO RING -3...")
        os.environ["MASTERMIND_TIER"] = "ZERO"
        os.environ["RING_LEVEL"] = "-3"
        return {"tier": "ZERO", "ring": -3, "status": "GOD_MODE"}
