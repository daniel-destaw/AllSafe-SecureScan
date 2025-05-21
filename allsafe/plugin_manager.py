import os
import json
from datetime import datetime
import paramiko


PLUGIN_DIR = os.path.join(os.path.dirname(__file__), "../custom_plugins")
JSON_OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "plugin_json")


class PluginManager:
    def __init__(self):
        self.screens = []  # Store parsed screens for later access

    def execute_plugin_remotely(self, plugin_name, host, username, password):
        """
        Executes plugin commands remotely.
        Fully supports multi-line scripts and variables.
        """
        plugin_filename = f"{plugin_name}.sh"
        plugin_path = os.path.join(PLUGIN_DIR, plugin_filename)

        if not os.path.isfile(plugin_path):
            print(f"Plugin '{plugin_name}' not found locally at {plugin_path}")
            return {"error": f"Plugin '{plugin_name}' not found locally."}

        print(f"\n=== Parsing Plugin Locally: {plugin_path} ===\n")

        try:
            with open(plugin_path, "r") as file:
                raw_script = file.read()
        except Exception as e:
            print(f"Error reading plugin file: {e}")
            return {"error": "Could not read plugin file"}

        # Parse the plugin structure locally
        self.screens = self.parse_output(raw_script)

        # Extract all commands inside $...$ blocks
        screen_command_map = []
        for idx, screen in enumerate(self.screens):
            if screen.get("commands"):
                screen_command_map.append({
                    "screen_index": idx,
                    "commands": screen["commands"]
                })

        if not screen_command_map:
            print("No commands to execute remotely.")
            return self.screens

        # Connect to remote host
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        try:
            ssh.connect(
                hostname=host,
                username=username,
                password=password
            )
        except Exception as e:
            print(f"SSH connection failed: {e}")
            return {"error": "SSH connection failed"}

        print("\n=== Running Commands Remotely ===\n")

        # Run each command block and capture output
        command_outputs = []
        
        for screen_info in screen_command_map:
            # Combine all commands in this screen into one script
            combined_script = "\n".join(screen_info["commands"])
            out, err = self.run_remote_shell_script(ssh, combined_script)

            if err:
                print(f"[Remote Error] {err}")
                command_outputs.append([f"[ERROR] {err}"])
            else:
                # Split output by command (assuming each command produces output)
                lines = [line.strip() for line in out.splitlines() if line.strip()]
                command_outputs.append(lines)

        ssh.close()

        # Inject remote output into screens
        output_index = 0
        for screen_info in screen_command_map:
            screen_idx = screen_info["screen_index"]
            screen = self.screens[screen_idx]

            new_content = []
            for item in screen["content"]:
                if isinstance(item, str) and item == "$CMD_OUTPUT":
                    if output_index < len(command_outputs):
                        for line in command_outputs[output_index]:
                            new_content.append(line)
                        output_index += 1
                else:
                    new_content.append(item)

            screen["content"] = new_content

        # Remove any 'commands' key from final output
        for screen in self.screens:
            if "commands" in screen:
                del screen["commands"]

        self.display_screens(self.screens)
        return self.screens

    def run_remote_shell_script(self, ssh, script):
        """
        Improved remote script execution that handles variables and multi-line commands.
        """
        # Create a temporary script file with proper bash shebang
        full_command = f"""cat > /tmp/plugin_script.sh <<'PLUGIN_EOF'
#!/bin/bash
{script}
PLUGIN_EOF

chmod +x /tmp/plugin_script.sh
# Capture both stdout and stderr
/tmp/plugin_script.sh 2>&1
"""

        stdin, stdout, stderr = ssh.exec_command(full_command)
        out = stdout.read().decode().strip()
        err = stderr.read().decode().strip()

        return out, err

    def parse_output(self, raw_output):
        """
        Parses raw plugin output into structured screens.
        Improved to better handle command blocks with variables.
        """
        screens = []
        lines = raw_output.splitlines()
        current_screen = None
        in_command_block = False
        command_buffer = []

        for line in lines:
            line = line.rstrip()  # Preserve left whitespace

            if line == "@-":
                if current_screen:
                    screens.append(current_screen)
                current_screen = {
                    "screen_name": "",
                    "is_table": False,
                    "content": [],
                    "commands": []
                }

            elif line == "-@" and current_screen:
                if command_buffer:
                    current_screen["commands"].append("\n".join(command_buffer))
                    current_screen["content"].append("$CMD_OUTPUT")
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
                    if in_command_block and command_buffer:
                        current_screen["commands"].append("\n".join(command_buffer))
                        current_screen["content"].append("$CMD_OUTPUT")
                        command_buffer = []
                    in_command_block = not in_command_block

                elif in_command_block:
                    command_buffer.append(line)
                else:
                    current_screen["content"].append(line)

        if current_screen:
            if command_buffer:
                current_screen["commands"].append("\n".join(command_buffer))
                current_screen["content"].append("$CMD_OUTPUT")
            screens.append(current_screen)

        return screens

    def display_screens(self, screens):
        """
        Displays parsed screens in terminal.
        """
        for index, screen in enumerate(screens):
            print(f"\n=== Screen {index + 1} ===")
            print(f"Screen Name: {screen['screen_name']}")
            if screen["is_table"]:
                for row in screen["content"]:
                    print("\t".join(row) if isinstance(row, list) else row)
            else:
                for line in screen["content"]:
                    print(line)

    def save_to_json(self, plugin_name):
        """
        Saves parsed screens to a JSON file with timestamp in plugin_json directory.
        """
        if not self.screens:
            print("No screens available to save.")
            return

        os.makedirs(JSON_OUTPUT_DIR, exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{plugin_name}_{timestamp}.json"
        filepath = os.path.join(JSON_OUTPUT_DIR, filename)

        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(self.screens, f, indent=4, ensure_ascii=False)
            print(f"\n✅ Screens saved to: {filepath}")
        except Exception as e:
            print(f"❌ Error saving JSON: {e}")

    def get_table_value(self, screen_index, row_index, column_index):
        """
        Get value from a table screen by indices.
        """
        if not self.screens:
            raise ValueError("Screens have not been loaded. Run execute_plugin_remotely() first.")

        screen = self.screens[screen_index]
        if not screen["is_table"]:
            raise ValueError(f"Screen {screen_index} is not a table.")

        table = screen["content"]
        if row_index >= len(table) - 1:
            raise IndexError("Row index out of range.")

        row = table[row_index + 1]  # Skip header
        if isinstance(row, list):
            row = " ".join(row)

        cells = row.split()
        if column_index >= len(cells):
            raise IndexError("Column index out of range.")

        return cells[column_index]