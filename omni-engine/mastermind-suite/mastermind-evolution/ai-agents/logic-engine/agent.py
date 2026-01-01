import sys
from pathlib import Path

# Add bridge path
sys.path.append(str(Path(__file__).parent.parent.parent / "evolution-core/kernel-bridge"))

class LogicEngine:
    """
    MAXIMUM SPECIALIZATION: The Strategic Declassified Mission Deconstruction Engine.
    Now integrated with Omni-Kernel Legacy Missions.
    """
    def __init__(self):
        try:
            from kernel_sync import OmniKernelBridge
            self.kernel = OmniKernelBridge()
        except ImportError:
            self.kernel = None

    def deconstruct_mission(self, intent_shards):
        print(f"🧠 [LOGIC_ENGINE] Deconstructing intent shards...")
        
        # If intent includes legacy sync, fire the kernel bridge
        if "master_sync" in intent_shards or "legacy" in intent_shards:
            if self.kernel:
                self.kernel.execute_legacy_mission("005")
        
        return {"action_path": "TITANIC_DEADROP_PROTOCOL", "power_level": "MAX"}
