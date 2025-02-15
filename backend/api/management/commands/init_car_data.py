# api/management/commands/init_car_data.py
from django.core.management.base import BaseCommand
from api.models import CarMake, CarModel

class Command(BaseCommand):
    help = 'Initialize car makes and models'

    def handle(self, *args, **kwargs):
        # Dictionary of makes and their models
        car_data = {
            'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'R8', 'RS6', 'Q8', 'RS7', 'Q2', 'S3', 'S4', 'S5', 'S6', 'S8'],
            'BMW': ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', 'X1', 'X3', 'X5', 'M3', 'M5', 'M8', 'X6', 'X7'],
            'Mercedes': ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'G-Class', 'GLA', 'GLC', 'GLE', 'AMG GT', 'CLA', 'EQB', 'EQC', 'GLS', 'SLC'],
            'Volkswagen': ['Golf', 'Polo', 'Passat', 'Tiguan', 'T-Roc', 'Touareg', 'ID.3', 'ID.4', 'Arteon', 'Up!', 'Jetta', 'Beetle'],
            'Toyota': ['Corolla', 'Camry', 'RAV4', 'Yaris', 'C-HR', 'Prius', 'Land Cruiser', 'Supra', 'Hilux', 'Avalon', 'Sienna'],
            'Honda': ['Civic', 'Accord', 'CR-V', 'HR-V', 'Jazz', 'NSX', 'e', 'Pilot', 'Ridgeline', 'Insight'],
            'Ford': ['Fiesta', 'Focus', 'Mustang', 'Kuga', 'Puma', 'Explorer', 'Ranger', 'Edge', 'Mondeo', 'F-150'],
            'Porsche': ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', '718 Cayman', '718 Boxster', '911 Turbo', '911 GT3'],
            'Land Rover': ['Discovery', 'Defender', 'Range Rover', 'Range Rover Sport', 'Evoque', 'Velar'],
            'Smart': ['ForTwo', 'ForFour', 'EQ ForTwo'],
            'Chevrolet': ['Cruze', 'Malibu', 'Impala', 'Tahoe', 'Traverse', 'Bolt', 'Silverado', 'Equinox', 'Camaro'],
            'Nissan': ['Altima', 'Maxima', '370Z', 'GT-R', 'Sentra', 'Juke', 'Rogue', 'Murano', 'Pathfinder', 'Titan'],
            'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Kona', 'Palisade', 'Ioniq', 'Veloster', 'Kona Electric'],
            'Kia': ['Seltos', 'Sportage', 'Sorento', 'Optima', 'Forte', 'Telluride', 'Niro', 'Stinger'],
            'Tesla': ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck'],
            'Opel': ['Astra', 'Corsa', 'Mokka', 'Grandland', 'Insignia', 'Zafira'],
            'Renault': ['Clio', 'Captur', 'Megane', 'Kadjar', 'Talisman', 'Koleos', 'Zoe'],
            'Mitsubishi': ['Outlander', 'Lancer', 'Eclipse Cross', 'ASX', 'Pajero', 'Mirage'],
            'Peugeot': ['208', '308', '3008', '5008', '508', 'Partner'],
            'Suzuki': ['Swift', 'Vitara', 'Ignis', 'S-Cross', 'Jimny'],
            'Citroën': ['C3', 'C4', 'C5', 'Berlingo', 'Cactus', 'DS3', 'DS4'],
            'Cadillac': ['CTS', 'Escalade', 'XT5', 'ATS', 'XTS'],
            'Jaguar': ['XE', 'XF', 'F-Type', 'F-Pace', 'I-Pace'],
            'Volvo': ['S60', 'S90', 'V60', 'XC40', 'XC60', 'XC90', 'V90'],
            'Lexus': ['IS', 'ES', 'GS', 'LS', 'RX', 'NX', 'UX', 'LX', 'LC'],
            'Fiat': ['500', 'Panda', 'Tipo', '500X', '500L'],
            'Jeep': ['Cherokee', 'Grand Cherokee', 'Wrangler', 'Renegade', 'Compass', 'Gladiator']
        }

        for make_name, models in car_data.items():
            make, _ = CarMake.objects.get_or_create(name=make_name)
            self.stdout.write(f'Created make: {make_name}')
            
            for model_name in models:
                CarModel.objects.get_or_create(
                    make=make,
                    name=model_name
                )
                self.stdout.write(f'Created model: {model_name} for {make_name}')