from plugin_manager import PluginManager

manager = PluginManager()
plugin_name = "LinuxScript_TCP"

# Remote execution config
remote_host = "10.2.10.78"
remote_user = "wega"
remote_password = "wegagen@123"

# Execute plugin remotely
result = manager.execute_plugin_remotely(
    plugin_name=plugin_name,
    host=remote_host,
    username=remote_user,
    password=remote_password
)

# Only proceed if execution was successful
if isinstance(result, list):  # means success
    manager.save_to_json(plugin_name)

    # Optional: Accessing specific values
    print("\n=== Accessing Specific Table Values ===")
    try:
        value = manager.get_table_value(0, 0, 0)
        print(f"Value at Screen 1, Row 0, Column 0: {value}")

        value = manager.get_table_value(0, 1, 1)
        print(f"Value at Screen 1, Row 1, Column 1: {value}")

    except (IndexError, ValueError) as e:
        print(f"Error accessing table value: {e}")
else:
    print("Failed to execute plugin:", result.get("error", "Unknown error"))