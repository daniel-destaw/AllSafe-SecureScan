from plugin_manager import PluginManager

# Initialize PluginManager
manager = PluginManager()

# Execute plugin and get parsed screens
manager.execute_plugin()

# Example: Accessing specific table values
print("\n=== Accessing Specific Table Values ===")
try:
    value = manager.get_table_value(0, 0, 0)
    print(f"Value at Screen 1, Row 0, Column 0: {value}")

    value = manager.get_table_value(0, 1, 1)
    print(f"Value at Screen 1, Row 1, Column 1: {value}")

except (IndexError, ValueError) as e:
    print(f"Error accessing table value: {e}")
