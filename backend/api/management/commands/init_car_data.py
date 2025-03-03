
# api/management/commands/init_car_data.py
from django.core.management.base import BaseCommand
from api.models import CarMake, CarModel, CarVariant

class Command(BaseCommand):
    help = 'Initialize detailed car makand modeincluding specific variants'

    def handle(self, *args, **kwargs):
        # Dictionary with detailed model variants
        car_data= {
            'Audi': {
                'A1': ['1.0 TFSI', '1.4 TFSI', '1.6 TDI', '2.0 TFSI', 'Sportback', 'S1'],
                'A3': ['1.0 TFSI', '1.4 TFSI', '1.5 TFSI', '1.6 TDI', '1.8 TFSI', '2.0 TDI', '2.0 TFSI', 'S3', 'RS3'],
                'A4': ['1.8T', '2.0T', '2.0 TDI', '3.0', '3.0 TDI', '3.2', 'S4', 'RS4'],
                'A5': ['1.8 TFSI', '2.0 TFSI', '2.0 TDI', '3.0 TFSI', '3.0 TDI', 'S5', 'RS5'],
                'A6': ['1.8T', '2.0T', '2.0 TDI', '2.7T', '2.7 TDI', '3.0', '3.0 TDI', '4.2', 'S6', 'RS6'],
                'A7': ['2.0 TFSI', '3.0 TFSI', '3.0 TDI', 'S7', 'RS7'],
                'A8': ['2.8', '3.0', '3.0 TDI', '3.2', '3.7', '4.0 TDI', '4.2', '4.2 TDI', '6.0 W12', 'S8'],
                'Q2': ['1.0 TFSI', 'Q2 1.4 TFSI', 'Q2 1.6 TDI', 'Q2 2.0 TDI', 'SQ2'],
                'Q3': ['1.4 TFSI', '2.0 TFSI', '2.0 TDI', 'RS Q3'],
                'Q5': ['2.0 TFSI', '2.0 TDI', '3.0 TFSI', '3.0 TDI', 'SQ5'],
                'Q7': ['3.0 TFSI', '3.0 TDI', '4.2 FSI', '4.2 TDI', 'SQ7'],
                'Q8': ['3.0 TFSI', '3.0 TDI', '4.0 TFSI', 'SQ8', 'RS Q8'],
                'R8': ['4.2 FSI', '5.2 FSI', 'GT', 'Spyder'],
                'TT': ['1.8 TFSI', '2.0 TFSI', '2.0 TDI', 'TTS', 'RS']
            },
            'BMW': {
                '1 Series': ['114i', '116i', '118i', '120i', '125i', '128i', '116d', '118d', '120d', '123d', 'M135i', 'M140i'],
                '2 Series': ['218i', '220i', '228i', '230i', '218d', '220d', '225d', 'M235i', 'M240i', 'M2', 'M2 Competition'],
                '3 Series': ['316i', '318i', '318d', '320i', '320d', '323i', '325i', '325d', '328i', '330i', '330d', '335i', '335d', 'M340i', 'M3'],
                '4 Series': ['418i', '420i', '428i', '430i', '435i', '440i', '418d', '420d', '425d', '430d', '435d', 'M4'],
                '5 Series': ['518i', '520i', '520d', '523i', '525i', '525d', '528i', '530i', '530d', '535i', '535d', '540i', '545i', '550i', 'M550i', 'M5'],
                '6 Series': ['630i', '635i', '640i', '650i', '635d', '640d', 'M6'],
                '7 Series': ['725d', '728i', '730i', '730d', '735i', '735d', '740i', '740d', '745i', '745e', '750i', '760i', 'M760i'],
                '8 Series': ['840i', '840d', 'M850i', 'M8'],
                'X1': ['18i', '20i', '25i', '28i', '18d', '20d', '25d'],
                'X3': ['18d', '20i', '20d', '30i', '30d', 'M40i', 'M40d', 'M'],
                'X5': ['25d', '30d', '35i', '40i', '40d', '45e', '50i', 'M50d', 'M'],
                'X6': ['30d', '35i', '40i', '40d', '50i', 'M50d', 'M'],
                'X7': ['30d', '40i', '40d', '50i', 'M50d', 'M50i'],
                'Z4': ['20i', '30i', '35i', 'M40i']
            },
            'Mercedes': {
                'A-Class': ['A140', 'A150', 'A160', 'A170', 'A180', 'A200', 'A220', 'A250', 'A35 AMG', 'A45 AMG'],
                'B-Class': ['B150', 'B160', 'B170', 'B180', 'B200', 'B220', 'B250', 'B Drive'],
                'C-Class': ['C160', 'C180', 'C200', 'C220', 'C230', 'C240', 'C250', 'C280', 'C300', 'C320', 'C350', 'C400', 'C43 AMG', 'C55 AMG', 'C63 AMG'],
                'E-Class': ['E200', 'E220', 'E230', 'E240', 'E250', 'E280', 'E300', 'E320', 'E350', 'E400', 'E420', 'E430', 'E450', 'E500', 'E53 AMG', 'E55 AMG', 'E63 AMG'],
                'S-Class': ['S280', 'S320', 'S350', 'S400', 'S430', 'S450', 'S500', 'S550', 'S560', 'S580', 'S600', 'S63 AMG', 'S65 AMG', 'S680'],
                'G-Class': ['G350', 'G400', 'G500', 'G550', 'G55 AMG', 'G63 AMG', 'G65 AMG'],
                'GLA': ['180', '200', '220', '250', '35 AMG', '45 AMG'],
                'GLC': ['200', '220', '250', '300', '350', '43 AMG', '63 AMG'],
                'GLE': ['300', '350', '400', '450', '500', '53 AMG', '63 AMG'],
                'GLS': ['350', '400', '450', '500', '580', '600 Maybach', '63 AMG'],
                'CLA': ['180', '200', '220', '250', '35 AMG', '45 AMG'],
                'CLS': ['250', '300', '350', '400', '450', '500', '53 AMG', '55 AMG', '63 AMG'],
                'SLC': ['180', '200', '300', '43 AMG'],
                'SL': ['350', '400', '500', '55 AMG', '63 AMG', '65 AMG'],
                'GT': ['AMG GT', 'AMG GT S', 'AMG GT C', 'AMG GT R', 'AMG GT Black Series'],
                'EQB': ['250', '300', '350'],
                'EQC': ['400']
            },
            'Volkswagen': {
                'Golf': ['1.0 TSI', '1.4 TSI', '1.5 TSI', '1.6 TDI', '2.0 TDI', '2.0 TSI', 'GTI', 'R', 'GTE', 'e-Golf'],
                'Polo': ['1.0', '1.0 TSI', '1.2 TSI', '1.4 TDI', '1.5 TSI', '1.6 TDI', 'GTI'],
                'Passat': ['1.4 TSI', '1.5 TSI', '1.6 TDI', '1.8 TSI', '2.0 TDI', '2.0 TSI', 'GTE'],
                'Tiguan': ['1.4 TSI', '1.5 TSI', '2.0 TDI', '2.0 TSI', 'R'],
                'T-Roc': ['T-Roc 1.0 TSI', '1.5 TSI', 'T-Roc 2.0 TDI', 'T-Roc 2.0 TSI', 'T-Roc R'],
                'Touareg': ['3.0 TDI', '3.0 TFSI', '4.0 TDI', 'R'],
                'ID.3': ['Pure', 'Pro', 'Pro S', 'Pro Performance', 'Tour'],
                'ID.4': ['Pure', 'Pro', 'GTX', 'Pro Performance'],
                'Arteon': ['1.5 TSI', '2.0 TDI', '2.0 TSI', 'R'],
                'Up!': ['1.0', 'e-Up!', 'GTI'],
                'Jetta': ['1.0 TSI', '1.4 TSI', '1.5 TSI', '1.6 TDI', '2.0 TDI', 'GLI'],
                'Beetle': ['1.2 TSI', '1.4 TSI', '1.6 TDI', '2.0 TSI', '2.0 TDI', 'Dune']
            },
            'Toyota': {
                'Corolla': ['1.2T', '1.6', '1.8', '2.0', 'Hybrid'],
                'Camry': ['2.0', '2.5', '3.5', 'Hybrid'],
                'RAV4': ['2.0', '2.5', 'Hybrid', 'Prime'],
                'Yaris': ['1.0', '1.5', 'Hybrid', 'GR'],
                'C-HR': ['1.2T', '1.8 Hybrid', '2.0 Hybrid'],
                'Prius': ['1.8 Hybrid', 'Plug-in', 'Prius+'],
                'Land Cruiser': ['2.8D', '3.0D', '4.0', '4.5D', '5.7'],
                'Supra': ['2.0', '3.0', 'GR'],
                'Hilux': ['2.4D', '2.8D', '4.0'],
                'Avalon': ['2.5', '3.5', 'Hybrid'],
                'Sienna': ['2.5', '3.5', 'Hybrid']
            },
            'Honda': {
                'Civic': ['1.0T', '1.5T', '1.6i-DTEC', '2.0T Type R', 'Hybrid'],
                'Accord': ['1.5T', '2.0T', '2.0 Hybrid', '2.4', '3.5'],
                'CR-V': ['1.5T', '1.6 i-DTEC', '2.0', '2.0 Hybrid', '2.4'],
                'HR-V': ['1.5', '1.5T', '1.6 i-DTEC', 'Hybrid'],
                'Jazz': ['1.2', '1.3', '1.4', '1.5', 'Hybrid'],
                'NSX': ['3.5 V6 Hybrid'],
                'e': ['Honda e Advance'],
                'Pilot': ['3.5'],
                'Ridgeline': ['3.5'],
                'Insight': ['Hybrid']
            },
            'Ford': {
                'Fiesta': ['1.0 EcoBoost', '1.1', '1.5 TDCi', 'ST'],
                'Focus': ['1.0 EcoBoost', '1.5 EcoBoost', '1.5 TDCi', '2.0 EcoBoost', '2.3 EcoBoost ST', 'RS'],
                'Mustang': ['2.3 EcoBoost', '5.0 V8 GT', 'Mach-E', 'Shelby GT350', 'Shelby GT500'],
                'Kuga': ['1.5 EcoBoost', '1.5 TDCi', '2.0 TDCi', 'PHEV'],
                'Puma': ['1.0 EcoBoost', '1.0 EcoBoost mHEV', 'ST'],
                'Explorer': ['3.0 EcoBoost', '3.3 Hybrid', 'ST'],
                'Ranger': ['2.0 EcoBlue', '2.3 EcoBoost', '3.2 TDCi', 'Raptor'],
                'Edge': ['2.0 TDCi', '2.7 EcoBoost', 'ST'],
                'Mondeo': ['1.5 EcoBoost', '2.0 EcoBoost', '2.0 TDCi', 'Hybrid'],
                'F-150': ['2.7 EcoBoost', '3.3', '3.5 EcoBoost', '5.0', 'Raptor', 'Lightning']
            },
            'Porsche': {
                '911': ['Carrera', 'Carrera S', 'Carrera 4', 'Carrera 4S', 'Targa', 'Targa 4S', 'GTS', 'Turbo', 'Turbo S', 'GT3', 'GT3 RS', 'GT2 RS'],
                'Cayenne': ['S', 'GTS', 'Turbo', 'Turbo S', 'E-Hybrid'],
                'Macan': ['S', 'GTS', 'Turbo'],
                'Panamera': ['4', '4S', 'GTS', 'Turbo', 'Turbo S', '4 E-Hybrid'],
                'Taycan': ['4S', 'Turbo', 'Turbo S', 'GTS'],
                '718 Cayman': ['S', 'GTS', 'GT4'],
                '718 Boxster': ['S', 'GTS', 'Spyder']
            },
            'Land Rover': {
                'Discovery': ['2.0 Si4', '3.0 SDV6', '3.0 Si6', 'Sport'],
                'Defender': ['90', '110', '130', 'P300', 'P400'],
                'Range Rover': ['3.0 D300', '3.0 P400', '4.4 SDV8', '5.0 V8', 'PHEV'],
                'Sport': ['2.0 P300', '3.0 SDV6', '3.0 P400', '5.0 V8', 'SVR'],
                'Evoque': ['2.0 D150', '2.0 D180', '2.0 P200', '2.0 P250', 'PHEV'],
                'Velar': ['2.0 D180', '2.0 P250', '3.0 D300', '3.0 P400', 'SVAutobiography']
            },
            'Smart': {
                'ForTwo': ['0.9 Turbo', '1.0', 'Brabus'],
                'ForFour': ['0.9 Turbo', '1.0', 'Brabus'],
                'ForTwo': ['Premium', 'Pulse', 'Prime']
            },
            'Chevrolet': {
                'Cruze': ['1.4T', '1.6', '1.8', '2.0D'],
                'Malibu': ['1.5T', '2.0T', 'Hybrid'],
                'Impala': ['2.5', '3.6'],
                'Tahoe': ['5.3', '6.2', 'RST'],
                'Traverse': ['2.0T', '3.6'],
                'Bolt': ['EV', 'EUV'],
                'Silverado': ['2.7T', '4.3', '5.3', '6.2', 'Duramax'],
                'Equinox': ['1.5T', '2.0T', '1.6D'],
                'Camaro': ['2.0T', '3.6', 'SS 6.2', 'ZL1 6.2']
            },
            'Nissan': {
                'Altima': ['2.0', '2.5', 'SR'],
                'Maxima': ['3.5', 'SR', 'Platinum'],
                '370Z': ['3.7', 'Nismo'],
                'GT-R': ['Premium', 'Track Edition', 'Nismo'],
                'Sentra': ['1.6', '1.8', '2.0', 'SR Turbo'],
                'Juke': ['1.0 DIG-T', '1.5 dCi', '1.6 DIG-T', 'Nismo RS'],
                'Rogue': ['2.0', '2.5', 'Sport', 'Hybrid'],
                'Murano': ['2.5 dCi', '3.5'],
                'Pathfinder': ['2.5 dCi', '3.5'],
                'Titan': ['5.6', 'XD 5.0 Cummins']
            },
            'Hyundai': {
                'Elantra': ['1.6', '2.0', 'Hybrid', 'N Line', 'N'],
                'Sonata': ['1.6T', '2.0T', '2.5', 'Hybrid', 'N Line'],
                'Tucson': ['1.6T', '2.0', '2.0 CRDi', 'Hybrid', 'PHEV'],
                'Fe': ['2.0T', '2.2 CRDi', '2.5', 'Hybrid', 'PHEV'],
                'Kona': ['1.0T', '1.6T', '2.0', 'Hybrid', 'N'],
                'Palisade': ['2.2 CRDi', '3.8'],
                'Ioniq': ['Hybrid', 'Plug-in Hybrid', 'Electric'],
                'Veloster': ['1.6T', 'N'],
                'Electric': ['39kWh', '64kWh']
            },
            'Kia': {
                'Seltos': ['1.6T', '2.0'],
                'Sportage': ['1.6T', '1.6 CRDi', '2.0', '2.0 CRDi', 'Hybrid'],
                'Sorento': ['2.2 CRDi', '2.5', '2.5T', 'Hybrid', 'PHEV'],
                'Optima': ['1.6T', '2.0T', '2.4', 'Hybrid', 'PHEV'],
                'Forte': ['1.6', '2.0', 'GT 1.6T'],
                'Telluride': ['3.8'],
                'Niro': ['Hybrid', 'Plug-in Hybrid', 'EV'],
                'Stinger': ['2.0T', '2.5T', '3.3T']
            },
            'Tesla': {
                'Model S': ['Long Range', 'Plaid'],
                'Model 3': ['Standard Range Plus', 'Long Range', 'Performance'],
                'Model X': ['Long Range', 'Plaid'],
                'Model Y': ['Long Range', 'Performance'],
                'Cybertruck': ['Single Motor', 'Dual Motor', 'Tri Motor']
            },
            'Opel': {
                'Astra': ['1.0T', '1.2T', '1.4T', '1.5D', '1.6D', '2.0 GSi'],
                'Corsa': ['1.0T', '1.2', '1.2T', '1.3 CDTi', '1.5D', 'Corsa-e', 'OPC'],
                'Mokka': ['1.2T', '1.5D', 'Mokka-e'],
                'Grandland': ['1.2T', '1.5D', '1.6T', '1.6 Hybrid4'],
                'Insignia': ['1.5T', '1.6D', '2.0T', '2.0D', 'GSi'],
                'Zafira': ['1.4T', '1.6T', '1.6 CDTi', '2.0 CDTi', 'Life']
            },
            'Renault': {
                'Clio': ['0.9 TCe', '1.0 TCe', '1.2', '1.3 TCe', '1.5 dCi', 'RS'],
                'Captur': ['0.9 TCe', '1.0 TCe', '1.3 TCe', '1.5 dCi', 'E-Tech'],
                'Megane': ['1.0 TCe', '1.2 TCe', '1.3 TCe', '1.5 dCi', '1.6', '1.8 TCe RS', '2.0T RS', 'E-Tech'],
                'Scenic': ['1.2 TCe', '1.3 TCe', '1.5 dCi', '1.6 dCi', '1.7 Blue dCi'],
                'Talisman': ['1.3 TCe', '1.6 TCe', '1.5 dCi', '1.6 dCi', '2.0 dCi'],
                'Kadjar': ['1.2 TCe', '1.3 TCe', '1.5 dCi', '1.6 dCi', '1.7 Blue dCi'],
                'Koleos': ['1.6 dCi', '1.7 Blue dCi', '2.0 dCi'],
                'Zoe': ['R110', 'R135', 'ZE40', 'ZE50'],
                'Twingo': ['0.9 TCe', '1.0 SCe', 'Electric'],
                },
            'Mitsubishi': {
                'Outlander': ['2.0', '2.4', 'PHEV'],
                'ASX': ['1.6', '2.0', '1.8D', '2.2D'],
                'Eclipse Cross': ['1.5T', 'PHEV'],
                'L200': ['2.4D', '2.5D'],
                'Shogun/Pajero': ['3.2 DI-DC', 'Sport'],
                'Mirage': ['1.2'],
                'Lancer': ['1.6', '1.8', '2.0', 'Evolution']
            },
            'Peugeot': {
                '108': ['1.0', '1.2'],
                '208': ['1.0 PureTech', '1.2 PureTech', '1.5 BlueHDi', '1.6 THP', 'e-208'],
                '308': ['1.2 PureTech', '1.5 BlueHDi', '1.6 THP', '2.0 BlueHDi', 'GTi'],
                '508': ['1.6 PureTech', '1.5 BlueHDi', '1.6 THP', '2.0 BlueHDi', 'Hybrid'],
                '2008': ['1.2 PureTech', '1.5 BlueHDi', '1.6 BlueHDi', 'e-2008'],
                '3008': ['1.2 PureTech', '1.6 PureTech', '1.5 BlueHDi', '2.0 BlueHDi', 'Hybrid4'],
                '5008': ['1.2 PureTech', '1.6 PureTech', '1.5 BlueHDi', '2.0 BlueHDi'],
                'RCZ': ['1.6 THP', '2.0 HDi', 'R']
            },
            'Suzuki': {
                'Swift': ['1.2', '1.0 Boosterjet', '1.2 Dualjet', '1.4 Boosterjet', 'Sport'],
                'Vitara': ['1.0 Boosterjet', '1.4 Boosterjet', '1.6', '1.6D'],
                'S-Cross': ['1.0 Boosterjet', '1.4 Boosterjet', '1.6', '1.6D'],
                'Ignis': ['1.2', '1.2 SHVS'],
                'Jimny': ['1.5'],
                'Baleno': ['1.0 Boosterjet', '1.2', '1.2 SHVS'],
                'Celerio': ['1.0']
            },
            'Citroen': {
                'C1': ['1.0', '1.2'],
                'C3': ['1.2 PureTech', '1.5 BlueHDi', '1.6 BlueHDi'],
                'C4': ['1.2 PureTech', '1.5 BlueHDi', '1.6 BlueHDi', 'ë-C4'],
                'C5': ['1.6 THP', '1.6 HDi', '2.0 HDi', 'Aircross', 'X'],
                'Berlingo': ['1.2 PureTech', '1.5 BlueHDi', '1.6 BlueHDi', 'ë-Berlingo'],
                'Aircross': ['1.2 PureTech', '1.6 PureTech', '1.5 BlueHDi', '2.0 BlueHDi', 'Hybrid'],
                'SpaceTourer': ['1.5 BlueHDi', '2.0 BlueHDi', 'ë-SpaceTourer']
            },
            'Cadillac': {
                'ATS': ['2.0T', '2.5', '3.6', 'ATS-V'],
                'CTS': ['2.0T', '3.6', 'CTS-V'],
                'CT4': ['2.0T', '2.7T', 'CT4-V'],
                'CT5': ['2.0T', '3.0TT', 'CT5-V'],
                'XT4': ['2.0T', '2.0D'],
                'XT5': ['2.0T', '3.6'],
                'XT6': ['2.0T', '3.6'],
                'Escalade': ['6.2', 'ESV', '3.0D']
            },
            'Jaguar': {
                'XE': ['2.0D', '2.0P', '3.0 S', 'SV Project 8'],
                'XF': ['2.0D', '2.0P', '3.0D', '3.0P', 'Sportbrake'],
                'XJ': ['3.0D', '3.0P', '5.0 V8', 'L'],
                'F-Type': ['2.0P', '3.0P', '5.0 V8', 'R', 'SVR'],
                'E-Pace': ['2.0D', '2.0P', 'PHEV'],
                'F-Pace': ['2.0D', '2.0P', '3.0D', '3.0P', 'SVR'],
                'I-Pace': ['EV400']
            },
            'Volvo': {
                'S60': ['T4', 'T5', 'T6', 'T8', 'D3', 'D4', 'Polestar'],
                'S90': ['T4', 'T5', 'T6', 'T8', 'D3', 'D4', 'D5'],
                'V60': ['T4', 'T5', 'T6', 'T8', 'D3', 'D4', 'Cross Country', 'Polestar'],
                'V90': ['T4', 'T5', 'T6', 'T8', 'D3', 'D4', 'D5', 'Cross Country'],
                'XC40': ['T3', 'T4', 'T5', 'D3', 'D4', 'Recharge'],
                'XC60': ['T4', 'T5', 'T6', 'T8', 'D3', 'D4', 'D5'],
                'XC90': ['T5', 'T6', 'T8', 'D5']
            },
            'Lexus': {
                'CT': ['200h'],
                'IS': ['200t', '300h', '350', '500'],
                'ES': ['250', '300h', '350'],
                'LS': ['500', '500h'],
                'UX': ['200', '250h', '300e'],
                'NX': ['200t', '300', '300h', '350h', '450h+'],
                'RX': ['300', '350', '350L', '450h', '450hL'],
                'GX': ['460'],
                'LX': ['570'],
                'RC': ['200t', '300', '350', 'F'],
                'LC': ['500', '500h']
            },
            'Fiat': {
                '500': ['1.0 Hybrid', '1.2', '0.9 TwinAir', '1.4', '500e'],
                '500X': ['1.0 FireFly', '1.3 FireFly', '1.6', '1.6 MultiJet', '2.0 MultiJet'],
                'Panda': ['1.0 Hybrid', '1.2', '0.9 TwinAir', '1.3 MultiJet', '4x4'],
                'Tipo': ['1.0 FireFly', '1.4', '1.6', '1.3 MultiJet', '1.6 MultiJet'],
                '124 Spider': ['1.4 MultiAir', 'Abarth'],
                'Doblo': ['1.4', '1.6 MultiJet', '2.0 MultiJet'],
                'Ducato': ['2.3 MultiJet', '3.0 MultiJet', 'E-Ducato']
            },
            'Jeep': {
                'Renegade': ['1.0T', '1.3T', '1.6 MultiJet', '2.0 MultiJet', '4xe'],
                'Compass': ['1.3T', '1.6 MultiJet', '2.0 MultiJet', '4xe'],
                'Cherokee': ['2.0T', '2.2 MultiJet', '3.2'],
                'Grand Cherokee': ['Grand 3.0 CRD', 'Grand 3.6', 'Grand 5.7', 'Grand 6.4 SRT', 'Grand 6.2 Trackhawk', 'Grand 4xe'],
                'Wrangler': ['Wrangler 2.0T', 'Wrangler 2.2 MultiJet', 'Wrangler 3.6', 'Wrangler 4xe', 'Wrangler Rubicon', 'Wrangler Unlimited'],
                'Gladiator': ['Gladiator 3.0 EcoDiesel', 'Gladiator 3.6']
            }
        }
        
       

        for make_name, model in car_data.items():
            make, _ = CarMake.objects.get_or_create(name=make_name)
            self.stdout.write(self.style.SUCCESS(f'Created make: {make_name}'))

            for model_name, variants in model.items():
                model, _ = CarModel.objects.get_or_create(make=make, name=model_name)
                self.stdout.write(f'Created model: {model_name} for {make_name}')

                for variant in variants:
                    CarVariant.objects.get_or_create(model=model, name=variant)
                    self.stdout.write(f'  → Created variant: {variant} under {model_name}')