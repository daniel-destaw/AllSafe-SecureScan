from django.db import models

class Resource(models.Model):
    ip_address = models.CharField(max_length=255)
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    hostname = models.CharField(max_length=255, null=True, blank=True)  # Add the hostname field

    def __str__(self):
        return f'{self.ip_address} - {self.hostname}'

class Compliance(models.Model):
    # You can adjust the fields to better reflect your compliance data.
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    role_config = models.TextField()  # To store configuration or commands
    
    def __str__(self):
        return self.name
