# Generated by Django 5.1.7 on 2025-03-31 05:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0004_pipe'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='item',
            name='category',
        ),
        migrations.RemoveField(
            model_name='subitem',
            name='item',
        ),
        migrations.RemoveField(
            model_name='watertank',
            name='sub_item',
        ),
        migrations.DeleteModel(
            name='Category',
        ),
        migrations.DeleteModel(
            name='Item',
        ),
        migrations.DeleteModel(
            name='SubItem',
        ),
        migrations.DeleteModel(
            name='Watertank',
        ),
    ]
