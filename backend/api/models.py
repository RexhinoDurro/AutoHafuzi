# models.py
from django.db import models
from django.contrib.auth.models import User

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

class ExteriorColor(models.Model):
    name = models.CharField(max_length=100, unique=True)
    hex_code = models.CharField(max_length=7, default="#000000")  # Store color hex codes

    def __str__(self):
        return self.name

class InteriorColor(models.Model):
    name = models.CharField(max_length=100)
    upholstery = models.CharField(max_length=100)  # e.g., Leather, Alcantara, Cloth
    hex_code = models.CharField(max_length=7, default="#000000")  # Store color hex codes

    class Meta:
        unique_together = ['name', 'upholstery']

    def __str__(self):
        return f"{self.name} {self.upholstery}"

class OptionCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name

class Option(models.Model):
    CATEGORY_CHOICES = [
        ('COMFORT', 'Comfort & Convenience'),
        ('ENTERTAINMENT', 'Entertainment & Media'),
        ('SAFETY', 'Safety & Security'),
        ('EXTRAS', 'Extras'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='EXTRAS')

    def __str__(self):
        return self.name

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
    variant = models.ForeignKey(CarVariant, on_delete=models.CASCADE, null=True, blank=True)
    first_registration_day = models.IntegerField(null=True, blank=True)
    first_registration_month = models.IntegerField(null=True, blank=True)
    first_registration_year = models.IntegerField(null=True, blank=True)
    # Replace single color field with exterior and interior color references
    exterior_color = models.ForeignKey(ExteriorColor, on_delete=models.SET_NULL, null=True, blank=True)
    interior_color = models.ForeignKey(InteriorColor, on_delete=models.SET_NULL, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discussed_price = models.BooleanField(default=False) 
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    view_count = models.IntegerField(default=0)  # Track total views

    # Car specifications
    body_type = models.CharField(max_length=50, default="Sedan")
    is_used = models.BooleanField(default=True)
    drivetrain = models.CharField(max_length=50, default="FWD")
    seats = models.IntegerField(default=5)
    doors = models.IntegerField(default=4)
    mileage = models.IntegerField(default=0)
    first_registration = models.DateField(null=True, blank=True)
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
    options = models.ManyToManyField(Option, blank=True)
    
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

class CarView(models.Model):
    """Track unique views for cars by storing visitor sessions"""
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='views')
    session_id = models.CharField(max_length=40)  # Store the session ID
    ip_address = models.GenericIPAddressField(null=True, blank=True)  # Optional: store IP for analytics
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['car', 'session_id']  # Ensure each session only counts once per car
        ordering = ['-viewed_at']
    
    def __str__(self):
        return f"View of {self.car} by session {self.session_id[:8]}..."

class SiteVisit(models.Model):
    """Track website traffic/visits"""
    session_id = models.CharField(max_length=40)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    referrer = models.URLField(blank=True, null=True)
    path = models.CharField(max_length=255)
    visited_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-visited_at']
        
    def __str__(self):
        return f"Visit to {self.path} at {self.visited_at}"
    
class ContactMessage(models.Model):
    """
    Model for storing contact form submissions
    """
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.subject} - {self.name}"