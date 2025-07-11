# Generated by Django 5.1.7 on 2025-05-26 07:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='userdiscount',
            name='price_data',
            field=models.JSONField(blank=True, default=dict, help_text='JSON structure containing all category and product prices', null=True),
        ),
        migrations.AlterField(
            model_name='userdiscount',
            name='discount_data',
            field=models.JSONField(blank=True, default=dict, help_text='JSON structure containing all category and product discounts', null=True),
        ),
    ]
