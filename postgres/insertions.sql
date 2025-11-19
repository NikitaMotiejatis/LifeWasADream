BEGIN TRANSACTION;

-- for now for editing data, later on could redo in a faster
DELETE FROM order_item_variation;
DELETE FROM order_item;
DELETE FROM order_discount;
DELETE FROM appointment_bill;
DELETE FROM appointment;
DELETE FROM service_employee;
DELETE FROM service_location;
DELETE FROM service;
DELETE FROM employee_shift;
DELETE FROM location_open;
DELETE FROM location;
DELETE FROM token;
DELETE FROM order_data;
DELETE FROM employee;
DELETE FROM item_discount;
DELETE FROM discount_details;
DELETE FROM work_shift;
DELETE FROM item_variation; --?????
DELETE FROM item;
DELETE FROM business;
DELETE FROM role_permission;
DELETE FROM permissions;
DELETE FROM role;
DELETE FROM currency_info;
DELETE FROM country;


-- ------------------------------------------------------------------------------------------------
-- Application Data -------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------

INSERT INTO role (id, name) VALUES
(1, 'Admin'),
(2, 'Manager'),
(3, 'Cashier'),
(4, 'Service Provider'),
(5, 'Support Staff'),
(6, 'Inventory Manager'),
(7, 'Customer Support'),
(8, 'Accountant'),
(9, 'Marketing'),
(10, 'Technician'),
(11, 'CASHIER_ORDER'),
(12, 'CASHIER_SERVICE'),
(13, 'KITCHEN'),
(14, 'WAITER'),
(15, 'SERVICE');



INSERT INTO permissions (id, name) VALUES
(1, 'CREATE_ORDER'),
(2, 'REFUND_ORDER'),
(3, 'MANAGE_EMPLOYEES'),
(4, 'MANAGE_SERVICES'),
(5, 'MANAGE_APPOINTMENTS'),
(6, 'VIEW_REPORTS'),
(7, 'MANAGE_INVENTORY'),
(8, 'PROCESS_PAYMENTS'),
(9, 'MANAGE_DISCOUNTS'),
(10, 'VIEW_FINANCIALS');

INSERT INTO role_permission (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
(2, 1), (2, 2), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9),(3, 1), (3, 8),
(4, 1), (4, 5), (4, 8),(5, 1),(6, 7), (6, 6),(7, 5), (7, 6),(8, 10), (8, 6),(9, 6),(10, 4), (10, 5),
(11, 1), (11, 2), (11, 8),(12, 1), (12, 8),(13, 4), (13, 5),(14, 4), (14, 5),(15, 4), (15, 5);

INSERT INTO currency_info (code, name, symbol) VALUES
('USD', 'US Dollar', '$'),
('EUR', 'Euro', '€'),
('GBP', 'British Pound', '£'),
('JPY', 'Japanese Yen', '¥'),
('CAD', 'Canadian Dollar', '$'),
('AUD', 'Australian Dollar', '$'),
('CHF', 'Swiss Franc', 'F'),
('CNY', 'Chinese Yuan', '¥'),
('HKD', 'Hong Kong Dollar', '$'),
('NZD', 'New Zealand Dollar', '$');


INSERT INTO country (code, name, currency, vat) VALUES
('AF', 'Afghanistan', 'AFN', 0.10),
('AL', 'Albania', 'ALL', 0.20),
('DZ', 'Algeria', 'DZD', 0.19),
('AD', 'Andorra', 'EUR', 0.05),
('AO', 'Angola', 'AOA', 0.14),
('AG', 'Antigua and Barbuda', 'XCD', 0.15),
('AR', 'Argentina', 'ARS', 0.21),
('AM', 'Armenia', 'AMD', 0.20),
('AU', 'Australia', 'AUD', 0.10),
('AT', 'Austria', 'EUR', 0.20),
('AZ', 'Azerbaijan', 'AZN', 0.18),
('BS', 'Bahamas', 'BSD', 0.10),
('BH', 'Bahrain', 'BHD', 0.10),
('BD', 'Bangladesh', 'BDT', 0.15),
('BB', 'Barbados', 'BBD', 0.175),
('BY', 'Belarus', 'BYN', 0.20),
('BE', 'Belgium', 'EUR', 0.21),
('BZ', 'Belize', 'BZD', 0.125),
('BJ', 'Benin', 'XOF', 0.18),
('BT', 'Bhutan', 'BTN', 0.07),
('BO', 'Bolivia', 'BOB', 0.13),
('BA', 'Bosnia and Herzegovina', 'BAM', 0.17),
('BW', 'Botswana', 'BWP', 0.12),
('BR', 'Brazil', 'BRL', 0.17),
('BN', 'Brunei', 'BND', 0.01),
('BG', 'Bulgaria', 'BGN', 0.20),
('BF', 'Burkina Faso', 'XOF', 0.18),
('BI', 'Burundi', 'BIF', 0.18),
('CV', 'Cabo Verde', 'CVE', 0.15),
('KH', 'Cambodia', 'KHR', 0.10),
('CM', 'Cameroon', 'XAF', 0.19),
('CA', 'Canada', 'CAD', 0.05),
('CF', 'Central African Republic', 'XAF', 0.19),
('TD', 'Chad', 'XAF', 0.18),
('CL', 'Chile', 'CLP', 0.19),
('CN', 'China', 'CNY', 0.13),
('CO', 'Colombia', 'COP', 0.19),
('KM', 'Comoros', 'KMF', 0.10),
('CG', 'Congo', 'XAF', 0.18),
('CD', 'Congo Democratic Republic', 'CDF', 0.16),
('CR', 'Costa Rica', 'CRC', 0.13),
('CI', 'Côte d''Ivoire', 'XOF', 0.18),
('HR', 'Croatia', 'EUR', 0.25),
('CU', 'Cuba', 'CUP', 0.02),
('CY', 'Cyprus', 'EUR', 0.19),
('CZ', 'Czech Republic', 'CZK', 0.21),
('DK', 'Denmark', 'DKK', 0.25),
('DJ', 'Djibouti', 'DJF', 0.10),
('DM', 'Dominica', 'XCD', 0.15),
('DO', 'Dominican Republic', 'DOP', 0.18),
('EC', 'Ecuador', 'USD', 0.12),
('EG', 'Egypt', 'EGP', 0.14),
('SV', 'El Salvador', 'USD', 0.13),
('GQ', 'Equatorial Guinea', 'XAF', 0.15),
('ER', 'Eritrea', 'ERN', 0.05),
('EE', 'Estonia', 'EUR', 0.20),
('SZ', 'Eswatini', 'SZL', 0.15),
('ET', 'Ethiopia', 'ETB', 0.15),
('FJ', 'Fiji', 'FJD', 0.09),
('FI', 'Finland', 'EUR', 0.24),
('FR', 'France', 'EUR', 0.20),
('GA', 'Gabon', 'XAF', 0.18),
('GM', 'Gambia', 'GMD', 0.15),
('GE', 'Georgia', 'GEL', 0.18),
('DE', 'Germany', 'EUR', 0.19),
('GH', 'Ghana', 'GHS', 0.125),
('GR', 'Greece', 'EUR', 0.24),
('GD', 'Grenada', 'XCD', 0.15),
('GT', 'Guatemala', 'GTQ', 0.12),
('GN', 'Guinea', 'GNF', 0.18),
('GW', 'Guinea-Bissau', 'XOF', 0.15),
('GY', 'Guyana', 'GYD', 0.14),
('HT', 'Haiti', 'HTG', 0.10),
('HN', 'Honduras', 'HNL', 0.15),
('HU', 'Hungary', 'HUF', 0.27),
('IS', 'Iceland', 'ISK', 0.24),
('IN', 'India', 'INR', 0.18),
('ID', 'Indonesia', 'IDR', 0.11),
('IR', 'Iran', 'IRR', 0.09),
('IQ', 'Iraq', 'IQD', 0.01),
('IE', 'Ireland', 'EUR', 0.23),
('IL', 'Israel', 'ILS', 0.17),
('IT', 'Italy', 'EUR', 0.22),
('JM', 'Jamaica', 'JMD', 0.15),
('JP', 'Japan', 'JPY', 0.10),
('JO', 'Jordan', 'JOD', 0.16),
('KZ', 'Kazakhstan', 'KZT', 0.12),
('KE', 'Kenya', 'KES', 0.16),
('KI', 'Kiribati', 'AUD', 0.10),
('KP', 'North Korea', 'KPW', 0.01),
('KR', 'South Korea', 'KRW', 0.10),
('KW', 'Kuwait', 'KWD', 0.01),
('KG', 'Kyrgyzstan', 'KGS', 0.12),
('LA', 'Laos', 'LAK', 0.10),
('LV', 'Latvia', 'EUR', 0.21),
('LB', 'Lebanon', 'LBP', 0.11),
('LS', 'Lesotho', 'LSL', 0.15),
('LR', 'Liberia', 'LRD', 0.10),
('LY', 'Libya', 'LYD', 0.01),
('LI', 'Liechtenstein', 'CHF', 0.08),
('LT', 'Lithuania', 'EUR', 0.21),
('LU', 'Luxembourg', 'EUR', 0.17),
('MG', 'Madagascar', 'MGA', 0.20),
('MW', 'Malawi', 'MWK', 0.17),
('MY', 'Malaysia', 'MYR', 0.10),
('MV', 'Maldives', 'MVR', 0.08),
('ML', 'Mali', 'XOF', 0.18),
('MT', 'Malta', 'EUR', 0.18),
('MH', 'Marshall Islands', 'USD', 0.01),
('MR', 'Mauritania', 'MRU', 0.16),
('MU', 'Mauritius', 'MUR', 0.15),
('MX', 'Mexico', 'MXN', 0.16),
('FM', 'Micronesia', 'USD', 0.01),
('MD', 'Moldova', 'MDL', 0.20),
('MC', 'Monaco', 'EUR', 0.20),
('MN', 'Mongolia', 'MNT', 0.10),
('ME', 'Montenegro', 'EUR', 0.21),
('MA', 'Morocco', 'MAD', 0.20),
('MZ', 'Mozambique', 'MZN', 0.17),
('MM', 'Myanmar', 'MMK', 0.05),
('NA', 'Namibia', 'NAD', 0.15),
('NR', 'Nauru', 'AUD', 0.01),
('NP', 'Nepal', 'NPR', 0.13),
('NL', 'Netherlands', 'EUR', 0.21),
('NZ', 'New Zealand', 'NZD', 0.15),
('NI', 'Nicaragua', 'NIO', 0.15),
('NE', 'Niger', 'XOF', 0.19),
('NG', 'Nigeria', 'NGN', 0.08),
('MK', 'North Macedonia', 'MKD', 0.18),
('NO', 'Norway', 'NOK', 0.25),
('OM', 'Oman', 'OMR', 0.05),
('PK', 'Pakistan', 'PKR', 0.17),
('PW', 'Palau', 'USD', 0.01),
('PA', 'Panama', 'PAB', 0.07),
('PG', 'Papua New Guinea', 'PGK', 0.10),
('PY', 'Paraguay', 'PYG', 0.10),
('PE', 'Peru', 'PEN', 0.18),
('PH', 'Philippines', 'PHP', 0.12),
('PL', 'Poland', 'PLN', 0.23),
('PT', 'Portugal', 'EUR', 0.23),
('QA', 'Qatar', 'QAR', 0.01),
('RO', 'Romania', 'RON', 0.19),
('RU', 'Russia', 'RUB', 0.20),
('RW', 'Rwanda', 'RWF', 0.18),
('KN', 'Saint Kitts and Nevis', 'XCD', 0.17),
('LC', 'Saint Lucia', 'XCD', 0.13),
('VC', 'Saint Vincent and the Grenadines', 'XCD', 0.15),
('WS', 'Samoa', 'WST', 0.15),
('SM', 'San Marino', 'EUR', 0.17),
('ST', 'Sao Tome and Principe', 'STN', 0.15),
('SA', 'Saudi Arabia', 'SAR', 0.15),
('SN', 'Senegal', 'XOF', 0.18),
('RS', 'Serbia', 'RSD', 0.20),
('SC', 'Seychelles', 'SCR', 0.15),
('SL', 'Sierra Leone', 'SLE', 0.15),
('SG', 'Singapore', 'SGD', 0.09),
('SK', 'Slovakia', 'EUR', 0.20),
('SI', 'Slovenia', 'EUR', 0.22),
('SB', 'Solomon Islands', 'SBD', 0.10),
('SO', 'Somalia', 'SOS', 0.10),
('ZA', 'South Africa', 'ZAR', 0.15),
('SS', 'South Sudan', 'SSP', 0.15),
('ES', 'Spain', 'EUR', 0.21),
('LK', 'Sri Lanka', 'LKR', 0.18),
('SD', 'Sudan', 'SDG', 0.17),
('SR', 'Suriname', 'SRD', 0.10),
('SE', 'Sweden', 'SEK', 0.25),
('CH', 'Switzerland', 'CHF', 0.08),
('SY', 'Syria', 'SYP', 0.01),
('TW', 'Taiwan', 'TWD', 0.05),
('TJ', 'Tajikistan', 'TJS', 0.18),
('TZ', 'Tanzania', 'TZS', 0.18),
('TH', 'Thailand', 'THB', 0.07),
('TL', 'Timor-Leste', 'USD', 0.01),
('TG', 'Togo', 'XOF', 0.18),
('TO', 'Tonga', 'TOP', 0.15),
('TT', 'Trinidad and Tobago', 'TTD', 0.13),
('TN', 'Tunisia', 'TND', 0.19),
('TR', 'Turkey', 'TRY', 0.20),
('TM', 'Turkmenistan', 'TMT', 0.15),
('TV', 'Tuvalu', 'AUD', 0.01),
('UG', 'Uganda', 'UGX', 0.18),
('UA', 'Ukraine', 'UAH', 0.20),
('AE', 'United Arab Emirates', 'AED', 0.05),
('GB', 'United Kingdom', 'GBP', 0.20),
('US', 'United States', 'USD', 0.01),
('UY', 'Uruguay', 'UYU', 0.22),
('UZ', 'Uzbekistan', 'UZS', 0.12),
('VU', 'Vanuatu', 'VUV', 0.15),
('VA', 'Vatican City', 'EUR', 0.01),
('VE', 'Venezuela', 'VES', 0.16),
('VN', 'Vietnam', 'VND', 0.10),
('YE', 'Yemen', 'YER', 0.05),
('ZM', 'Zambia', 'ZMW', 0.16),
('ZW', 'Zimbabwe', 'ZWG', 0.15);
-- ------------------------------------------------------------------------------------------------
-- Business Data ----------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------

INSERT INTO business (id, name, description, type, email, phone, created_at) VALUES
(1,  'SuperMart',       'Grocery and retail store',         'ORDER_BASED',       'contact@supermart.com',       '+1-555-0101', '2020-01-15 09:00:00'),
(2,  'TechGadgets',    'Electronics and tech store',       'ORDER_BASED',       'info@techgadgets.com',       '+1-555-0102', '2020-02-20 10:30:00'),
(3,  'BeautySalon',    'Full service beauty salon',        'APPOINTMENT_BASED', 'book@beautysalon.com',       '+1-555-0103', '2020-03-10 08:00:00'),
(4,  'FitnessCenter',  'Gym and fitness training',         'APPOINTMENT_BASED', 'hello@fitnesscenter.com',    '+1-555-0104', '2020-04-05 07:00:00'),
(5,  'CoffeeHub',      'Coffee shop and café',             'ORDER_BASED',       'brew@coffeehub.com',         '+1-555-0105', '2020-05-12 06:30:00'),
(6,  'BookNook',       'Bookstore and reading lounge',    'ORDER_BASED',       'read@booknook.com',          '+1-555-0106', '2020-06-18 11:00:00'),
(7,  'AutoCare',       'Car service and maintenance',     'APPOINTMENT_BASED', 'service@autocare.com',       '+1-555-0107', '2020-07-22 08:30:00'),
(8,  'PetParadise',    'Pet grooming and supplies',       'APPOINTMENT_BASED', 'pets@petparadise.com',       '+1-555-0108', '2020-08-14 09:15:00'),
(9,  'HomeStyle',      'Home goods and furniture',        'ORDER_BASED',       'decor@homestyle.com',        '+1-555-0109', '2020-09-30 10:00:00'),
(10, 'SportsZone',     'Sporting goods and equipment',    'ORDER_BASED',       'gear@sportszone.com',        '+1-555-0110', '2020-10-25 07:45:00'),
(11, 'FlowerBoutique', 'Floral shop and arrangements',    'ORDER_BASED',       'bloom@flowerboutique.com',   '+1-555-0111', '2020-11-05 09:00:00'),
(12, 'TechRepair',     'Electronic device repair',        'APPOINTMENT_BASED', 'support@techrepair.com',     '+1-555-0112', '2020-11-15 10:00:00'),
(13, 'YogaStudio',     'Yoga classes and wellness',       'APPOINTMENT_BASED', 'contact@yogastudio.com',     '+1-555-0113', '2020-12-01 08:30:00'),
(14, 'GadgetHub',      'Tech gadgets and accessories',   'ORDER_BASED',       'info@gadgethub.com',         '+1-555-0114', '2020-12-10 09:45:00'),
(15, 'PetWellness',    'Veterinary and pet wellness',     'APPOINTMENT_BASED', 'care@petwellness.com',       '+1-555-0115', '2020-12-20 11:00:00');

-- ------------------------------------------------------------------------------------------------
-- Employee Data --------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------

INSERT INTO employee (id, first_name, last_name, password_hash, email, phone, created_at, business_id) VALUES
(1,  'John',      'Smith',      'hashed_password_123', 'john.smith@supermart.com',        '+1-555-1001', '2020-02-01 09:00:00', 1),
(2,  'Sarah',     'Johnson',    'hashed_password_456', 'sarah.johnson@techgadgets.com', '+1-555-1002', '2020-03-01 09:00:00', 2),
(3,  'Maria',     'Garcia',     'hashed_password_789', 'maria.garcia@beautysalon.com',  '+1-555-1003', '2020-04-01 09:00:00', 3),
(4,  'David',     'Brown',      'hashed_password_101', 'david.brown@fitnesscenter.com', '+1-555-1004', '2020-05-01 09:00:00', 4),
(5,  'Emma',      'Wilson',     'hashed_password_102', 'emma.wilson@coffeehub.com',     '+1-555-1005', '2020-06-01 09:00:00', 5),
(6,  'James',     'Davis',      'hashed_password_103', 'james.davis@booknook.com',      '+1-555-1006', '2020-07-01 09:00:00', 6),
(7,  'Lisa',      'Miller',     'hashed_password_104', 'lisa.miller@autocare.com',      '+1-555-1007', '2020-08-01 09:00:00', 7),
(8,  'Robert',    'Taylor',     'hashed_password_105', 'robert.taylor@petparadise.com', '+1-555-1008', '2020-09-01 09:00:00', 8),
(9,  'Jennifer',  'Anderson',   'hashed_password_106', 'jennifer.anderson@homestyle.com','+1-555-1009', '2020-10-01 09:00:00', 9),
(10, 'Michael',   'Thomas',     'hashed_password_107', 'michael.thomas@sportszone.com', '+1-555-1010', '2020-11-01 09:00:00', 10),
(11, 'Olivia',    'Martinez',   'hashed_password_108', 'olivia.martinez@flowerboutique.com', '+1-555-1011', '2020-11-10 09:00:00', 11),
(12, 'Daniel',    'Lopez',      'hashed_password_109', 'daniel.lopez@techrepair.com',  '+1-555-1012', '2020-11-20 09:00:00', 12),
(13, 'Sophia',    'Gonzalez',   'hashed_password_110', 'sophia.gonzalez@yogastudio.com','+1-555-1013', '2020-12-01 09:00:00', 13),
(14, 'Ethan',     'Wilson',     'hashed_password_111', 'ethan.wilson@gadgethub.com',  '+1-555-1014', '2020-12-10 09:00:00', 14),
(15, 'Ava',       'Anderson',   'hashed_password_112', 'ava.anderson@petwellness.com','+1-555-1015', '2020-12-20 09:00:00', 15);

INSERT INTO work_shift (id, day_of_the_week, start_time, end_time) VALUES
(1, 'MONDAY', '08:00:00', '16:00:00'),
(2, 'MONDAY', '12:00:00', '20:00:00'),
(3, 'TUESDAY', '08:00:00', '16:00:00'),
(4, 'TUESDAY', '12:00:00', '20:00:00'),
(5, 'WEDNESDAY', '08:00:00', '16:00:00'),
(6, 'WEDNESDAY', '12:00:00', '20:00:00'),
(7, 'THURSDAY', '08:00:00', '16:00:00'),
(8, 'THURSDAY', '12:00:00', '20:00:00'),
(9, 'FRIDAY', '08:00:00', '16:00:00'),
(10, 'FRIDAY', '12:00:00', '20:00:00'),
(11, 'SATURDAY', '09:00:00', '17:00:00'),
(12, 'SATURDAY', '13:00:00', '21:00:00'),
(13, 'SUNDAY', '10:00:00', '18:00:00'),
(14, 'SUNDAY', '12:00:00', '20:00:00'),
(15, 'MONDAY', '06:00:00', '14:00:00'),
(16, 'TUESDAY', '06:00:00', '14:00:00'),
(17, 'WEDNESDAY', '06:00:00', '14:00:00'),
(18, 'THURSDAY', '06:00:00', '14:00:00'),
(19, 'FRIDAY', '06:00:00', '14:00:00'),
(20, 'SATURDAY', '07:00:00', '15:00:00'),
(21, 'SUNDAY', '08:00:00', '16:00:00'),
(22, 'MONDAY', '14:00:00', '22:00:00'),
(23, 'TUESDAY', '14:00:00', '22:00:00'),
(24, 'WEDNESDAY', '14:00:00', '22:00:00'),
(25, 'THURSDAY', '14:00:00', '22:00:00'),
(26, 'FRIDAY', '14:00:00', '22:00:00'),
(27, 'SATURDAY', '15:00:00', '23:00:00'),
(28, 'SUNDAY', '14:00:00', '22:00:00');

INSERT INTO employee_shift (user_id, work_shift_id) VALUES
(1, 1), (1, 2), (1, 8), (1, 15), (1, 22),
(2, 3), (2, 4), (2, 9), (2, 16), (2, 23),
(3, 5), (3, 6), (3, 11), (3, 18), (3, 25),
(4, 7), (4, 8), (4, 12), (4, 19), (4, 26),
(5, 9), (5, 10), (5, 13), (5, 20), (5, 27),
(6, 11), (6, 12), (6, 14), (6, 21), (6, 28),
(7, 13), (7, 14), (7, 15), (7, 22), (7, 23),
(8, 16), (8, 17), (8, 18), (8, 24), (8, 25),
(9, 19), (9, 20), (9, 21), (9, 26), (9, 27),
(10, 22), (10, 23), (10, 24), (10, 28), (10, 1);

-- ------------------------------------------------------------------------------------------------
-- Authentication ---------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------

INSERT INTO token (id, user_id, token, created_at, expired_at) VALUES
(1, 1, 'token_abc123', '2024-01-15 09:00:00', '2024-01-15 17:00:00'),
(2, 2, 'token_def456', '2024-01-15 10:00:00', '2024-01-15 18:00:00'),
(3, 3, 'token_ghi789', '2024-01-15 08:30:00', '2024-01-15 16:30:00'),
(4, 4, 'token_jkl012', '2024-01-16 09:15:00', '2024-01-16 17:15:00'),
(5, 5, 'token_mno345', '2024-01-16 10:45:00', '2024-01-16 18:45:00'),
(6, 6, 'token_pqr678', '2024-01-17 09:00:00', '2024-01-17 17:00:00'),
(7, 7, 'token_stu901', '2024-01-17 10:30:00', '2024-01-17 18:30:00'),
(8, 8, 'token_vwx234', '2024-01-18 08:45:00', '2024-01-18 16:45:00'),
(9, 9, 'token_yza567', '2024-01-18 09:15:00', '2024-01-18 17:15:00'),
(10, 10, 'token_bcd890', '2024-01-19 10:00:00', '2024-01-19 18:00:00');


-- ------------------------------------------------------------------------------------------------
-- Location data ----------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------

INSERT INTO location (id, business_id, country_code, city, street, postal_code) VALUES
(1, 1, 'US', 'New York', '123 Main St', '10001'),
(2, 1, 'US', 'Los Angeles', '456 Oak Ave', '90001'),
(3, 2, 'US', 'Chicago', '789 Tech Blvd', '60007'),
(4, 3, 'US', 'Miami', '321 Beauty Lane', '33101'),
(5, 4, 'US', 'Seattle', '654 Fitness Rd', '98101'),
(6, 5, 'US', 'Austin', '987 Coffee St', '73301'),
(7, 6, 'US', 'Boston', '159 Book Ave', '02101'),
(8, 7, 'US', 'Denver', '753 Auto St', '80201'),
(9, 8, 'US', 'Phoenix', '486 Pet Way', '85001'),
(10, 9, 'US', 'Atlanta', '264 Home St', '30301');

INSERT INTO location_open (location_id, day_of_the_week, open_at, closes_at) VALUES
(1, 'MONDAY', '08:00:00', '21:00:00'),
(1, 'TUESDAY', '08:00:00', '21:00:00'),
(1, 'WEDNESDAY', '08:00:00', '21:00:00'),
(1, 'THURSDAY', '08:00:00', '21:00:00'),
(1, 'FRIDAY', '08:00:00', '22:00:00'),
(1, 'SATURDAY', '09:00:00', '22:00:00'),
(1, 'SUNDAY', '10:00:00', '20:00:00'),
(2, 'MONDAY', '09:00:00', '20:00:00'),
(2, 'TUESDAY', '09:00:00', '20:00:00'),
(2, 'WEDNESDAY', '09:00:00', '20:00:00'),
(2, 'THURSDAY', '09:00:00', '20:00:00'),
(2, 'FRIDAY', '09:00:00', '21:00:00'),
(2, 'SATURDAY', '10:00:00', '21:00:00'),
(2, 'SUNDAY', '10:00:00', '20:00:00'),
(3, 'MONDAY', '10:00:00', '20:00:00'),
(4, 'MONDAY', '08:00:00', '19:00:00'),
(5, 'MONDAY', '09:00:00', '21:00:00'),
(5, 'TUESDAY', '09:00:00', '21:00:00'),
(5, 'WEDNESDAY', '09:00:00', '21:00:00'),
(5, 'THURSDAY', '09:00:00', '21:00:00'),
(5, 'FRIDAY', '09:00:00', '22:00:00'),
(5, 'SATURDAY', '10:00:00', '22:00:00'),
(5, 'SUNDAY', '10:00:00', '20:00:00'),
(6, 'MONDAY', '08:00:00', '20:00:00'),
(6, 'TUESDAY', '08:00:00', '20:00:00'),
(6, 'WEDNESDAY', '08:00:00', '20:00:00'),
(6, 'THURSDAY', '08:00:00', '20:00:00'),
(6, 'FRIDAY', '08:00:00', '21:00:00'),
(6, 'SATURDAY', '09:00:00', '21:00:00'),
(6, 'SUNDAY', '10:00:00', '20:00:00');

-- ------------------------------------------------------------------------------------------------
-- Service data------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------

INSERT INTO service (id, business_id, name, duration_mins) VALUES
(1, 3, 'Haircut', 60),
(2, 3, 'Manicure', 45),
(3, 3, 'Facial', 90),
(4, 4, 'Personal Training', 60),
(5, 4, 'Yoga Class', 75),
(6, 7, 'Oil Change', 30),
(7, 7, 'Tire Rotation', 45),
(8, 8, 'Pet Grooming', 120),
(9, 8, 'Nail Trimming', 30),
(10, 3, 'Hair Color', 120);

INSERT INTO service_location (id, location_id, service_id, price) VALUES
(1, 4, 1, '("USD", 4500)'),
(2, 4, 2, '("USD", 3500)'),
(3, 4, 3, '("USD", 8000)'),
(4, 5, 4, '("USD", 7500)'),
(5, 5, 5, '("USD", 2500)'),
(6, 8, 6, '("USD", 6000)'),
(7, 8, 7, '("USD", 4000)'),
(8, 9, 8, '("USD", 5500)'),
(9, 9, 9, '("USD", 2000)'),
(10, 4, 10, '("USD", 12000)');

INSERT INTO service_employee (service_location_id, employee_id) VALUES
(1, 3), (2, 3), (3, 3), (10, 3),
(4, 4), (5, 4),
(6, 7), (7, 7),
(8, 8), (9, 8);

-- ------------------------------------------------------------------------------------------------
-- Order ------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------

INSERT INTO order_data (id, employee_id, created_at, status, discount_amount, tip_amount, service_charge) VALUES
(1, 1, '2024-01-15 10:30:00', 'CLOSED', '("USD", 0)', '("USD", 500)', '("USD", 0)'),
(2, 2, '2024-01-15 11:15:00', 'OPEN', '("USD", 1000)', '("USD", 300)', '("USD", 0)'),
(3, 5, '2024-01-15 12:00:00', 'CLOSED', '("USD", 0)', '("USD", 200)', '("USD", 0)'),
(4, 6, '2024-01-15 14:30:00', 'OPEN', '("USD", 500)', '("USD", 400)', '("USD", 0)'),
(5, 9, '2024-01-15 15:45:00', 'CLOSED', '("USD", 1500)', '("USD", 600)', '("USD", 0)'),
(6, 3, '2024-01-16 09:20:00', 'CLOSED', '("USD", 200)', '("USD", 100)', '("USD", 0)'),
(7, 4, '2024-01-16 10:50:00', 'OPEN', '("USD", 0)', '("USD", 350)', '("USD", 0)'),
(8, 7, '2024-01-16 11:30:00', 'CLOSED', '("USD", 300)', '("USD", 250)', '("USD", 0)'),
(9, 8, '2024-01-16 12:45:00', 'OPEN', '("USD", 0)', '("USD", 150)', '("USD", 0)'),
(10, 10, '2024-01-16 13:10:00', 'CLOSED', '("USD", 400)', '("USD", 500)', '("USD", 0)'),
(11, 1, '2024-01-16 14:05:00', 'OPEN', '("USD", 0)', '("USD", 200)', '("USD", 0)'),
(12, 2, '2024-01-16 15:20:00', 'CLOSED', '("USD", 500)', '("USD", 300)', '("USD", 0)'),
(13, 3, '2024-01-16 16:00:00', 'OPEN', '("USD", 0)', '("USD", 100)', '("USD", 0)'),
(14, 5, '2024-01-16 16:45:00', 'CLOSED', '("USD", 800)', '("USD", 400)', '("USD", 0)'),
(15, 6, '2024-01-16 17:30:00', 'OPEN', '("USD", 0)', '("USD", 350)', '("USD", 0)'),
(16, 7, '2024-01-16 18:10:00', 'CLOSED', '("USD", 200)', '("USD", 150)', '("USD", 0)'),
(17, 8, '2024-01-16 19:05:00', 'OPEN', '("USD", 0)', '("USD", 400)', '("USD", 0)'),
(18, 9, '2024-01-16 19:50:00', 'CLOSED', '("USD", 600)', '("USD", 500)', '("USD", 0)'),
(19, 10, '2024-01-16 20:30:00', 'OPEN', '("USD", 0)', '("USD", 250)', '("USD", 0)'),
(20, 1, '2024-01-16 21:10:00', 'CLOSED', '("USD", 100)', '("USD", 100)', '("USD", 0)');


INSERT INTO item (id, name, location_id, price_per_unit, vat) VALUES
(1, 'Bread', 1, '("USD", 350)', 0.08),
(2, 'Milk', 1, '("USD", 450)', 0.08),
(3, 'Smartphone', 3, '("USD", 99900)', 0.08),
(4, 'Laptop', 3, '("USD", 129900)', 0.08),
(5, 'Coffee', 6, '("USD", 450)', 0.08),
(6, 'Croissant', 6, '("USD", 350)', 0.08),
(7, 'Novel', 7, '("USD", 1599)', 0.08),
(8, 'Textbook', 7, '("USD", 8999)', 0.08),
(9, 'Throw Pillow', 10, '("USD", 2499)', 0.08),
(10, 'Desk Lamp', 10, '("USD", 3499)', 0.08),
(11, 'Orange Juice', 1, '("USD", 550)', 0.08),
(12, 'Cheese', 1, '("USD", 799)', 0.08),
(13, 'Headphones', 3, '("USD", 4999)', 0.08),
(14, 'Tablet', 3, '("USD", 19999)', 0.08),
(15, 'Tea', 6, '("USD", 300)', 0.08),
(16, 'Bagel', 6, '("USD", 250)', 0.08),
(17, 'Magazine', 7, '("USD", 499)', 0.08),
(18, 'Notebook', 7, '("USD", 699)', 0.08),
(19, 'Cushion', 10, '("USD", 1999)', 0.08),
(20, 'Wall Clock', 10, '("USD", 4999)', 0.08),
(21, 'Banana', 1, '("USD", 120)', 0.08),
(22, 'Yogurt', 1, '("USD", 300)', 0.08),
(23, 'Smartwatch', 3, '("USD", 15999)', 0.08),
(24, 'Monitor', 3, '("USD", 24999)', 0.08),
(25, 'Espresso', 6, '("USD", 400)', 0.08),
(26, 'Muffin', 6, '("USD", 300)', 0.08),
(27, 'Comic Book', 7, '("USD", 899)', 0.08),
(28, 'Guidebook', 7, '("USD", 1299)', 0.08),
(29, 'Candle', 10, '("USD", 999)', 0.08),
(30, 'Table Runner', 10, '("USD", 1499)', 0.08);


INSERT INTO item_variation (id, item_id, name, price_difference) VALUES
(1, 5, 'Large', '("USD", 100)'),
(2, 5, 'Iced', '("USD", 50)'),
(3, 6, 'Chocolate', '("USD", 100)'),
(4, 6, 'Almond', '("USD", 150)'),
(5, 3, '256GB', '("USD", 10000)'),
(6, 3, '512GB', '("USD", 20000)'),
(7, 3, '1TB', '("USD", 40000)'),
(8, 4, '8GB RAM', '("USD", 5000)'),
(9, 4, '16GB RAM', '("USD", 10000)'),
(10, 4, '32GB RAM', '("USD", 20000)'),
(11, 1, 'Whole Wheat', '("USD", 50)'),
(12, 1, 'Gluten Free', '("USD", 100)'),
(13, 2, 'Skim', '("USD", 0)'),
(14, 2, 'Full Fat', '("USD", 50)'),
(15, 5, 'Medium', '("USD", 0)'),
(16, 6, 'Vanilla', '("USD", 100)'),
(17, 7, 'Hardcover', '("USD", 200)'),
(18, 7, 'Paperback', '("USD", 0)'),
(19, 8, 'New Edition', '("USD", 500)'),
(20, 8, 'Used', '("USD", -200)');

INSERT INTO order_item (id, order_id, item_id, quantity, discount_amount, tip_amount, vat) VALUES
(1, 1, 1, 2, '("USD", 0)', '("USD", 0)', '("USD", 56)'),
(2, 1, 2, 1, '("USD", 0)', '("USD", 0)', '("USD", 36)'),
(3, 2, 3, 1, '("USD", 1000)', '("USD", 0)', '("USD", 7912)'),
(4, 3, 5, 3, '("USD", 0)', '("USD", 0)', '("USD", 108)'),
(5, 3, 6, 2, '("USD", 0)', '("USD", 0)', '("USD", 56)'),
(6, 4, 7, 1, '("USD", 500)', '("USD", 0)', '("USD", 88)'),
(7, 5, 9, 4, '("USD", 1500)', '("USD", 0)', '("USD", 768)'),
(8, 2, 4, 1, '("USD", 0)', '("USD", 50)', '("USD", 1039)'),
(9, 2, 5, 2, '("USD", 0)', '("USD", 25)', '("USD", 72)'),
(10, 3, 1, 1, '("USD", 0)', '("USD", 0)', '("USD", 28)'),
(11, 4, 2, 2, '("USD", 0)', '("USD", 0)', '("USD", 72)'),
(12, 4, 6, 1, '("USD", 0)', '("USD", 0)', '("USD", 28)'),
(13, 5, 7, 1, '("USD", 0)', '("USD", 0)', '("USD", 88)'),
(14, 5, 8, 1, '("USD", 0)', '("USD", 0)', '("USD", 720)'),
(15, 1, 3, 2, '("USD", 0)', '("USD", 0)', '("USD", 15824)'),
(16, 2, 9, 1, '("USD", 0)', '("USD", 0)', '("USD", 192)'),
(17, 3, 10, 2, '("USD", 0)', '("USD", 0)', '("USD", 700)');


INSERT INTO order_item_variation (order_item_id, variation_id) VALUES
(4, 1),(4, 2),(5, 3),(5, 4),(6, 1),(6, 2),(7, 3),(7, 4),(8, 5),(8, 6),(9, 5),(9, 6),(10, 1),(11, 2),(12, 3),(13, 4),(14, 5),(15, 6),(16, 1),(17, 2);


-- ------------------------------------------------------------------------------------------------
-- Discount data-----------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------

INSERT INTO discount_details (id, business_id, percantage, amount, starts_at, ends_at) VALUES
(1, 1, 0.10, NULL, '2024-01-01 00:00:00', '2024-12-31 23:59:59'),
(2, 2, NULL, '("USD", 1000)', '2024-01-15 00:00:00', '2024-01-31 23:59:59'),
(3, 5, 0.15, NULL, '2024-01-01 00:00:00', '2024-01-31 23:59:59'),
(4, 6, NULL, '("USD", 500)', '2024-01-10 00:00:00', '2024-01-20 23:59:59'),
(5, 9, 0.20, NULL, '2024-01-01 00:00:00', '2024-02-29 23:59:59'),
(6, 3, 0.05, NULL, '2024-02-01 00:00:00', '2024-02-28 23:59:59'),
(7, 4, NULL, '("USD", 750)', '2024-02-10 00:00:00', '2024-03-10 23:59:59'),
(8, 7, 0.12, NULL, '2024-03-01 00:00:00', '2024-03-31 23:59:59'),
(9, 8, NULL, '("USD", 300)', '2024-03-05 00:00:00', '2024-03-20 23:59:59'),
(10, 10, 0.25, NULL, '2024-04-01 00:00:00', '2024-04-30 23:59:59'),
(11, 1, NULL, '("USD", 200)', '2024-05-01 00:00:00', '2024-05-31 23:59:59'),
(12, 2, 0.18, NULL, '2024-06-01 00:00:00', '2024-06-30 23:59:59'),
(13, 5, NULL, '("USD", 600)', '2024-07-01 00:00:00', '2024-07-15 23:59:59'),
(14, 6, 0.07, NULL, '2024-08-01 00:00:00', '2024-08-31 23:59:59'),
(15, 9, NULL, '("USD", 1200)', '2024-09-01 00:00:00', '2024-09-30 23:59:59');

INSERT INTO item_discount (item_id, details_id) VALUES
(1, 1),
(2, 1),
(3, 2),
(4, 2),
(5, 3),
(6, 3),
(7, 4),
(8, 4),
(9, 5),
(10, 5),
(1, 3),
(5, 1),
(6, 2),
(8, 5),
(3, 5);

INSERT INTO order_discount (details_id) VALUES
(1),
(2),
(3),
(4),
(5);

-- -------------------------------------------------------------------------------------------------
-- Appointment data---------------------------------------------------------------------------------
-- -------------------------------------------------------------------------------------------------

INSERT INTO appointment (id, service_location_id, actioned_by, customer_name, customer_surname, customer_email, customer_phone, appointment_at, status) VALUES
(1, 1, 3, 'Alice', 'Johnson', 'alice.johnson@email.com', '+1-555-2001', '2024-01-16 10:00:00', 'RESERVED'),
(2, 4, 4, 'Bob', 'Smith', 'bob.smith@email.com', '+1-555-2002', '2024-01-16 14:00:00', 'SERVING'),
(3, 6, 7, 'Carol', 'Williams', 'carol.williams@email.com', '+1-555-2003', '2024-01-17 09:30:00', 'PAID'),
(4, 8, 8, 'David', 'Brown', 'david.brown@email.com', '+1-555-2004', '2024-01-18 11:00:00', 'CANCELLED'),
(5, 2, 3, 'Eva', 'Davis', 'eva.davis@email.com', '+1-555-2005', '2024-01-19 15:30:00', 'RESERVED'),
(6, 5, 1, 'Frank', 'Miller', 'frank.miller@email.com', '+1-555-2006', '2024-01-20 10:15:00', 'RESERVED'),
(7, 7, 2, 'Grace', 'Wilson', 'grace.wilson@email.com', '+1-555-2007', '2024-01-21 13:00:00', 'SERVING'),
(8, 3, 4, 'Henry', 'Moore', 'henry.moore@email.com', '+1-555-2008', '2024-01-22 09:45:00', 'PAID'),
(9, 1, 5, 'Ivy', 'Taylor', 'ivy.taylor@email.com', '+1-555-2009', '2024-01-23 16:00:00', 'CANCELLED'),
(10, 6, 6, 'Jack', 'Anderson', 'jack.anderson@email.com', '+1-555-2010', '2024-01-24 11:30:00', 'RESERVED'),
(11, 2, 1, 'Karen', 'Harris', 'karen.harris@email.com', '+1-555-2011', '2024-01-25 10:00:00', 'RESERVED'),
(12, 4, 2, 'Leo', 'Martin', 'leo.martin@email.com', '+1-555-2012', '2024-01-25 14:30:00', 'SERVING'),
(13, 5, 3, 'Mia', 'Jackson', 'mia.jackson@email.com', '+1-555-2013', '2024-01-26 09:15:00', 'PAID'),
(14, 3, 4, 'Noah', 'White', 'noah.white@email.com', '+1-555-2014', '2024-01-26 11:00:00', 'CANCELLED'),
(15, 7, 5, 'Olivia', 'Lewis', 'olivia.lewis@email.com', '+1-555-2015', '2024-01-27 15:30:00', 'RESERVED'),
(16, 1, 6, 'Peter', 'Walker', 'peter.walker@email.com', '+1-555-2016', '2024-01-28 10:45:00', 'SERVING'),
(17, 6, 7, 'Quinn', 'Hall', 'quinn.hall@email.com', '+1-555-2017', '2024-01-28 13:00:00', 'PAID'),
(18, 2, 8, 'Rachel', 'Allen', 'rachel.allen@email.com', '+1-555-2018', '2024-01-29 09:30:00', 'RESERVED'),
(19, 5, 1, 'Samuel', 'Young', 'samuel.young@email.com', '+1-555-2019', '2024-01-29 16:00:00', 'CANCELLED'),
(20, 3, 2, 'Tina', 'King', 'tina.king@email.com', '+1-555-2020', '2024-01-30 11:15:00', 'SERVING');

INSERT INTO appointment_bill (id, appointment_id, discount_id, tip_amount, created_at) VALUES
(1, 3, 2, '("USD", 1000)', '2024-01-17 10:15:00'),
(2, 1, 1, '("USD", 800)', '2024-01-16 10:45:00'),
(3, 2, NULL, '("USD", 500)', '2024-01-16 15:00:00'),
(4, 4, NULL, '("USD", 0)', '2024-01-18 11:30:00'),
(5, 5, 3, '("USD", 300)', '2024-01-19 16:00:00'),
(6, 11, 1, '("USD", 400)', '2024-01-25 10:30:00'),
(7, 12, NULL, '("USD", 600)', '2024-01-25 15:00:00'),
(8, 13, 2, '("USD", 200)', '2024-01-26 09:45:00'),
(9, 14, NULL, '("USD", 0)', '2024-01-26 11:30:00'),
(10, 15, 3, '("USD", 500)', '2024-01-27 16:00:00'),
(11, 16, 1, '("USD", 300)', '2024-01-28 11:15:00'),
(12, 17, 2, '("USD", 250)', '2024-01-28 13:30:00'),
(13, 18, NULL, '("USD", 150)', '2024-01-29 10:00:00'),
(14, 19, 3, '("USD", 0)', '2024-01-29 16:30:00'),
(15, 20, NULL, '("USD", 400)', '2024-01-30 11:45:00');

COMMIT TRANSACTION;
