# Generated by Django 4.2.2 on 2025-04-13 01:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('allsafe', '0003_resource'),
    ]

    operations = [
        migrations.DeleteModel(
            name='WindowsOS',
        ),
        migrations.RemoveField(
            model_name='resource',
            name='created_at',
        ),
        migrations.AddField(
            model_name='resource',
            name='hostname',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='resource',
            name='ip_address',
            field=models.CharField(max_length=255),
        ),
        migrations.AlterField(
            model_name='resource',
            name='password',
            field=models.CharField(max_length=255),
        ),
        migrations.AlterField(
            model_name='resource',
            name='username',
            field=models.CharField(max_length=255),
        ),
    ]
