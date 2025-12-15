BEGIN TRANSACTION;

-- ================================================================================================
-- 1. STATIC LOOKUP DATA
-- ================================================================================================

-- Roles
INSERT INTO role (id, name) VALUES 
(1, 'OWNER'), (2, 'MANAGER'), (3, 'CASHIER'), (4, 'STYLIST'), (5, 'RECEPTIONIST');

-- Permissions
INSERT INTO permissions (id, name) VALUES 
(1, 'FULL_ADMIN'), (2, 'VIEW_REPORTS'), (3, 'CREATE_ORDER'), (4, 'MANAGE_STOCK'), (5, 'BOOK_APPOINTMENT');

-- Role <> Permissions
INSERT INTO role_permission (role_id, permission_id) VALUES 
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), -- Owner
(2, 2), (2, 3), (2, 4), (2, 5),         -- Manager
(3, 3), (3, 4),                         -- Barista
(4, 3), (4, 5),                         -- Stylist
(5, 3), (5, 5);                         -- Receptionist

-- Currencies
INSERT INTO currency_info (code, name, symbol) VALUES 
('USD', 'US Dollar', '$'), 
('EUR', 'Euro', '€'), 
('GBP', 'British Pound', '£'),
('CAD', 'Canadian Dollar', 'C$'),
('AUD', 'Australian Dollar', 'A$');

-- Countries
INSERT INTO country (code, name, currency, vat) VALUES 
('US', 'United States', 'USD', 8.00),
('DE', 'Germany', 'EUR', 19.00),
('GB', 'United Kingdom', 'GBP', 20.00),
('CA', 'Canada', 'CAD', 13.00),
('AU', 'Australia', 'AUD', 10.00);

-- ================================================================================================
-- 2. BUSINESSES
-- ================================================================================================

INSERT INTO business (id, name, description, type, email, phone, created_at) VALUES 
(1, 'Morning Roast', 'Premium Coffee Shop', 'ORDER_BASED', 'contact@morningroast.com', '+15550001', NOW() - INTERVAL '365 days'),
(2, 'Urban Cuts', 'Modern Hair Salon', 'APPOINTMENT_BASED', 'info@urbancuts.com', '+15550002', NOW() - INTERVAL '300 days'),
(3, 'Tech Gadgets', 'Electronics Retail', 'ORDER_BASED', 'sales@techgadgets.com', '+15550003', NOW() - INTERVAL '250 days'),
(4, 'Serenity Spa', 'Wellness and Massage', 'APPOINTMENT_BASED', 'relax@serenity.com', '+15550004', NOW() - INTERVAL '200 days'),
(5, 'Burger Joint', 'Fast Food Restaurant', 'ORDER_BASED', 'food@burgerjoint.com', '+15550005', NOW() - INTERVAL '150 days');

-- ================================================================================================
-- 3. LOCATIONS (2 Per Business)
-- ================================================================================================

INSERT INTO location (id, business_id, country_code, city, street, postal_code) VALUES 
-- Morning Roast Locations
(1, 1, 'US', 'Seattle', 'Pike Place', '98101'),
(2, 1, 'US', 'Portland', 'Pearl District', '97209'),
-- Urban Cuts Locations
(3, 2, 'GB', 'London', 'Oxford Street', 'W1D 1BS'),
(4, 2, 'GB', 'Manchester', 'Market Street', 'M1 1WR'),
-- Tech Gadgets Locations
(5, 3, 'DE', 'Berlin', 'Alexanderplatz', '10178'),
(6, 3, 'DE', 'Munich', 'Marienplatz', '80331'),
-- Serenity Spa Locations
(7, 4, 'CA', 'Toronto', 'Queen Street West', 'M5V 2A2'),
(8, 4, 'CA', 'Vancouver', 'Robson Street', 'V6B 2B2'),
-- Burger Joint Locations
(9, 5, 'AU', 'Sydney', 'George Street', '2000'),
(10, 5, 'AU', 'Melbourne', 'Bourke Street', '3000');

-- Location Opening Times (Sample)
INSERT INTO location_open (location_id, day_of_the_week, open_at, closes_at) VALUES 
(1, 'MONDAY', '06:00', '20:00'), (1, 'TUESDAY', '06:00', '20:00'),
(2, 'MONDAY', '07:00', '19:00'), (2, 'TUESDAY', '07:00', '19:00'),
(3, 'MONDAY', '09:00', '18:00'), (3, 'TUESDAY', '09:00', '18:00'),
(4, 'MONDAY', '10:00', '20:00'), (4, 'TUESDAY', '10:00', '20:00'),
(9, 'FRIDAY', '11:00', '23:00'), (10, 'SATURDAY', '11:00', '23:00');

-- ================================================================================================
-- 4. EMPLOYEES & SHIFTS
-- ================================================================================================

INSERT INTO employee (id, username, first_name, last_name, password_hash, email, phone, created_at, location_id) VALUES 
-- Morning Roast
(1, 'jbean', 'James', 'Bean', '$2a$14$ajq8Q7fbtFRQvXpdCq7Jcuy.Rx1h/L4J60Otx.gyNLbAYctGMJ9tK', 'james@morningroast.com', '+15551001', NOW() - INTERVAL '360 days', 1),
(2, 'slatte', 'Sarah', 'Latte', '$2a$14$ajq8Q7fbtFRQvXpdCq7Jcuy.Rx1h/L4J60Otx.gyNLbAYctGMJ9tK', 'sarah@morningroast.com', '+15551002', NOW() - INTERVAL '350 days', 1),
-- Urban Cuts
(3, 'hclipper', 'Harry', 'Clipper', '$2a$14$ajq8Q7fbtFRQvXpdCq7Jcuy.Rx1h/L4J60Otx.gyNLbAYctGMJ9tK', 'harry@urbancuts.com', '+15552001', NOW() - INTERVAL '290 days', 2),
(4, 'sallystyle', 'Sally', 'Style', '$2a$14$ajq8Q7fbtFRQvXpdCq7Jcuy.Rx1h/L4J60Otx.gyNLbAYctGMJ9tK', 'sally@urbancuts.com', '+15552002', NOW() - INTERVAL '280 days', 2),
-- Tech Gadgets
(5, 'ggeek', 'Gary', 'Geek', '$2a$14$ajq8Q7fbtFRQvXpdCq7Jcuy.Rx1h/L4J60Otx.gyNLbAYctGMJ9tK', 'gary@techgadgets.com', '+15553001', NOW() - INTERVAL '240 days', 3),
(6, 'lt06', 'Lisa', 'Tech', '$2a$14$ajq8Q7fbtFRQvXpdCq7Jcuy.Rx1h/L4J60Otx.gyNLbAYctGMJ9tK', 'lisa@techgadgets.com', '+15553002', NOW() - INTERVAL '230 days', 3),
-- Serenity Spa
(7, 'mindym', 'Mindy', 'Massage', '$2a$14$ajq8Q7fbtFRQvXpdCq7Jcuy.Rx1h/L4J60Otx.gyNLbAYctGMJ9tK', 'mindy@serenity.com', '+15554001', NOW() - INTERVAL '190 days', 4),
(8, 'zenmaster', 'Zen', 'Master', '$2a$14$ajq8Q7fbtFRQvXpdCq7Jcuy.Rx1h/L4J60Otx.gyNLbAYctGMJ9tK', 'zen@serenity.com', '+15554002', NOW() - INTERVAL '180 days', 4),
-- Burger Joint
(9, 'flipperpatty', 'Patty', 'Flipper', '$2a$14$ajq8Q7fbtFRQvXpdCq7Jcuy.Rx1h/L4J60Otx.gyNLbAYctGMJ9tK', 'patty@burgerjoint.com', '+15555001', NOW() - INTERVAL '140 days', 5),
(10, 'cashier1', 'Bun', 'Toaster', '$2a$12$k8sRjlINxLzAiakxjM1x6OdLT4oZRd23YQCSd/zvha4nXUHMCMDOy', 'bun@burgerjoint.com', '+15555002', NOW() - INTERVAL '130 days', 5),
(11, 'manager1', 'mr', 'manager', '$2a$12$k8sRjlINxLzAiakxjM1x6OdLT4oZRd23YQCSd/zvha4nXUHMCMDOy', 'bu@burgerjoint.com', '+15555003', NOW() - INTERVAL '230 days', 5);

INSERT INTO work_shift (id, day_of_the_week, start_time, end_time) VALUES 
(1, 'MONDAY', '08:00', '16:00'),
(2, 'MONDAY', '16:00', '23:00'),
(3, 'TUESDAY', '09:00', '17:00'),
(4, 'WEDNESDAY', '09:00', '17:00'),
(5, 'FRIDAY', '10:00', '18:00');

INSERT INTO employee_shift (user_id, work_shift_id) VALUES 
(1, 1), (2, 2), (3, 3), (4, 3), (5, 4), (6, 4), (7, 5), (8, 5), (9, 1), (10, 2);

-- Employee Roles (must be after employees are inserted)
INSERT INTO employee_role (employee_id, role_id) VALUES
(10, 3),
(11, 2)
;

-- ================================================================================================
-- 5. ITEMS & INVENTORY (For Order-Based Businesses)
-- ================================================================================================

INSERT INTO item (id, name, location_id, price_per_unit, vat, status) VALUES 
-- Morning Roast Items (Loc 1 & 2)
(1, 'House Blend Coffee', 1, 300, 8.00, 'ACTIVE'),
(2, 'Espresso Shot', 1, 250, 8.00, 'ACTIVE'),
(3, 'Blueberry Muffin', 1, 350, 8.00, 'ACTIVE'),
(4, 'Bagel with Cream Cheese', 2, 400, 8.00, 'ACTIVE'),
(5, 'Iced Latte', 2, 450, 8.00, 'ACTIVE'),
-- Tech Gadgets Items (Loc 5 & 6)
(6, 'USB-C Cable', 5, 1500, 19.00, 'ACTIVE'),
(7, 'Wireless Mouse', 5, 2500, 19.00, 'ACTIVE'),
(8, 'Mechanical Keyboard', 6, 12000, 19.00, 'ACTIVE'),
(9, 'HDMI Adapter', 6, 2000, 19.00, 'ACTIVE'),
-- Burger Joint Items (Loc 9 & 10)
(10, 'Cheeseburger', 9, 800, 10.00, 'ACTIVE'),
(11, 'Fries', 9, 400, 10.00, 'ACTIVE'),
(12, 'Soda', 9, 250, 10.00, 'ACTIVE'),
(13, 'Double Burger', 10, 1100, 10.00, 'ACTIVE'),
(14, 'Onion Rings', 10, 500, 10.00, 'ACTIVE');

-- Item Variations
INSERT INTO item_variation (id, item_id, name, price_difference) VALUES 
(1, 1, 'Small', 0),
(2, 1, 'Large', 50),
(3, 5, 'Small', 0),
(4, 5, 'Large', 50),
(5, 5, 'Oat Milk', 50),
(6, 5, 'Almond Milk', 50),
(7, 11, 'Small', 0),
(8, 11, 'Large', 150);

-- Category
INSERT INTO category (id, name) VALUES
(1, 'hot drinks'),
(2, 'cold drinks'),
(3, 'pastries'),
(4, 'accessories'),
(5, 'peripherals'),
(6, 'burgers'),
(7, 'sides'),
(8, 'beverages');

INSERT INTO item_category (item_id, category_id) VALUES
-- Morning Roast Items
(1, 1), -- House Blend Coffee -> Hot Drinks
(2, 1), -- Espresso Shot -> Hot Drinks
(3, 3), -- Blueberry Muffin -> Pastries
(4, 3), -- Bagel with Cream Cheese -> Pastries
(5, 2), -- Iced Latte -> Cold Drinks

-- Tech Gadgets Items
(6, 4), -- USB-C Cable -> Accessories
(7, 5), -- Wireless Mouse -> Peripherals
(8, 5), -- Mechanical Keyboard -> Peripherals
(9, 4), -- HDMI Adapter -> Accessories

-- Burger Joint Items
(10, 6), -- Cheeseburger -> Burgers
(11, 7), -- Fries -> Sides
(12, 8), -- Soda -> Beverages
(13, 6), -- Double Burger -> Burgers
(14, 7); -- Onion Rings -> Sides

-- ================================================================================================
-- 6. SERVICES (For Appointment-Based Businesses)
-- ================================================================================================

INSERT INTO service (id, business_id, name, duration_mins) VALUES 
-- Urban Cuts
(1, 2, 'Mens Haircut', 30),
(2, 2, 'Womens Haircut', 60),
(3, 2, 'Coloring', 120),
-- Serenity Spa
(4, 4, 'Swedish Massage', 60),
(5, 4, 'Deep Tissue Massage', 90),
(6, 4, 'Facial', 45);

INSERT INTO service_location (id, location_id, service_id, price) VALUES 
(1, 3, 1, 2500), -- Mens Cut London
(2, 3, 2, 5000), -- Womens Cut London
(3, 4, 1, 2200), -- Mens Cut Manchester
(4, 7, 4, 8000), -- Swedish Massage Toronto
(5, 7, 5, 12000), -- Deep Tissue Toronto
(6, 8, 6, 6000); -- Facial Vancouver

INSERT INTO service_employee (service_location_id, employee_id) VALUES 
(1, 3), (2, 3), -- Harry does cuts in London
(3, 4),         -- Sally does cuts in Manchester
(4, 7), (5, 7), -- Mindy does massage
(6, 8);         -- Zen does facials

-- ================================================================================================
-- 7. ORDERS
-- ================================================================================================

-- 10 Orders across the 3 order-based businesses
INSERT INTO order_data (employee_id, created_at, status, currency, discount, tip, service_charge) VALUES 
(1, NOW() - INTERVAL '5 days', 'CLOSED', 'USD', 0, 100, 0),
(1, NOW() - INTERVAL '4 days', 'CLOSED', 'USD', 0, 0, 0),
(2, NOW() - INTERVAL '3 days', 'OPEN', 'USD', 50, 200, 0),
(5, NOW() - INTERVAL '2 days', 'CLOSED', 'EUR', 0, 0, 0),
(5, NOW() - INTERVAL '2 days', 'REFUNDED', 'EUR', 0, 0, 0),
(6, NOW() - INTERVAL '1 day', 'OPEN', 'EUR', 0, 500, 0),
(9, NOW() - INTERVAL '12 hours', 'REFUND_PENDING', 'AUD', 0, 50, 0),
(9, NOW() - INTERVAL '10 hours', 'CLOSED', 'AUD', 0, 0, 0),
(10, NOW() - INTERVAL '2 hours', 'OPEN', 'AUD', 0, 100, 0),
(10, NOW() - INTERVAL '1 hour', 'CLOSED', 'AUD', 100, 0, 0);

-- Order Items
INSERT INTO order_item (order_id, item_id, quantity, discount) VALUES 
-- Order 1 (Coffee)
(1, 1, 1, 0), (1, 3, 1, 0),
-- Order 2 (Coffee)
(2, 2, 2, 0),
-- Order 3 (Iced Latte + Bagel)
(3, 5, 1, 0), (3, 4, 1, 0),
-- Order 4 (Tech)
(4, 6, 1, 0), (4, 7, 1, 0),
-- Order 5 (Tech - Refunded)
(5, 8, 1, 0),
-- Order 6 (Tech)
(6, 9, 2, 0),
-- Order 7 (Burger)
( 7, 10, 1, 0), (7, 11, 1, 0), (7, 12, 1, 0),
-- Order 8 (Burger)
(8, 10, 2, 0),
-- Order 9 (Burger)
(9, 13, 1, 0), (9, 14, 1, 0),
-- Order 10 (Burger)
(10, 11, 2, 0);

-- Order Item Variations (Strict item_id matching)
INSERT INTO order_item_variation (order_item_id, variation_id) VALUES 
(1, 2), -- OrderItem 1 (Item 1) -> Variation 2 (Item 1 Large)
(4, 3), -- OrderItem 4 (Item 5) -> Variation 3 (Item 5 Oat Milk)
(11, 7), -- OrderItem 11 (Item 11) -> Variation 7 (Item 11 Small)
(16, 8); -- OrderItem 16 (Item 11) -> Variation 8 (Item 11 Large)

-- ================================================================================================
-- 8. APPOINTMENTS & BILLS
-- ================================================================================================

INSERT INTO appointment (id, service_location_id, actioned_by, customer_name, customer_phone, appointment_at, status) VALUES 
-- Past Appointments
(1, 1, 3, 'Alice Walker', '+44700001', NOW() - INTERVAL '10 days', 'COMPLETED'),
(2, 2, 3, 'Bob Jones', '+44700002', NOW() - INTERVAL '9 days', 'COMPLETED'),
(3, 4, 7, 'Charlie Brown', '+14160001', NOW() - INTERVAL '8 days', 'REFUND_PENDING'),
(4, 5, 7, 'David Smith', '+14160002', NOW() - INTERVAL '7 days', 'REFUNDED'),
-- Future Appointments
(5, 1, 3, 'Eve Taylor', '+44700003', NOW() + INTERVAL '1 day', 'CANCELLED'),
(6, 6, 8, 'Frank Miller', '+16040001', NOW() + INTERVAL '2 days', 'PENDING'),
(7, 4, 7, 'Grace Wilson', '+14160003', NOW() + INTERVAL '3 days', 'PENDING'),
(8, 3, 7, 'Grace WWilson', '+14160004', NOW() + INTERVAL '10 days', 'PENDING');

INSERT INTO appointment_bill (id, appointment_id, amount, discount, tip, created_at) VALUES 
(1, 1, 2500, 0, 250, NOW() - INTERVAL '10 days'),
(2, 2, 5000, 500, 0, NOW() - INTERVAL '9 days'),
(3, 3, 8000, 0, 1000, NOW() - INTERVAL '8 days'),
(4, 4, 12000, 0, 2000, NOW() - INTERVAL '7 days');

-- ================================================================================================
-- 9. PAYMENTS & REFUNDS
-- ================================================================================================

INSERT INTO refund_data (order_id, name, phone, email, reason) VALUES
(9, 'Grace Wilson', '+14160003', 'relax@serenity.com', 'Not good burger.');

COMMIT TRANSACTION;
