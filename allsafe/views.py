import json
import os
import socket
import paramiko
from django.http import JsonResponse
from .plugin_manager import PluginManager 
from .models import Resource
from inertia import inertia
from django.views.decorators.csrf import csrf_exempt

# Check if the IP address is reachable (ping)
def is_ip_reachable(ip):
    try:
        socket.create_connection((ip, 22), timeout=5)  # Try connecting to port 22 (SSH)
        return True
    except (socket.timeout, socket.error):
        return False

# Check SSH credentials
def check_ssh_credentials(ip, username, password):
    try:
        # Attempt SSH connection with the provided credentials
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())  # Automatically add unknown keys
        client.connect(ip, username=username, password=password, timeout=5)
        client.close()
        return True
    except paramiko.AuthenticationException:
        return False  # Authentication failed
    except paramiko.SSHException as e:
        return False  # SSH protocol issues
    except Exception as e:
        print(f"Error: {str(e)}")
        return False  # General error (could be network issues, timeout, etc.)

# Get the hostname via SSH
def get_hostname(ip, username, password):
    try:
        # Establish SSH connection
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(ip, username=username, password=password, timeout=5)
        
        # Execute command to get hostname
        stdin, stdout, stderr = client.exec_command('hostname')
        hostname = stdout.read().decode().strip()  # Get the hostname from stdout
        client.close()
        
        return hostname
    except Exception as e:
        print(f"Error fetching hostname: {str(e)}")
        return None

@inertia('Home/Index')
def index(request):
    return {}

@inertia('resource_dashboard')
def resource_dashboard(request):
    return {}

@inertia('resource/resource')
def resource(request):
    return {}

@inertia('users/users')
def users(request):
    return {}


@inertia('management')
def management(request):
    return {}

@csrf_exempt
def save_resource(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print("Received data:", data)  # Log incoming data for debugging

            ip = data.get('ipAddress')
            username = data.get('username')
            password = data.get('password')

            # Validate required fields
            if not ip or not username or not password:
                return JsonResponse({'message': 'Missing required fields (ipAddress, username, password)'}, status=400)

            # Check if the IP address already exists in the database
            if Resource.objects.filter(ip_address=ip).exists():
                return JsonResponse({'message': 'IP address already exists in the database'}, status=400)

            # Check if the IP address is reachable
            if not is_ip_reachable(ip):
                return JsonResponse({'message': 'IP address is not reachable'}, status=400)

            # Check if SSH credentials are correct
            if not check_ssh_credentials(ip, username, password):
                return JsonResponse({'message': 'Invalid username or password'}, status=400)

            # Get the hostname via SSH
            hostname = get_hostname(ip, username, password)
            if not hostname:
                return JsonResponse({'message': 'Could not retrieve hostname'}, status=400)

            # If both checks pass, save the resource
            resource = Resource(ip_address=ip, username=username, password=password, hostname=hostname)
            resource.save()

            return JsonResponse({'message': 'Resource saved successfully'}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON format'}, status=400)
        except Exception as e:
            return JsonResponse({'message': f"Error: {str(e)}"}, status=400)

@csrf_exempt
def get_resources(request):
    if request.method == 'GET':
        try:
            # Fetch resources and add hostname for each resource
            resources = Resource.objects.all()
            resources_data = []
            for res in resources:
                # Get hostname using SSH credentials (reuse from save_resource)
                hostname = get_hostname(res.ip_address, res.username, res.password)
                resources_data.append({
                    'ip_address': res.ip_address,
                    'hostname': hostname or 'Unknown',  # Use 'Unknown' if hostname cannot be retrieved
                })
            return JsonResponse(resources_data, safe=False)
        except Exception as e:
            return JsonResponse({'message': f"Error fetching resources: {str(e)}"}, status=400)

@csrf_exempt
def delete_resource(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            ip = data.get('ip_address')

            if not ip:
                return JsonResponse({'message': 'IP address is required'}, status=400)

            resource = Resource.objects.filter(ip_address=ip).first()
            if resource:
                resource.delete()
                return JsonResponse({'message': 'Resource deleted successfully'})
            else:
                return JsonResponse({'message': 'Resource not found'}, status=404)
        except Exception as e:
            return JsonResponse({'message': f"Error deleting resource: {str(e)}"}, status=400)



@csrf_exempt
def plugins_handler(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get("name")
            script = data.get("roleConfig")

            if not name or not script:
                return JsonResponse({"error": "Missing name or script content"}, status=400)

            # Save to the 'allscripts' directory
            directory = "custom_plugins"
            os.makedirs(directory, exist_ok=True)

            # Ensure the filename has a .sh extension
            filename = f"{name}.sh"
            filepath = os.path.join(directory, filename)

            # Check if the file already exists to prevent overwriting
            if os.path.exists(filepath):
                return JsonResponse({"error": f"Script with name {name} already exists."}, status=400)

            # Write the script content to the file
            with open(filepath, "w") as file:
                file.write(script)

            return JsonResponse({"message": f"Script {filename} saved successfully."})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    elif request.method == 'GET':
        try:
            # Get the list of files in the allscripts directory
            files = os.listdir("custom_plugins")
            scripts = []

            for file in files:
                if file.endswith('.sh'):
                    filepath = os.path.join("custom_plugins", file)
                    # Read the content of the script (only first 100 characters for snippet)
                    with open(filepath, 'r') as f:
                        content = f.read()

                    # Create a script object with name and content snippet
                    script_info = {
                        "name": file,
                        "snippet": content[:100]  # Show only first 100 characters as snippet
                    }
                    scripts.append(script_info)

            return JsonResponse(scripts, safe=False)

        except Exception as e:
            return JsonResponse({'message': f"Error: {str(e)}"}, status=400)

    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def execute_plugin_view(request):
    if request.method == "POST":
        try:
            manager = PluginManager()
            manager.execute_plugin()  # This executes the plugin

            # Extracting raw result from the PluginManager
            screens = getattr(manager, 'screens', {})

            if not screens:
                return JsonResponse({"error": "No plugin output found."}, status=400)

            # Convert the screen data to a clean JSON structure for the frontend
            formatted_screens = {}
            for screen_name, data in screens.items():
                if data["columns"]:
                    formatted_screens[screen_name] = {
                        "type": "table",
                        "columns": data["columns"],
                        "rows": data["rows"],
                    }
                else:
                    formatted_screens[screen_name] = {
                        "type": "text",
                        "content": data["rows"]
                    }

            return JsonResponse({"screens": formatted_screens}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Only POST method is allowed."}, status=405)