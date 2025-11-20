BEGIN TRANSACTION;


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
CREATE TYPE currency AS ENUM(
    'AED',
    'AFN',
    'ALL',
    'AMD',
    'AOA',
    'ARS',
    'AUD',
    'AWG',
    'AZN',
    'BAM',
    'BBD',
    'BDT',
    'BGN',
    'BHD',
    'BIF',
    'BMD',
    'BND',
    'BOB',
    'BOV',
    'BRL',
    'BSD',
    'BTN',
    'BWP',
    'BYN',
    'BZD',
    'CAD',
    'CDF',
    'CHE',
    'CHF',
    'CHW',
    'CLF',
    'CLP',
    'CNY',
    'COP',
    'COU',
    'CRC',
    'CUP',
    'CVE',
    'CZK',
    'DJF',
    'DKK',
    'DOP',
    'DZD',
    'EGP',
    'ERN',
    'ETB',
    'EUR',
    'FJD',
    'FKP',
    'GBP',
    'GEL',
    'GHS',
    'GIP',
    'GMD',
    'GNF',
    'GTQ',
    'GYD',
    'HKD',
    'HNL',
    'HTG',
    'HUF',
    'IDR',
    'ILS',
    'INR',
    'IQD',
    'IRR',
    'ISK',
    'JMD',
    'JOD',
    'JPY',
    'KES',
    'KGS',
    'KHR',
    'KMF',
    'KPW',
    'KRW',
    'KWD',
    'KYD',
    'KZT',
    'LAK',
    'LBP',
    'LKR',
    'LRD',
    'LSL',
    'LYD',
    'MAD',
    'MDL',
    'MGA',
    'MKD',
    'MMK',
    'MNT',
    'MOP',
    'MRU',
    'MUR',
    'MVR',
    'MWK',
    'MXN',
    'MXV',
    'MYR',
    'MZN',
    'NAD',
    'NGN',
    'NIO',
    'NOK',
    'NPR',
    'NZD',
    'OMR',
    'PAB',
    'PEN',
    'PGK',
    'PHP',
    'PKR',
    'PLN',
    'PYG',
    'QAR',
    'RON',
    'RSD',
    'RUB',
    'RWF',
    'SAR',
    'SBD',
    'SCR',
    'SDG',
    'SEK',
    'SGD',
    'SHP',
    'SLE',
    'SOS',
    'SRD',
    'SSP',
    'STN',
    'SVC',
    'SYP',
    'SZL',
    'THB',
    'TJS',
    'TMT',
    'TND',
    'TOP',
    'TRY',
    'TTD',
    'TWD',
    'TZS',
    'UAH',
    'UGX',
    'USD',
    'USN',
    'UYI',
    'UYU',
    'UYW',
    'UZS',
    'VED',
    'VES',
    'VND',
    'VUV',
    'WST',
    'XAD',
    'XAF',
    'XAG',
    'XAU',
    'XBA',
    'XBB',
    'XBC',
    'XBD',
    'XCD',
    'XCG',
    'XDR',
    'XOF',
    'XPD',
    'XPF',
    'XPT',
    'XSU',
    'XTS',
    'XUA',
    'XXX',
    'YER',
    'ZAR',
    'ZMW',
    'ZWG'
);

DROP TYPE IF EXISTS price CASCADE;
CREATE TYPE price AS (
    currency    currency,
    amount      INTEGER
);


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
    currency    currency        NOT NULL ,
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
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ------------------------------------------------------------------------------------------------
-- Employee Data --------------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------

DROP TABLE IF EXISTS employee CASCADE;
CREATE TABLE employee (
    id              INTEGER PRIMARY KEY,
    first_name      VARCHAR(64)     NOT NULL,
    last_name       VARCHAR(64)     NOT NULL,
    password_hash   CHAR(512)       NOT NULL,   -- TODO: May need to change depending on hashing algorithm
    email           VARCHAR(512)    NOT NULL UNIQUE,
    phone           VARCHAR(16)     NOT NULL UNIQUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,   -- TODO: Check not in future
    business_id     INTEGER         NOT NULL REFERENCES business(id)
);

DROP TABLE IF EXISTS work_shift CASCADE;
CREATE TABLE work_shift (
    id              INTEGER PRIMARY KEY,
    day_of_the_week weekday NOT NULL,
    start_time      TIME    NOT NULL,   -- TODO: Check not in future
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
-- Authentication ---------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------

-- TODO: May not need it. Tokens could be stored in memory
DROP TABLE IF EXISTS token CASCADE;
CREATE TABLE token (
    id          INTEGER PRIMARY KEY,
    user_id     INTEGER     NOT NULL REFERENCES employee(id),
    token       CHAR(256)   NOT NULL,   -- TODO: May need to change depending on hashing algorithm
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expired_at  TIMESTAMP   NOT NULL,   -- TODO: Check not in future

    CONSTRAINT created_before_expired CHECK (created_at < expired_at)
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
-- Service data------------------------------------------------------------------------------------
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
    location_id	INTEGER NOT NULL REFERENCES location(id),
    service_id 	INTEGER NOT NULL REFERENCES service(id),
    price 		price	NOT NULL,

    CONSTRAINT positive_service_price CHECK ((price).amount > 0)
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
CREATE TYPE order_status AS ENUM('OPEN', 'CLOSED', 'REFUNDED');

DROP TABLE IF EXISTS order_data CASCADE;
CREATE TABLE order_data (
    id              INTEGER PRIMARY KEY,
    employee_id     INTEGER         NOT NULL REFERENCES employee(id),
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,   -- TODO: Check not in future
    status          order_status    NOT NULL DEFAULT 'OPEN',
    discount        price           NOT NULL DEFAULT '("EUR",0)',
    tip             price           NOT NULL DEFAULT '("EUR",0)',
    service_charge  price           NOT NULL DEFAULT '("EUR",0)',

    CONSTRAINT non_negative_discount        CHECK ((discount).amount >= 0),
    CONSTRAINT non_negative_tip             CHECK ((tip).amount >= 0),
    CONSTRAINT non_negative_service_charge  CHECK ((service_charge).amount >= 0)
);

DROP TABLE IF EXISTS item CASCADE;
CREATE TABLE item (
    id              INTEGER PRIMARY KEY,
    name            VARCHAR(64)     NOT NULL UNIQUE,
    location_id     INTEGER         NOT NULL REFERENCES location(id),
    price_per_unit  price           NOT NULL,
    vat             DECIMAL(4, 2)   NOT NULL,

    CONSTRAINT positive_price_per_unit_price    CHECK ((price_per_unit).amount > 0),
    CONSTRAINT non_negative_vat_price           CHECK (vat >= 0)

);

DROP TABLE IF EXISTS item_variation CASCADE;
CREATE TABLE item_variation (
    id                  INTEGER PRIMARY KEY,
    item_id             INTEGER     NOT NULL REFERENCES item(id),
    name                VARCHAR(64) NOT NULL UNIQUE,
    price_difference    price       NOT NULL DEFAULT '("EUR",0)'
);

DROP TABLE IF EXISTS order_item CASCADE;
CREATE TABLE order_item (
    id          INTEGER PRIMARY KEY,
    order_id    INTEGER NOT NULL REFERENCES order_data(id),
    item_id     INTEGER NOT NULL REFERENCES item(id),
    quantity    INTEGER NOT NULL DEFAULT 1,
    discount    price   NOT NULL DEFAULT '("EUR",0)',
    tip         price   NOT NULL DEFAULT '("EUR",0)',
    vat         price   NOT NULL DEFAULT '("EUR",0)', -- TODO: idk if this is a good idea

    CONSTRAINT positive_quantity        CHECK (quantity > 0),
    CONSTRAINT non_negative_discount    CHECK ((discount).amount >= 0),
    CONSTRAINT non_negative_tip         CHECK ((tip).amount >= 0),
    CONSTRAINT non_negative_vat_charge  CHECK ((vat).amount >= 0)
);

DROP TABLE IF EXISTS order_item_variation CASCADE;
CREATE TABLE order_item_variation (
    order_item_id   INTEGER NOT NULL REFERENCES order_item(id),
    variation_id    INTEGER NOT NULL REFERENCES item_variation(id),

    PRIMARY KEY(order_item_id, variation_id)
);

-- ------------------------------------------------------------------------------------------------
-- Discount data-----------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------------------------

DROP TABLE IF EXISTS discount_details CASCADE;
CREATE TABLE discount_details (
    id          INTEGER PRIMARY KEY,
    business_id INTEGER         NOT NULL REFERENCES business(id),
    percentage  DECIMAL(4, 2)   DEFAULT NULL,
    amount      price           DEFAULT NULL,
    starts_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ends_at     TIMESTAMP       NOT NULL,

    CONSTRAINT starts_before_ends   CHECK (starts_at < ends_at),
    CONSTRAINT exactly_one_not_null CHECK (
        ((percentage IS NOT NULL) AND (amount IS     NULL)) OR 
        ((percentage IS     NULL) AND (amount IS NOT NULL))
    ),
    CONSTRAINT positive_percentage  CHECK ((percentage > 0) IS NOT FALSE),
    CONSTRAINT positive_amount      CHECK (((amount).amount > 0) IS NOT FALSE)
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
);

DROP TABLE IF EXISTS appointment_bill CASCADE;
CREATE TABLE appointment_bill(
    id              INTEGER     PRIMARY KEY,
    appointment_id  INTEGER     NOT NULL REFERENCES appointment(id),
    amount          price       NOT NULL,
    discount        price       NOT NULL DEFAULT '("EUR",0)',
    tip             price       NOT NULL DEFAULT '("EUR",0)',
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT non_negative_amount      CHECK ((amount).amount >= 0),
    CONSTRAINT non_negative_discount    CHECK ((discount).amount >= 0),
    CONSTRAINT non_negative_tip         CHECK ((tip).amount >= 0)
);

COMMIT TRANSACTION;
