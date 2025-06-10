from channels.generic.websocket import AsyncWebsocketConsumer
import json
import asyncio
from .plugin_manager import PluginManager  # your logic

class PluginLogConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)

        plugin_name = data.get("script_name")
        ip = data.get("resource_ip")
        username = data.get("username")
        password = data.get("password")

        plugin_manager = PluginManager()

        async for line in plugin_manager.execute_plugin_with_streaming(
            plugin_name=plugin_name[:-3],
            host=ip,
            username=username,
            password=password
        ):
            await self.send(text_data=json.dumps({"log": line}))

        await self.send(text_data=json.dumps({"done": True}))
