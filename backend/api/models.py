# api/models.py
from django.db import models

class CarMake(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name

class CarModel(models.Model):
    make = models.ForeignKey(CarMake, on_delete=models.CASCADE, related_name='models')
    name = models.CharField(max_length=100)
    
    class Meta:
        unique_together = ['make', 'name']
    
    def __str__(self):
        return f"{self.make.name} {self.name}"

class Car(models.Model):
    make = models.ForeignKey(CarMake, on_delete=models.CASCADE)
    model = models.ForeignKey(CarModel, on_delete=models.CASCADE)
    year = models.IntegerField()
    color = models.CharField(max_length=50, default="Black")
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='car_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.make.name} {self.model.name} ({self.year})"