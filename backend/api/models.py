# models.py
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
    
class CarVariant(models.Model):
    model = models.ForeignKey(CarModel, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = ['model', 'name']

    def __str__(self):
        return f"{self.model.make.name} {self.model.name} {self.name}"

class CarImage(models.Model):
    car = models.ForeignKey('Car', related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='car_images/', default='default.jpg')
    is_primary = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"Image for {self.car} ({'primary' if self.is_primary else 'secondary'})"

class Car(models.Model):
    make = models.ForeignKey(CarMake, on_delete=models.CASCADE)
    model = models.ForeignKey(CarModel, on_delete=models.CASCADE)
    year = models.IntegerField()
    color = models.CharField(max_length=50, default="Black")
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Car specifications
    body_type = models.CharField(max_length=50, default="Sedan")
    is_used = models.BooleanField(default=True)
    drivetrain = models.CharField(max_length=50, default="FWD")
    seats = models.IntegerField(default=5)
    doors = models.IntegerField(default=4)
    mileage = models.IntegerField(default=0)
    first_registration = models.DateField(null=True, blank=True)
    general_inspection_date = models.DateField(null=True, blank=True)
    full_service_history = models.BooleanField(default=False)
    customs_paid = models.BooleanField(default=False)
    power = models.IntegerField(default=100)  # in HP
    gearbox = models.CharField(max_length=50, default="Manual")
    engine_size = models.DecimalField(max_digits=4, decimal_places=1, default=1.6)
    gears = models.IntegerField(default=5)
    cylinders = models.IntegerField(default=4)
    weight = models.IntegerField(default=1200)  # in kg
    emission_class = models.CharField(max_length=50, default="Euro 6")
    fuel_type = models.CharField(max_length=50, default="Petrol")
    options = models.JSONField(default=list)
    
    class Meta:
        ordering = ['-created_at']
        
    @property
    def primary_image(self):
        """Get the primary image or None if no images exist"""
        return self.images.filter(is_primary=True).first()

    def set_primary_image(self, image_id):
        """Set a new primary image"""
        self.images.filter(is_primary=True).update(is_primary=False)
        image = self.images.get(id=image_id)
        image.is_primary = True
        image.save()

    def __str__(self):
        return f"{self.make.name} {self.model.name} ({self.year})"
    
    