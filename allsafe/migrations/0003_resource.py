# Generated by Django 4.2.2 on 2025-04-12 23:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('allsafe', '0002_windowsos_windows_type'),
    ]

    operations = [
        migrations.CreateModel(
            name='Resource',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ip_address', models.GenericIPAddressField()),
                ('username', models.CharField(max_length=100)),
                ('password', models.CharField(max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
