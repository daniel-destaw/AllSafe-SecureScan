# Generated by Django 4.2.2 on 2025-03-31 17:30

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='WindowsOS',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ip_address', models.CharField(max_length=15)),
                ('username', models.CharField(max_length=255)),
                ('password', models.CharField(max_length=255)),
                ('department', models.CharField(max_length=255)),
                ('owner_name', models.CharField(max_length=255)),
                ('phone_number', models.CharField(max_length=15)),
            ],
        ),
    ]
