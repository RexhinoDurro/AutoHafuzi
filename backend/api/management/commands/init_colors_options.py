# api/management/commands/init_colors_options.py
from django.core.management.base import BaseCommand
from api.models import ExteriorColor, InteriorColor, Upholstery, Option, OptionCategory

class Command(BaseCommand):
    help = 'Initialize car colors, upholstery types, and options in Albanian language'

    def handle(self, *args, **kwargs):
        # Initialize exterior colors
        exterior_colors = [
            {'name': 'E bardhë', 'hex_code': '#FFFFFF'},
            {'name': 'E zezë', 'hex_code': '#000000'},
            {'name': 'E kuqe', 'hex_code': '#FF0000'},
            {'name': 'E kaltër', 'hex_code': '#0000FF'},
            {'name': 'E gjelbër', 'hex_code': '#008000'},
            {'name': 'E hirtë', 'hex_code': '#808080'},
            {'name': 'E argjendtë', 'hex_code': '#C0C0C0'},
            {'name': 'Ngjyrë ari', 'hex_code': '#FFD700'},
            {'name': 'Kafe', 'hex_code': '#964B00'},
            {'name': 'Portokalli', 'hex_code': '#FFA500'},
            {'name': 'Vjollcë', 'hex_code': '#800080'},
            {'name': 'Rozë', 'hex_code': '#FFC0CB'},
            {'name': 'Bezhë', 'hex_code': '#F5F5DC'},
            {'name': 'Blu e errët', 'hex_code': '#00008B'},
            {'name': 'Blu marine', 'hex_code': '#000080'},
            {'name': 'E verdhë', 'hex_code': '#FFFF00'},
        ]
        
        # Initialize interior colors
        interior_colors = [
            {'name': 'E zezë', 'hex_code': '#000000'},
            {'name': 'E bardhë', 'hex_code': '#FFFFFF'},
            {'name': 'Bezhë', 'hex_code': '#F5F5DC'},
            {'name': 'Gri', 'hex_code': '#808080'},
            {'name': 'Kafe', 'hex_code': '#964B00'},
            {'name': 'E kuqe', 'hex_code': '#FF0000'},
            {'name': 'Krem', 'hex_code': '#FFFDD0'},
            {'name': 'Blu e errët', 'hex_code': '#00008B'},
            {'name': 'Bordë', 'hex_code': '#800020'},
        ]
        
        # Initialize upholstery types
        upholstery_types = [
            'Lëkurë',
            'Lëkurë artificiale',
            'Pëlhurë',
            'Lëkurë & pëlhurë',
            'Alcantara',
            'Velur',
            'Vinilike',
            'Lëkurë Nappa',
            'Lëkurë Dakota',
            'Eko-lëkurë',
        ]
        
        # Initialize options by category
        options = {
            'COMFORT': [
                'Klimë automatike',
                'Ulëse të ngrohta',
                'Ulëse elektrike',
                'Dritare elektrike',
                'Timon i ngrohtë',
                'Çelësa pa çelës',
                'Sensorë parkimi',
                'Kamera parkimi',
                'Asistent parkimi',
                'Ndezje automatike e dritave',
                'Fshirëse automatike',
                'Pasqyra elektrike',
                'Pasqyra me ngrohje',
                'Panoramë',
                'Xhama elektrikë pas',
                'Konditioner',
                'Tempomat',
                'Tempomat adaptiv',
                'Mbyllje qendrore',
            ],
            'ENTERTAINMENT': [
                'Radio',
                'CD Player',
                'USB',
                'Bluetooth',
                'Sistem navigimi',
                'Ekran prekës',
                'Sistem zëri premium',
                'Lidhje smartphone',
                'Apple CarPlay',
                'Android Auto',
                'Kabinë virtuale dixhitale',
                'Ekran Head-up',
                'Ndërfaqe zëri',
                'TV',
                'DVD Player',
                'Wi-Fi',
            ],
            'SAFETY': [
                'ABS',
                'ESP',
                'Sistemi i frenimit emergjent',
                'Asistent i mbajtjes së korsisë',
                'Airbag',
                'Airbag anësor',
                'Airbag i kurtinës',
                'Sistem alarmi',
                'Sistem monitorimi i presionit të gomave',
                'Kontroll qëndrueshmërie',
                'Asistent për nisje në pjerrësi',
                'Dritat e mjegullës',
                'Dritat LED',
                'Dritat Xenon',
                'Dritat Matrix LED',
                'Sistemi i mbrojtjes nga përplasja',
                'Monitorim i pikës së vdekur',
                'Njohje e shenjave të trafikut',
            ],
            'EXTRAS': [
                'Rimorkio',
                'Bagazhier çatie',
                'Shina çatie',
                'Mbajtëse biçikletash',
                'Sedilje për fëmijë',
                'Kuti frigoriferike',
                'Shtroja tapeti',
                'Mbrojtëse dielli',
                'Sensorë shiu',
                'Sistem sportiv shkarje',
                'Amortizatorë sportivë',
                'Mbrojtëse parakolpi',
                'Fellne alumini',
                'Deflektorë dritaresh',
                'Timon multifunksional',
                'Start/Stop automatik',
                'Çengel rimorkimi i lëvizshëm',
            ],
        }
        
        # Create exterior colors
        for color in exterior_colors:
            ExteriorColor.objects.get_or_create(
                name=color['name'],
                defaults={'hex_code': color['hex_code']}
            )
            self.stdout.write(f"Created exterior color: {color['name']}")
        
        # Create interior colors
        for color in interior_colors:
            InteriorColor.objects.get_or_create(
                name=color['name'],
                defaults={'hex_code': color['hex_code']}
            )
            self.stdout.write(f"Created interior color: {color['name']}")
        
        # Create upholstery types
        for upholstery in upholstery_types:
            Upholstery.objects.get_or_create(name=upholstery)
            self.stdout.write(f"Created upholstery type: {upholstery}")
        
        # Create options
        for category, option_list in options.items():
            for option_name in option_list:
                Option.objects.get_or_create(
                    name=option_name,
                    defaults={'category': category}
                )
                self.stdout.write(f"Created option [{category}]: {option_name}")
                
        self.stdout.write(self.style.SUCCESS('Successfully initialized colors and options data')) 
        # test