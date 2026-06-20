import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta, datetime
from bank_Jwt.models import User, Transaction
from django.db import models
import json
from django.db import models

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed database with real Kenyan data for bank application'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding'
        )
        parser.add_argument(
            '--users',
            type=int,
            default=20,
            help='Number of users to create (default: 20)'
        )

    def handle(self, *args, **options):
        clear_existing = options['clear']
        users_count = options['users']

        if clear_existing:
            self.stdout.write(self.style.WARNING('Clearing existing data...'))
            Transaction.objects.all().delete()
            User.objects.exclude(is_superuser=True).delete()
            self.stdout.write(self.style.SUCCESS('Existing data cleared!'))

        # Kenyan data
        self.kenyan_data = self.load_kenyan_data()
        
        # Create admin
        self.create_admin()
        
        # Create users
        users = self.create_kenyan_users(users_count)
        
        # Create transactions for each user
        for user in users:
            self.create_kenyan_transactions(user)
        
        self.stdout.write(self.style.SUCCESS('✅ Database seeded with Kenyan data successfully!'))
        self.print_summary(users)

    def load_kenyan_data(self):
        """Load Kenyan-specific data"""
        return {
            'first_names': [
                'James', 'Mary', 'John', 'Grace', 'David', 'Jane', 'Michael', 'Sarah',
                'Peter', 'Margaret', 'William', 'Rachel', 'Joseph', 'Esther', 'Daniel',
                'Alice', 'Samuel', 'Judith', 'Paul', 'Ruth', 'Stephen', 'Rose',
                'Kenneth', 'Catherine', 'Patrick', 'Faith', 'George', 'Lucy',
                'Charles', 'Diana', 'Thomas', 'Anne', 'Anthony', 'Dorothy',
                'Kevin', 'Joyce', 'Simon', 'Lilian', 'Philip', 'Cynthia',
                'Brian', 'Catherine', 'Tony', 'Juliet', 'Fred', 'Grace',
                'Ben', 'Ann', 'Mike', 'Carol', 'Alex', 'Lydia', 'Victor', 'Irene'
            ],
            'last_names': [
                'Ochieng', 'Akinyi', 'Kamau', 'Wanjiru', 'Otieno', 'Achieng',
                'Mwangi', 'Wambui', 'Omondi', 'Awuor', 'Njuguna', 'Wangari',
                'Okoth', 'Atieno', 'Kariuki', 'Nyokabi', 'Were', 'Auma',
                'Mutua', 'Ndanu', 'Waweru', 'Gathoni', 'Ouma', 'Adhiambo',
                'Njoroge', 'Njoki', 'Odhiambo', 'Anyango', 'Chege', 'Muthoni',
                'Onyango', 'Were', 'Kiprop', 'Kiptoo', 'Koech', 'Kigen',
                'Langat', 'Kibet', 'Rono', 'Kemboi', 'Kipchumba', 'Kipkurui',
                'Arap', 'Kipruto', 'Kipngeno', 'Cheruiyot', 'Kiprop', 'Kipsang',
                'Bett', 'Kirui', 'Kiprono', 'Kiptanui', 'Kibiwott', 'Kipkoech'
            ],
            'locations': [
                'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika',
                'Malindi', 'Kitale', 'Garissa', 'Kakamega', 'Bungoma', 'Meru',
                'Nyeri', 'Machakos', 'Embu', 'Isiolo', 'Lamu', 'Voi', 'Kilifi',
                'Naivasha', 'Narok', 'Kajiado', 'Kiambu', 'Ruiru', 'Kikuyu',
                'Limuru', 'Ongata Rongai', 'Kasarani', 'Donholm', 'Buruburu',
                'Kilimani', 'Karen', 'Langata', 'Westlands', 'Parklands'
            ],
            'counties': [
                'Nairobi', 'Kisumu', 'Mombasa', 'Nakuru', 'Uasin Gishu',
                'Kiambu', 'Kajiado', 'Machakos', 'Meru', 'Nyeri', 'Kakamega',
                'Bungoma', 'Garissa', 'Kilifi', 'Kwale', 'Lamu', 'Tana River'
            ],
            'banks': [
                'Equity Bank', 'KCB Bank', 'Co-operative Bank', 'Standard Chartered',
                'Barclays Bank (Absa)', 'Citi Bank', 'I&M Bank', 'Diamond Trust Bank',
                'Family Bank', 'Safaricom (M-Pesa)', 'Airtel Money', 'NCBA Bank',
                'Stanbic Bank', 'Prime Bank', 'Bank of Africa', 'Ecobank',
                'Gulf African Bank', 'First Community Bank', 'National Bank of Kenya',
                'Consolidated Bank', 'K-Rep Bank', 'Housing Finance', 'Jamii Bora Bank'
            ],
            'mpesa': ['Safaricom M-Pesa', 'Airtel Money', 'T-Kash'],
            'saccos': [
                'Stima SACCO', 'Mwalimu SACCO', 'Hazina SACCO', 'Kenya Police SACCO',
                'Ugafode SACCO', 'Unions SACCO', 'Wananchi SACCO', 'Makutano SACCO',
                'Imarika SACCO', 'Mwalimu SACCO', 'CIC Sacco'
            ],
            'business_types': [
                'Tuktuk Business', 'Kibanda (Food Kiosk)', 'Grocery Store', 'Hardware Shop',
                'Salon', 'Barber Shop', 'Electronics Shop', 'Clothing Store',
                'Pharmacy', 'Butcher', 'Fruit Market', 'Vegetable Market',
                'Hardware Store', 'Jua Kali Workshop', 'Car Wash', 'Garage',
                'Tourist Hotel', 'Guest House', 'Coffee Shop', 'Bakery'
            ],
            'schools': [
                'University of Nairobi', 'Kenyatta University', 'Moi University',
                'Maseno University', 'Jomo Kenyatta University', 'Egerton University',
                'Technical University of Kenya', 'Strathmore University',
                'Mount Kenya University', 'KCA University', 'Africa Nazarene University',
                'St. Paul University', 'Daystar University', 'USIU-Africa'
            ],
            'mpesa_till': [
                'Safaricom', 'Airtel', 'Telkom', 'Equity', 'KCB', 'Co-op Bank'
            ]
        }

    def create_admin(self):
        """Create super admin with Kenyan details"""
        if not User.objects.filter(email='admin@kenyabank.com').exists():
            User.objects.create_superuser(
                email='admin@kenyabank.com',
                password='Admin@123',
                name='James Ochieng',
                balance=500000.00
            )
            self.stdout.write(self.style.SUCCESS('✅ Admin created: admin@kenyabank.com / Admin@123'))

    def create_kenyan_users(self, count):
        """Create Kenyan users with realistic data"""
        users = []
        data = self.kenyan_data
        
        # Ensure we have enough names
        first_names = data['first_names']
        last_names = data['last_names']
        
        user_profiles = [
            {'type': 'business', 'balance_range': (50000, 1000000)},
            {'type': 'professional', 'balance_range': (20000, 300000)},
            {'type': 'student', 'balance_range': (1000, 50000)},
            {'type': 'entrepreneur', 'balance_range': (30000, 500000)},
            {'type': 'farmer', 'balance_range': (10000, 200000)},
        ]

        for i in range(count):
            # Select random profile
            profile = random.choice(user_profiles)
            
            # Generate name
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            name = f"{first_name} {last_name}"
            
            # Generate email
            email = f"{first_name.lower()}.{last_name.lower()}@gmail.com"
            # Avoid duplicates
            while User.objects.filter(email=email).exists():
                email = f"{first_name.lower()}.{last_name.lower()}{random.randint(1, 999)}@gmail.com"
            
            # Generate phone (Kenyan format)
            phone_prefixes = ['071', '072', '073', '074', '070', '078']
            phone = f"{random.choice(phone_prefixes)}{random.randint(100000, 999999)}"
            
            # Generate balance based on profile
            min_bal, max_bal = profile['balance_range']
            balance = round(random.uniform(min_bal, max_bal), 2)
            
            # Add M-Pesa balance for realistic banking
            mpesa_balance = round(random.uniform(0, balance * 0.3), 2)
            
            # Create user with extra fields via additional info
            user = User.objects.create_user(
                email=email,
                password='M-Pesa@123',
                name=name,
                balance=balance
            )
            
            # Store additional Kenyan-specific data (if you have custom fields)
            # You can extend User model or use a Profile model
            users.append({
                'user': user,
                'phone': phone,
                'location': random.choice(data['locations']),
                'county': random.choice(data['counties']),
                'mpesa_balance': mpesa_balance,
                'profile_type': profile['type']
            })
            
            if (i + 1) % 5 == 0:
                self.stdout.write(f'  Created {i + 1} Kenyan users...')
        
        return users

    def create_kenyan_transactions(self, user_data):
        """Create realistic Kenyan transactions including M-Pesa"""
        user = user_data['user']
        current_balance = float(user.balance)
        phone = user_data['phone']
        location = user_data['location']
        
        # Transaction patterns
        transactions = []
        
        # 1. M-Pesa Deposits (Fuliza, M-Shwari, M-Kesho)
        mpesa_deposits = [
            ('M-Pesa Deposit - Fuliza', random.randint(50, 5000)),
            ('M-Pesa Deposit - M-Shwari', random.randint(100, 10000)),
            ('M-Pesa Deposit - M-Kesho', random.randint(200, 20000)),
            ('M-Pesa Deposit - T-Kash', random.randint(50, 3000)),
            ('M-Pesa Agent Deposit', random.randint(100, 50000)),
        ]
        
        # 2. Salary deposits (Job types)
        salaries = [
            ('Salary - KRA', random.randint(20000, 150000)),
            ('Salary - NGO', random.randint(30000, 80000)),
            ('Salary - Government', random.randint(25000, 120000)),
            ('Salary - Private Company', random.randint(20000, 100000)),
            ('Salary - County Government', random.randint(20000, 90000)),
            ('Salary - UN', random.randint(50000, 200000)),
        ]
        
        # 3. Business income (Kenyan businesses)
        business_income = [
            ('Tuktuk Business Income', random.randint(500, 3000)),
            ('Kibanda Sales', random.randint(1000, 10000)),
            ('Grocery Store Revenue', random.randint(2000, 15000)),
            ('Hardware Shop Sales', random.randint(5000, 50000)),
            ('Salon Income', random.randint(1000, 8000)),
            ('Jua Kali Workshop', random.randint(1000, 15000)),
            ('Car Wash Income', random.randint(500, 5000)),
        ]
        
        # 4. Farming income (Kenyan agriculture)
        farming_income = [
            ('Maize Harvest Sale', random.randint(10000, 100000)),
            ('Milk Sales - KCC', random.randint(1000, 20000)),
            ('Tea Leaves Payment', random.randint(5000, 50000)),
            ('Coffee Cherry Payment', random.randint(5000, 30000)),
            ('Vegetable Sales - Wakulima', random.randint(1000, 15000)),
            ('Sugarcane Payment', random.randint(10000, 50000)),
        ]
        
        # 5. Kenyan bills and payments
        bills = [
            ('KPLC - Power Bill', random.randint(500, 10000)),
            ('NC Water - Water Bill', random.randint(200, 5000)),
            ('Safaricom - Internet', random.randint(1000, 5000)),
            ('DStv - Subscription', random.randint(1500, 8000)),
            ('GOTv - Subscription', random.randint(500, 3000)),
            ('HELB - Loan Repayment', random.randint(1000, 10000)),
            ('NSSF - Contribution', random.randint(200, 2000)),
            ('NHIF - Insurance', random.randint(500, 2000)),
            ('NTSA - Fines/Insurance', random.randint(500, 5000)),
            ('Rent Payment', random.randint(5000, 50000)),
            ('School Fees', random.randint(5000, 50000)),
        ]
        
        # 6. M-Pesa withdrawals
        mpesa_withdrawals = [
            ('M-Pesa Withdrawal - Agent', random.randint(100, 10000)),
            ('M-Pesa Withdrawal - ATM', random.randint(1000, 20000)),
            ('M-Pesa Withdrawal - Supermarket', random.randint(500, 5000)),
            ('M-Pesa Withdrawal - Shop', random.randint(200, 2000)),
        ]
        
        # 7. Shopping (Kenyan supermarkets and shops)
        shopping = [
            ('Naivas Supermarket', random.randint(500, 10000)),
            ('Quickmart', random.randint(300, 5000)),
            ('Tuskys', random.randint(200, 8000)),
            ('Carrefour - Garden City', random.randint(1000, 15000)),
            ('Chandarana Foodplus', random.randint(500, 5000)),
            ('Gilanis Supermarket', random.randint(200, 3000)),
            ('Eastleigh - Wholesale', random.randint(1000, 20000)),
        ]
        
        # 8. Transport (Kenyan Matatus, Uber, etc.)
        transport = [
            ('Matatu Fare', random.randint(50, 500)),
            ('Uber Ride', random.randint(200, 1500)),
            ('Boda Boda - Rush Hour', random.randint(50, 300)),
            ('Fuel - Petrol Station', random.randint(1000, 5000)),
            ('Parking Fee - CBD', random.randint(100, 500)),
        ]
        
        # 9. M-Pesa Send Money to Others (Kenyans sending to family/friends)
        mpesa_send = [
            ('Send Money - Family Support', random.randint(500, 20000)),
            ('Send Money - Friends', random.randint(100, 5000)),
            ('Send Money - Church Offering', random.randint(100, 1000)),
            ('Send Money - Harambee', random.randint(200, 10000)),
            ('Send Money - Wedding Gift', random.randint(1000, 5000)),
        ]
        
        # Combine all transaction types
        all_transactions = []
        
        # Add salary deposits (1-2 per user)
        if random.random() < 0.7:
            salary = random.choice(salaries)
            all_transactions.append({
                'type': 'deposit',
                'amount': salary[1],
                'description': salary[0],
                'date': timezone.now() - timedelta(days=random.randint(1, 30))
            })
        
        # Add business income (if user is business type)
        if user_data.get('profile_type') in ['business', 'entrepreneur']:
            for _ in range(random.randint(2, 5)):
                biz = random.choice(business_income)
                all_transactions.append({
                    'type': 'deposit',
                    'amount': biz[1],
                    'description': biz[0],
                    'date': timezone.now() - timedelta(days=random.randint(1, 30))
                })
        
        # Add farming income (for farmers)
        if random.random() < 0.2:
            farming = random.choice(farming_income)
            all_transactions.append({
                'type': 'deposit',
                'amount': farming[1],
                'description': farming[0],
                'date': timezone.now() - timedelta(days=random.randint(1, 90))
            })
        
        # Add M-Pesa deposits
        for _ in range(random.randint(1, 3)):
            mpesa = random.choice(mpesa_deposits)
            all_transactions.append({
                'type': 'deposit',
                'amount': mpesa[1],
                'description': f"{mpesa[0]} - {phone}",
                'date': timezone.now() - timedelta(days=random.randint(1, 30))
            })
        
        # Add bills and payments
        for _ in range(random.randint(3, 8)):
            bill = random.choice(bills)
            all_transactions.append({
                'type': 'withdrawal',
                'amount': bill[1],
                'description': bill[0],
                'date': timezone.now() - timedelta(days=random.randint(1, 60))
            })
        
        # Add shopping transactions
        for _ in range(random.randint(2, 6)):
            shop = random.choice(shopping)
            all_transactions.append({
                'type': 'withdrawal',
                'amount': shop[1],
                'description': shop[0],
                'date': timezone.now() - timedelta(days=random.randint(1, 15))
            })
        
        # Add transport costs
        for _ in range(random.randint(2, 5)):
            transport_item = random.choice(transport)
            all_transactions.append({
                'type': 'withdrawal',
                'amount': transport_item[1],
                'description': transport_item[0],
                'date': timezone.now() - timedelta(days=random.randint(1, 10))
            })
        
        # Add M-Pesa withdrawals
        for _ in range(random.randint(1, 3)):
            mpesa_tx = random.choice(mpesa_withdrawals)
            all_transactions.append({
                'type': 'withdrawal',
                'amount': mpesa_tx[1],
                'description': f"{mpesa_tx[0]} - {random.choice(self.kenyan_data['mpesa'])}",
                'date': timezone.now() - timedelta(days=random.randint(1, 20))
            })
        
        # Add M-Pesa send money
        for _ in range(random.randint(1, 3)):
            send = random.choice(mpesa_send)
            all_transactions.append({
                'type': 'withdrawal',
                'amount': send[1],
                'description': f"{send[0]} - {random.choice(['M-Pesa', 'Airtel Money', 'T-Kash'])}",
                'date': timezone.now() - timedelta(days=random.randint(1, 15))
            })
        
        # Sort transactions by date
        all_transactions.sort(key=lambda x: x['date'])
        
        # Apply transactions and maintain balance
        created_count = 0
        for tx_data in all_transactions:
            amount = tx_data['amount']
            tx_type = tx_data['type']
            
            # Skip if withdrawal would make balance negative
            if tx_type == 'withdrawal' and current_balance - amount < 0:
                amount = min(amount, current_balance * 0.5)
                if amount < 10:
                    continue
            
            # Update balance
            if tx_type == 'deposit':
                current_balance += amount
            else:
                current_balance -= amount
            
            # Add location to description
            description = tx_data['description']
            if random.random() < 0.3:
                description = f"{description} - {location}"
            
            # Create transaction with M-Pesa or bank reference
            if random.random() < 0.4:
                ref_types = ['TRX', 'MPESA', 'BANK', 'SACCO']
                ref = f"{random.choice(ref_types)}{random.randint(10000, 99999)}"
                description = f"{description} (Ref: {ref})"
            
            Transaction.objects.create(
                user=user,
                type=tx_type,
                amount=round(amount, 2),
                description=description,
                balance_after=round(current_balance, 2),
                created_at=tx_data['date']
            )
            created_count += 1
        
        # Update user's final balance
        user.balance = round(current_balance, 2)
        user.save()
        
        self.stdout.write(f'  ✅ Created {created_count} Kenyan transactions for {user.email}')

    def print_summary(self, users):
        """Print summary with Kenyan stats"""
        total_users = User.objects.count()
        total_transactions = Transaction.objects.count()
        
        # Calculate totals
        total_balance = User.objects.aggregate(total=models.Sum('balance'))['total'] or 0
        
        # Calculate deposit and withdrawal stats
        deposits = Transaction.objects.filter(type='deposit')
        withdrawals = Transaction.objects.filter(type='withdrawal')
        
        total_deposits = deposits.aggregate(total=models.Sum('amount'))['total'] or 0
        total_withdrawals = withdrawals.aggregate(total=models.Sum('amount'))['total'] or 0
        
        # Find largest transaction
        largest_tx = Transaction.objects.order_by('-amount').first()
        
        # Find most active user
        if users:
            most_active = max(users, key=lambda u: Transaction.objects.filter(user=u['user']).count())
        else:
            most_active = None
        
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('📊 KENYAN BANKING DATA SUMMARY'))
        self.stdout.write('='*60)
        
        self.stdout.write('\n👥 ACCOUNT STATISTICS:')
        self.stdout.write(f'  • Total Users: {total_users}')
        self.stdout.write(f'  • Total Balance: KSh {total_balance:,.2f}')
        self.stdout.write(f'  • Average Balance: KSh {(total_balance / total_users if total_users > 0 else 0):,.2f}')
        
        self.stdout.write('\n💰 TRANSACTION STATISTICS:')
        self.stdout.write(f'  • Total Transactions: {total_transactions}')
        self.stdout.write(f'  • Total Deposits: KSh {total_deposits:,.2f}')
        self.stdout.write(f'  • Total Withdrawals: KSh {total_withdrawals:,.2f}')
        self.stdout.write(f'  • Net Flow: KSh {(total_deposits - total_withdrawals):,.2f}')
        
        if largest_tx:
            self.stdout.write(f'  • Largest Transaction: KSh {largest_tx.amount:,.2f} ({largest_tx.description})')
        
        if most_active:
            user = most_active['user']
            tx_count = Transaction.objects.filter(user=user).count()
            self.stdout.write(f'  • Most Active User: {user.name} ({tx_count} transactions)')
        
        self.stdout.write('\n📍 KENYAN LOCATIONS:')
        locations_used = set()
        for user_data in users[:10]:
            if 'location' in user_data:
                locations_used.add(user_data['location'])
        for loc in list(locations_used)[:5]:
            self.stdout.write(f'  • {loc}')
        
        self.stdout.write('\n🔐 LOGIN CREDENTIALS:')
        self.stdout.write('  Admin: admin@kenyabank.com / Admin@123')
        self.stdout.write('  Users: [email] / M-Pesa@123')
        self.stdout.write('  (Check console for sample user emails)')
        
        self.stdout.write('\n📋 SAMPLE USERS:')
        for user_data in users[:5]:
            user = user_data['user']
            phone = user_data.get('phone', 'N/A')
            location = user_data.get('location', 'N/A')
            self.stdout.write(
                f"  • {user.name} ({user.email}) - Phone: {phone} - "
                f"KSh {user.balance:,.2f} - {location}"
            )
        
        if len(users) > 5:
            self.stdout.write(f'  ... and {len(users) - 5} more users')
        
        self.stdout.write('\n💡 KENYAN BANKING TIPS:')
        self.stdout.write('  • Most transactions include M-Pesa references')
        self.stdout.write('  • Users have realistic Kenyan balances and spending')
        self.stdout.write('  • Data includes salary, business, and farming income')
        
        self.stdout.write('\n' + '='*60 + '\n')

