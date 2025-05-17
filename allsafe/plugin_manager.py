import os
import subprocess
import pandas as pd

PLUGIN_DIR = os.path.join(os.path.dirname(__file__), "../custom_plugins")
TARGET_PLUGIN = "LinuxScript_TCP.sh"  # The specific plugin to execute

class PluginManager:
    def __init__(self):
        self.plugins = self.load_plugins()

    def load_plugins(self):
        plugins = {}
        if not os.path.exists(PLUGIN_DIR):
            os.makedirs(PLUGIN_DIR)
            print(f"Plugin directory not found. Created: {PLUGIN_DIR}")
            return plugins
        
        for file in os.listdir(PLUGIN_DIR):
            if file == TARGET_PLUGIN:
                file_path = os.path.join(PLUGIN_DIR, file)
                plugins[file] = {"path": file_path}
        return plugins

    def execute_plugin(self):
        if not self.plugins:
            print("No plugins found.")
            print(f"Make sure the plugin {TARGET_PLUGIN} exists in {PLUGIN_DIR}")
            return
        
        plugin = self.plugins[TARGET_PLUGIN]
        print(f"\n=== Executing Plugin: {plugin['path']} ===\n")

        process = subprocess.Popen(["bash", plugin["path"]], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        raw_output, error_output = process.communicate()

        print("\n=== Plugin Result (Raw Output) ===")
        print(raw_output)

        screens = {}
        current_screen = None
        columns = []

        for line in raw_output.splitlines():
            line = line.strip()
            if not line:
                continue
            
            if line.startswith("screen_name="):
                current_screen = line.split("=", 1)[1].strip().replace('"', '')
                screens[current_screen] = {"columns": [], "rows": []}
                columns = []

            elif line.startswith("table_columns="):
                columns = line.split("=", 1)[1].strip().replace('"', '').split(", ")
                screens[current_screen]["columns"] = columns

            else:
                if current_screen:
                    if columns:
                        row = line.split(maxsplit=len(columns) - 1)
                        screens[current_screen]["rows"].append(row)
                    else:
                        screens[current_screen]["rows"].append(line)

        print("\n=== Plugin Result (Screens) ===")
        for screen, data in screens.items():
            print(f"\n=== {screen} ===")
            if data["columns"]:
                try:
                    df = pd.DataFrame(data["rows"], columns=data["columns"])
                    print(df)
                except:
                    print("Error: Column mismatch detected in", screen)
            else:
                for row in data["rows"]:
                    print(row)

if __name__ == "__main__":
    manager = PluginManager()
    manager.execute_plugin()
