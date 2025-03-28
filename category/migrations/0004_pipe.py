# Generated by Django 5.1.7 on 2025-03-28 13:29

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0003_watertank'),
    ]

    operations = [
        migrations.CreateModel(
            name='Pipe',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('image', models.CharField(blank=True, max_length=255, null=True)),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='sub_categories', to='category.pipe')),
            ],
            options={
                'verbose_name_plural': 'Pipes',
            },
        ),
    ]
