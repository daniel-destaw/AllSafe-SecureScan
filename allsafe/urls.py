from django.contrib import admin
from django.urls import path
from .views import (
    index, plugins_handler, resource_dashboard, management, resource, users,
    save_resource, get_resources, delete_resource,plugin_result
)
from allsafe import views

urlpatterns = [
    path('', index, name='home'),
    path('resource_dashboard/', resource_dashboard, name='resource_dashboard'),
    path('management/', management, name='management'),
    path('resource/resource', resource, name='resource'),
    path('users/users', users, name='users'),
    path('admin/', admin.site.urls),
    path('api/plugins/', plugins_handler),    

    # Resource API endpoints
    path('api/resources/', save_resource, name='save_resource'),
    path('api/resources/list/', get_resources, name='get_resources'),
    path('api/resources/delete/', delete_resource, name='delete_resource'),
    path('api/scan/', plugin_result, name='plugin_result'),
   
    

    # Compliance API endpoints
]
