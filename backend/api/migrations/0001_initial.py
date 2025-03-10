# Generated by Django 5.1.6 on 2025-03-03 09:37

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Car',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.IntegerField()),
                ('color', models.CharField(default='Black', max_length=50)),
                ('price', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('description', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('body_type', models.CharField(default='Sedan', max_length=50)),
                ('is_used', models.BooleanField(default=True)),
                ('drivetrain', models.CharField(default='FWD', max_length=50)),
                ('seats', models.IntegerField(default=5)),
                ('doors', models.IntegerField(default=4)),
                ('mileage', models.IntegerField(default=0)),
                ('first_registration', models.DateField(blank=True, null=True)),
                ('general_inspection_date', models.DateField(blank=True, null=True)),
                ('full_service_history', models.BooleanField(default=False)),
                ('customs_paid', models.BooleanField(default=False)),
                ('power', models.IntegerField(default=100)),
                ('gearbox', models.CharField(default='Manual', max_length=50)),
                ('engine_size', models.DecimalField(decimal_places=1, default=1.6, max_digits=4)),
                ('gears', models.IntegerField(default=5)),
                ('cylinders', models.IntegerField(default=4)),
                ('weight', models.IntegerField(default=1200)),
                ('emission_class', models.CharField(default='Euro 6', max_length=50)),
                ('fuel_type', models.CharField(default='Petrol', max_length=50)),
                ('options', models.JSONField(default=list)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='CarMake',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='CarImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(default='default.jpg', upload_to='car_images/')),
                ('is_primary', models.BooleanField(default=False)),
                ('order', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('car', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='api.car')),
            ],
            options={
                'ordering': ['order', 'created_at'],
            },
        ),
        migrations.AddField(
            model_name='car',
            name='make',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.carmake'),
        ),
        migrations.CreateModel(
            name='CarModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('make', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='models', to='api.carmake')),
            ],
            options={
                'unique_together': {('make', 'name')},
            },
        ),
        migrations.AddField(
            model_name='car',
            name='model',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.carmodel'),
        ),
        migrations.CreateModel(
            name='CarVariant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('model', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='variants', to='api.carmodel')),
            ],
            options={
                'unique_together': {('model', 'name')},
            },
        ),
        migrations.AddField(
            model_name='car',
            name='variant',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.carvariant'),
        ),
    ]
