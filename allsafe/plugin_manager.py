import os
import subprocess

PLUGIN_DIR = os.path.join(os.path.dirname(__file__), "../custom_plugins")
TARGET_PLUGIN = "LinuxScript_TCP.sh"

class PluginManager:
    def __init__(self):
        self.plugins = self.load_plugins()
        self.screens = []  # Store screens here for later access

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
            return

        plugin = self.plugins[TARGET_PLUGIN]
        print(f"\n=== Executing Plugin: {plugin['path']} ===\n")

        with open(plugin["path"], "r") as file:
            raw_output = file.read()

        if raw_output:
            self.screens = self.parse_output(raw_output.strip())
            self.display_screens(self.screens)
            return self.screens
        else:
            print("Error: No output from plugin.")
            return {"error": "No output from plugin."}

    def parse_output(self, raw_output):
        screens = []
        lines = raw_output.splitlines()
        current_screen = None
        in_command_block = False
        command_buffer = []

        for line in lines:
            line = line.strip()

            if line == "@-":
                if current_screen:
                    screens.append(current_screen)
                current_screen = {"screen_name": "", "is_table": False, "content": []}

            elif line == "-@" and current_screen:
                if command_buffer:
                    command_output = self.execute_commands(command_buffer)
                    current_screen["content"].extend(command_output)
                    command_buffer.clear()
                screens.append(current_screen)
                current_screen = None

            elif current_screen:
                if line.startswith("display-mode="):
                    mode = line.split("=", 1)[1].strip().replace('"', '')
                    current_screen["is_table"] = (mode == "1")

                elif line.startswith("screen_name="):
                    current_screen["screen_name"] = line.split("=", 1)[1].strip().replace('"', '')

                elif line.startswith("table_columns=") and current_screen["is_table"]:
                    columns = [col.strip() for col in line.split("=", 1)[1].split(",")]
                    current_screen["content"].append(columns)

                elif line == "$":
                    in_command_block = not in_command_block

                elif in_command_block:
                    command_buffer.append(line)

        if current_screen:
            if command_buffer:
                command_output = self.execute_commands(command_buffer)
                current_screen["content"].extend(command_output)
            screens.append(current_screen)

        return screens

    def execute_commands(self, commands):
        result = []
        for command in commands:
            process = subprocess.Popen(
                command, 
                shell=True, 
                stdout=subprocess.PIPE, 
                stderr=subprocess.PIPE, 
                text=True
            )
            output, error = process.communicate()
            if error:
                print(f"Command Error: {error.strip()}")
            else:
                result.extend(output.strip().splitlines())
        return result

    def display_screens(self, screens):
        for index, screen in enumerate(screens):
            print(f"\n=== Screen {index + 1} ===")
            print(f"Screen Name: {screen['screen_name']}")
            if screen["is_table"]:
                for row in screen["content"]:
                    print("\t".join(row) if isinstance(row, list) else row)
            else:
                for line in screen["content"]:
                    print(line)

    def get_table_value(self, screen_index, row_index, column_index):
        if not self.screens:
            raise ValueError("Screens have not been loaded. Run execute_plugin() first.")

        screen = self.screens[screen_index]
        if not screen["is_table"]:
            raise ValueError(f"Screen {screen_index} is not a table.")

        table = screen["content"]
        if row_index >= len(table) - 1:
            raise IndexError("Row index out of range.")

        row = table[row_index + 1].split()  # +1 to skip header
        if column_index >= len(row):
            raise IndexError("Column index out of range.")

        return row[column_index]
