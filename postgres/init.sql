BEGIN TRANSACTION;

-- ------------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------
-- Custom Types -----------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------


DROP TYPE IF EXISTS weekday CASCADE;
CREATE TYPE weekday AS ENUM(
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY'
);


DROP TYPE IF EXISTS currency CASCADE;
CREATE TYPE currency AS ENUM( 'AED', 'AFN', 'ALL', 'AMD', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BOV', 'BRL', 'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHE', 'CHF', 'CHW', 'CLF', 'CLP', 'CNY', 'COP', 'COU', 'CRC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HTG', 'HUF', 'IDR', 'ILS', 'INR', 'IQD', 'IRR', 'ISK', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MXV', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLE', 'SOS', 'SRD', 'SSP', 'STN', 'SVC', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'USN', 'UYI', 'UYU', 'UYW', 'UZS', 'VED', 'VES', 'VND', 'VUV', 'WST', 'XAD', 'XAF', 'XAG', 'XAU', 'XBA', 'XBB', 'XBC', 'XBD', 'XCD', 'XCG', 'XDR', 'XOF', 'XPD', 'XPF', 'XPT', 'XSU', 'XTS', 'XUA', 'XXX', 'YER', 'ZAR', 'ZMW', 'ZWG' );


CREATE OR REPLACE FUNCTION not_in_future()
RETURNS TRIGGER AS 
$$
BEGIN
    IF NEW.created_at > CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'created_at cannot be in the future';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------
-- Tables -----------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------

-- ------------------------------------------------------------------------------------------------
-- Application Data -------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------

DROP TABLE IF EXISTS role CASCADE;
CREATE TABLE role (
    id      INTEGER PRIMARY KEY,
    name    VARCHAR(64) NOT NULL UNIQUE
);

DROP TABLE IF EXISTS permissions CASCADE;
CREATE TABLE permissions (
    id      INTEGER PRIMARY KEY,
    name    VARCHAR(64) NOT NULL UNIQUE
);

DROP TABLE IF EXISTS role_permission CASCADE;
CREATE TABLE role_permission (
    role_id         INTEGER NOT NULL REFERENCES role(id),
    permission_id   INTEGER NOT NULL REFERENCES permissions(id),

    PRIMARY KEY (role_id, permission_id)
);

DROP TABLE IF EXISTS employee_role CASCADE;
CREATE TABLE employee_role (
    employee_id INTEGER NOT NULL REFERENCES employee(id),
    role_id     INTEGER NOT NULL REFERENCES role(id),

    PRIMARY KEY (employee_id, role_id)
);


DROP TABLE IF EXISTS currency_info CASCADE;
CREATE TABLE currency_info (
    code    currency PRIMARY KEY,
    name    VARCHAR(64) NOT NULL UNIQUE,
    symbol  CHAR(3)     NOT NULL 
);

DROP TABLE IF EXISTS country CASCADE;
CREATE TABLE country (
    code        CHAR(2) PRIMARY KEY,
    name        VARCHAR(64)     NOT NULL UNIQUE,
    currency    currency        NOT NULL,
    vat         DECIMAL(4, 2)   NOT NULL,

    CONSTRAINT non_negative_vat CHECK (vat >= 0)
);

-- ------------------------------------------------------------------------------------------------
-- Business Data ----------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------

DROP TYPE IF EXISTS business_type CASCADE;
CREATE TYPE business_type AS ENUM('ORDER_BASED', 'APPOINTMENT_BASED');

DROP TABLE IF EXISTS business CASCADE;
CREATE TABLE business (
    id              INTEGER         PRIMARY KEY,
    name            VARCHAR(32)     NOT NULL UNIQUE,
    description     VARCHAR(1024)   NOT NULL,
    type            business_type   NOT NULL,
    email           VARCHAR(512)    NOT NULL UNIQUE,
    phone           VARCHAR(16)     NOT NULL UNIQUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_email CHECK (email ~ '^[^\.][a-zA-Z0-9\-\.+]{0,62}[^\.]+@([^\-][a-zA-Z0-9\-]{0,61}[^\-]\.)+[^\-][a-zA-Z0-9\-]{0,61}[^\-]$'),
    CONSTRAINT valid_phone CHECK (phone ~ '^\+[0-9]{3,15}$')
);

DROP TRIGGER IF EXISTS business_valid_created_at ON business;
CREATE TRIGGER business_valid_created_at
    BEFORE INSERT OR UPDATE ON business
    FOR EACH ROW
    EXECUTE FUNCTION not_in_future();


-- ------------------------------------------------------------------------------------------------
-- Employee Data --------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------

DROP TABLE IF EXISTS employee CASCADE;
CREATE TABLE employee (
    id              INTEGER PRIMARY KEY,
    username        VARCHAR(16)     NOT NULL UNIQUE,
    first_name      VARCHAR(64)     NOT NULL,
    last_name       VARCHAR(64)     NOT NULL,
    password_hash   CHAR(60)        NOT NULL,
    email           VARCHAR(512)    NOT NULL UNIQUE,
    phone           VARCHAR(16)     NOT NULL UNIQUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    business_id     INTEGER         NOT NULL REFERENCES business(id),

    CONSTRAINT valid_password_hash  CHECK (password_hash ~ '^\$2(a|b|x|y)\$[0-9]{2}\$[a-zA-Z0-9./]{53}$'),
    CONSTRAINT valid_email          CHECK (email ~ '^[^\.][a-zA-Z0-9\-\.+]{0,62}[^\.]+@([^\-][a-zA-Z0-9\-]{0,61}[^\-]\.)+[^\-][a-zA-Z0-9\-]{0,61}[^\-]$'),
    CONSTRAINT valid_phone          CHECK (phone ~ '^\+[0-9]{3,15}$')
);

DROP TRIGGER IF EXISTS employee_valid_created_at ON employee;
CREATE TRIGGER employee_valid_created_at
    BEFORE INSERT OR UPDATE ON employee
    FOR EACH ROW
    EXECUTE FUNCTION not_in_future();


DROP TABLE IF EXISTS work_shift CASCADE;
CREATE TABLE work_shift (
    id              INTEGER PRIMARY KEY,
    day_of_the_week weekday NOT NULL,
    start_time      TIME    NOT NULL,
    end_time        TIME    NOT NULL,

    CONSTRAINT start_before_end CHECK (start_time < end_time)
);

DROP TABLE IF EXISTS employee_shift CASCADE;
CREATE TABLE employee_shift (
    user_id         INTEGER NOT NULL REFERENCES employee(id),
    work_shift_id   INTEGER NOT NULL REFERENCES work_shift(id),

    PRIMARY KEY(user_id, work_shift_id)
);

-- ------------------------------------------------------------------------------------------------
-- Location data ----------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------

DROP TABLE IF EXISTS location CASCADE;
CREATE TABLE location (
	id              INTEGER     PRIMARY KEY,
	business_id     INTEGER     NOT NULL REFERENCES business(id),
	country_code    CHAR(3)     NOT NULL REFERENCES country(code),
	city            VARCHAR(64) NOT NULL,
    street          VARCHAR(64) NOT NULL,
    postal_code     VARCHAR(16) NOT NULL
);

DROP TABLE IF EXISTS location_open CASCADE;
CREATE TABLE location_open (
	location_id 	INTEGER NOT NULL,
	day_of_the_week weekday NOT NULL,
	open_at 	    TIME	NOT NULL,
	closes_at 	    TIME 	NOT NULL,

    CONSTRAINT open_before_close CHECK (open_at < closes_at),
    PRIMARY KEY(location_id, day_of_the_week)
);

-- ------------------------------------------------------------------------------------------------
-- Service data -----------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------

DROP TABLE IF EXISTS service CASCADE;
CREATE TABLE service (
   	id 		        INTEGER	PRIMARY KEY,
    business_id 	INTEGER     NOT NULL REFERENCES business(id),
    name 			VARCHAR(64) NOT NULL,
    duration_mins 	INTEGER     NOT NULL, -- TODO: change type to TIME?

    CONSTRAINT duration_positive CHECK (duration_mins > 0)
);

DROP TABLE IF EXISTS service_location CASCADE;
CREATE TABLE service_location (
   	id 			INTEGER PRIMARY KEY,
    location_id	INTEGER     NOT NULL REFERENCES location(id),
    service_id 	INTEGER     NOT NULL REFERENCES service(id),
    price 		DECIMAL(15) NOT NULL,

    CONSTRAINT positive_service_price CHECK (price > 0)
);

DROP TABLE IF EXISTS service_employee CASCADE;
CREATE TABLE service_employee (
   	service_location_id	INTEGER NOT NULL REFERENCES service_location(id),
    employee_id 		INTEGER NOT NULL REFERENCES employee(id),
	
    PRIMARY KEY(service_location_id, employee_id)
);

-- ------------------------------------------------------------------------------------------------
-- Order ------------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------

DROP TYPE IF EXISTS order_status CASCADE;
CREATE TYPE order_status AS ENUM('OPEN', 'CLOSED', 'REFUND_PENDING', 'REFUNDED');

DROP TABLE IF EXISTS order_data CASCADE;
CREATE TABLE order_data (
    id              SERIAL PRIMARY KEY,
    employee_id     INTEGER         NOT NULL REFERENCES employee(id),
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status          order_status    NOT NULL DEFAULT 'OPEN',
    currency        currency        NOT NULL,
    discount        DECIMAL(15)     NOT NULL DEFAULT 0,
    tip             DECIMAL(15)     NOT NULL DEFAULT 0,
    service_charge  DECIMAL(15)     NOT NULL DEFAULT 0,

    CONSTRAINT non_negative_discount        CHECK (discount >= 0),
    CONSTRAINT non_negative_tip             CHECK (tip >= 0),
    CONSTRAINT non_negative_service_charge  CHECK (service_charge >= 0)
);

DROP TRIGGER IF EXISTS business_valid_created_at ON business;
CREATE TRIGGER business_valid_created_at
    BEFORE INSERT OR UPDATE ON business
    FOR EACH ROW
    EXECUTE FUNCTION not_in_future();


DROP TYPE IF EXISTS item_status CASCADE;
CREATE TYPE item_status AS ENUM('ACTIVE', 'ARCHIVED');


DROP TABLE IF EXISTS item CASCADE;
CREATE TABLE item (
    id              INTEGER PRIMARY KEY,
    name            VARCHAR(64)     NOT NULL UNIQUE,
    location_id     INTEGER         NOT NULL REFERENCES location(id),
    price_per_unit  DECIMAL(15)     NOT NULL,
    vat             DECIMAL(4, 2)   NOT NULL,
    status          item_status     NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT positive_price_per_unit_price    CHECK (price_per_unit > 0),
    CONSTRAINT non_negative_vat_price           CHECK (vat >= 0)
);

DROP INDEX IF EXISTS item_index CASCADE;
CREATE INDEX item_index ON item(name);


DROP TABLE IF EXISTS item_variation CASCADE;
CREATE TABLE item_variation (
    id                  INTEGER PRIMARY KEY,
    item_id             INTEGER     NOT NULL REFERENCES item(id),
    name                VARCHAR(64) NOT NULL,
    price_difference    DECIMAL(15) NOT NULL DEFAULT 0
);

DROP TABLE IF EXISTS category CASCADE;
CREATE TABLE category (
    id      INTEGER PRIMARY KEY,
    name    VARCHAR(64) NOT NULL UNIQUE
);

DROP TABLE IF EXISTS item_category CASCADE;
CREATE TABLE item_category (
    item_id     INTEGER NOT NULL REFERENCES item(id),
    category_id INTEGER NOT NULL REFERENCES category(id),

    PRIMARY KEY (item_id, category_id)
);


DROP TABLE IF EXISTS order_item CASCADE;
CREATE TABLE order_item (
    id          SERIAL PRIMARY KEY,
    order_id    INTEGER     NOT NULL REFERENCES order_data(id),
    item_id     INTEGER     NOT NULL REFERENCES item(id),
    quantity    INTEGER     NOT NULL DEFAULT 1,
    discount    DECIMAL(15) NOT NULL DEFAULT 0,

    CONSTRAINT positive_quantity        CHECK (quantity > 0),
    CONSTRAINT non_negative_discount    CHECK (discount >= 0)
);

DROP TABLE IF EXISTS order_item_variation CASCADE;
CREATE TABLE order_item_variation (
    order_item_id   INTEGER NOT NULL REFERENCES order_item(id) ON DELETE CASCADE,
    variation_id    INTEGER NOT NULL REFERENCES item_variation(id),

    PRIMARY KEY(order_item_id, variation_id)
);

CREATE OR REPLACE FUNCTION check_if_item_id_is_consistent()
RETURNS TRIGGER AS
$$
BEGIN
    IF  (
            SELECT COUNT(DISTINCT(item_id))
            FROM (
                (SELECT id, item_id FROM order_item WHERE id = NEW.order_item_id)
                UNION
                (SELECT id, item_id FROM item_variation WHERE id = NEW.variation_id))
        ) <> 1
    THEN
        RAISE EXCEPTION  'item_id does not match on order_item and item_variation';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS consistent_item_id ON order_item_variation;
CREATE TRIGGER consistent_item_id
    BEFORE INSERT OR UPDATE ON order_item_variation
    FOR EACH ROW
    EXECUTE FUNCTION check_if_item_id_is_consistent();

-- ------------------------------------------------------------------------------------------------
-- Discount data-----------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------

DROP TABLE IF EXISTS discount_details CASCADE;
CREATE TABLE discount_details (
    id          INTEGER PRIMARY KEY,
    business_id INTEGER         NOT NULL REFERENCES business(id),
    percentage  DECIMAL(4, 2)   DEFAULT NULL,
    amount      DECIMAL(15)     DEFAULT NULL,
    starts_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ends_at     TIMESTAMP       NOT NULL,

    CONSTRAINT starts_before_ends   CHECK (starts_at < ends_at),
    CONSTRAINT exactly_one_not_null CHECK (
        ((percentage IS NOT NULL) AND (amount IS     NULL)) OR 
        ((percentage IS     NULL) AND (amount IS NOT NULL))
    ),
    CONSTRAINT positive_percentage  CHECK ((percentage > 0) IS NOT FALSE),
    CONSTRAINT positive_amount      CHECK ((amount > 0) IS NOT FALSE)
);

DROP TABLE IF EXISTS item_discount CASCADE;
CREATE TABLE item_discount (
    item_id     INTEGER NOT NULL REFERENCES item(id),
    details_id 	INTEGER NOT NULL REFERENCES discount_details(id),

    PRIMARY KEY(item_id, details_id)
);

DROP TABLE IF EXISTS order_discount CASCADE;
CREATE TABLE order_discount (
    details_id 	INTEGER NOT NULL REFERENCES discount_details(id),

    PRIMARY KEY(details_id)
);

-- -------------------------------------------------------------------------------------------------
-- Appointment data---------------------------------------------------------------------------------
-- -------------------------------------------------------------------------------------------------

DROP TYPE IF EXISTS appointment_status CASCADE;
CREATE TYPE appointment_status AS ENUM('RESERVED', 'SERVING', 'CANCELLED', 'PAID');

DROP TABLE IF EXISTS appointment CASCADE;
CREATE TABLE appointment (
   	id 			        INTEGER PRIMARY KEY,
    service_location_id INTEGER             NOT NULL REFERENCES service_location(id),
    actioned_by         INTEGER             NOT NULL REFERENCES employee(id),
    customer_name       VARCHAR(64)         NOT NULL,
    customer_surname    VARCHAR(64)         NOT NULL,
    customer_email      VARCHAR(512)        NOT NULL UNIQUE,
    customer_phone      VARCHAR(16)         NOT NULL UNIQUE,
    appointment_at      TIMESTAMP           NOT NULL,
	status              appointment_status  NOT NULL DEFAULT 'RESERVED'

    CONSTRAINT valid_customer_email CHECK (customer_email ~ '^[^\.][a-zA-Z0-9\-\.+]{0,62}[^\.]+@([^\-][a-zA-Z0-9\-]{0,61}[^\-]\.)+[^\-][a-zA-Z0-9\-]{0,61}[^\-]$'),
    CONSTRAINT valid_customer_phone CHECK (customer_phone ~ '^\+[0-9]{3,15}$')
);

DROP TABLE IF EXISTS appointment_bill CASCADE;
CREATE TABLE appointment_bill(
    id              INTEGER     PRIMARY KEY,
    appointment_id  INTEGER     NOT NULL REFERENCES appointment(id),
    amount          DECIMAL(15) NOT NULL,
    discount        DECIMAL(15) NOT NULL DEFAULT 0,
    tip             DECIMAL(15) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT non_negative_amount      CHECK (amount >= 0),
    CONSTRAINT non_negative_discount    CHECK (discount >= 0),
    CONSTRAINT non_negative_tip         CHECK (tip >= 0)
);

DROP TRIGGER IF EXISTS appointment_bill_valid_created_at ON appointment_bill;
CREATE TRIGGER appointment_bill_valid_created_at
    BEFORE INSERT OR UPDATE ON appointment_bill
    FOR EACH ROW
    EXECUTE FUNCTION not_in_future();

-- -------------------------------------------------------------------------------------------------
-- -------------------------------------------------------------------------------------------------
-- Views -------------------------------------------------------------------------------------------
-- -------------------------------------------------------------------------------------------------
-- -------------------------------------------------------------------------------------------------

CREATE OR REPLACE VIEW order_item_detail
AS
    WITH item_info AS 
    (
        SELECT
            order_item.id AS order_item_id,
            order_id,
            item.id AS item_id,
            item.name AS item_name,
            price_per_unit,
            quantity,
            discount AS unit_discount,
            vat,
            status 
        FROM item 
        JOIN order_item 
            ON item.id = order_item.item_id 
    ), variation_info AS (
        SELECT
            order_item_id,
            variation_id,
            name AS variation_name,
            price_difference 
        FROM order_item_variation 
        JOIN item_variation 
            ON order_item_variation.variation_id = item_variation.id 
    )
    SELECT
        item_info.order_item_id,
        order_id,
        item_id,
        item_name,
        price_per_unit,
        quantity,
        unit_discount,
        vat,
        status,
        variation_id,
        variation_name,
        price_difference
    FROM item_info 
    LEFT JOIN variation_info 
        ON item_info.order_item_id = variation_info.order_item_id
;

CREATE OR REPLACE VIEW order_item_total
AS
     SELECT
        order_item_id,
        order_id,
        vat,
        quantity,
         SUM(price_per_unit + COALESCE(price_difference, 0) - unit_discount)                            ::DECIMAL(15) AS gross,
        (SUM(price_per_unit + COALESCE(price_difference, 0) - unit_discount) / (0.01 * (100 + vat)))    ::DECIMAL(15) AS net,
        (SUM(price_per_unit + COALESCE(price_difference, 0) - unit_discount) * quantity)                ::DECIMAL(15) AS total
    FROM order_item_detail
    GROUP BY 
        order_item_id,
        order_id,
        vat,
        quantity
;

CREATE OR REPLACE VIEW order_detail
AS
    WITH item_total_sum AS (
        SELECT
            order_id,
            SUM(total) AS sum_of_totals
        FROM order_item_total
        GROUP BY order_id
    )
    SELECT 
        id,
        employee_id,
        created_at,
        status,
        currency,
        discount,
        tip,
        service_charge,
        GREATEST(COALESCE(sum_of_totals, 0) + tip + service_charge - discount, 0) AS total
    FROM order_data
    LEFT JOIN item_total_sum
        ON order_data.id = item_total_sum.order_id
;

-- -------------------------------------------------------------------------------------------------
-- -------------------------------------------------------------------------------------------------
-- -------------------------------------------------------------------------------------------------
-- -------------------------------------------------------------------------------------------------
-- -------------------------------------------------------------------------------------------------

COMMIT TRANSACTION;
