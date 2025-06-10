import os
import json
from datetime import datetime
import paramiko
import time


PLUGIN_DIR = os.path.join(os.path.dirname(__file__), "../custom_plugins")
JSON_OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "plugin_json")


class PluginManager:
    def __init__(self):
        self.screens = []
        self.logs = []  # Store logs here

    def execute_plugin_remotely(self, plugin_name, host, username, password):
        """
        Executes plugin commands remotely with real-time logging for each screen.
        Returns structured output with command results.
        """
        self.logs = []  # Reset logs for each execution
        plugin_filename = f"{plugin_name}.sh"
        plugin_path = os.path.join(PLUGIN_DIR, plugin_filename)

        if not os.path.isfile(plugin_path):
            error_msg = f"❌ Plugin '{plugin_name}' not found locally at {plugin_path}"
            self.logs.append(error_msg)
            print(error_msg)
            return {"error": error_msg}

        self.logs.append(f"\n=== Parsing Plugin Locally: {plugin_path} ===\n")
        print(f"\n=== Parsing Plugin Locally: {plugin_path} ===\n")

        try:
            with open(plugin_path, "r") as file:
                raw_script = file.read()
        except Exception as e:
            error_msg = f"❌ Error reading plugin file: {e}"
            self.logs.append(error_msg)
            print(error_msg)
            return {"error": "Could not read plugin file"}

        self.screens = self.parse_output(raw_script)

        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        try:
            ssh.connect(
                hostname=host,
                username=username,
                password=password,
                timeout=10
            )
        except Exception as e:
            error_msg = f"❌ SSH connection failed: {e}"
            self.logs.append(error_msg)
            print(error_msg)
            return {"error": "SSH connection failed"}

        self.logs.append("\n=== Running Commands Remotely (Real-Time Logs) ===\n")
        print("\n=== Running Commands Remotely (Real-Time Logs) ===\n")

        for screen_idx, screen in enumerate(self.screens):
            if not screen.get("commands"):
                continue

            screen_log = f"\n📺 Screen {screen_idx + 1}: {screen.get('screen_name', 'Unnamed')}"
            self.logs.append(screen_log)
            print(screen_log)
            
            combined_script = "\n".join(screen["commands"])
            cmd_log = f"🚀 Executing {len(screen['commands'])} command(s)..."
            self.logs.append(cmd_log)
            print(cmd_log)
            
            screen_output = []
            
            stdin, stdout, stderr = ssh.exec_command(combined_script, get_pty=True)
            
            while True:
                while stdout.channel.recv_ready():
                    line = stdout.readline()
                    if line:
                        cleaned = line.strip()
                        out_log = f"[OUT] {cleaned}"
                        self.logs.append(out_log)
                        print(out_log)
                        screen_output.append(cleaned)
                
                while stderr.channel.recv_stderr_ready():
                    line = stderr.readline()
                    if line:
                        cleaned = line.strip()
                        err_log = f"[ERR] {cleaned}"
                        self.logs.append(err_log)
                        print(err_log)
                        screen_output.append(f"ERROR: {cleaned}")
                
                if stdout.channel.exit_status_ready():
                    break
                
                time.sleep(0.1)

            new_content = []
            for item in screen["content"]:
                if item == "$CMD_OUTPUT":
                    new_content.extend(screen_output)
                else:
                    new_content.append(item)
            screen["content"] = new_content

            if "commands" in screen:
                del screen["commands"]

            complete_log = f"✅ Screen {screen_idx + 1} completed."
            self.logs.append(complete_log)
            print(complete_log)

        ssh.close()

        self.logs.append("\n=== Final Parsed Screens ===")
        print("\n=== Final Parsed Screens ===")
        self.display_screens(self.screens)
        
        return {
            "screens": self.screens,
            "logs": self.logs
        }
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
        Displays parsed screens in terminal with formatting.
        """
        for index, screen in enumerate(screens):
            print(f"\n=== Screen {index + 1} ===")
            print(f"Name: {screen['screen_name']}")
            print(f"Type: {'Table' if screen['is_table'] else 'Standard'}")
            
            if screen["is_table"]:
                # Print table with headers
                headers = screen["content"][0]
                print("\n" + " | ".join(headers))
                print("-" * (sum(len(h) for h in headers) + 3 * (len(headers) - 1)))
                
                for row in screen["content"][1:]:
                    if isinstance(row, list):
                        print(" | ".join(row))
                    else:
                        print(row)
            else:
                # Print standard content
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