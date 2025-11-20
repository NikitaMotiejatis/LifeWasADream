-- ---------------------------------------------------------
-- Business
-- ---------------------------------------------------------

CREATE OR REPLACE FUNCTION business_craeted_at_before_future()
RETURNS TRIGGER AS 
$$
BEGIN
    IF NEW.created_at > CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'created_at cannot be in the future';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS business_valid_created_at ON business;

CREATE TRIGGER business_valid_created_at
BEFORE INSERT OR UPDATE ON business
FOR EACH ROW
EXECUTE FUNCTION business_craeted_at_before_future();

-- ---------------------------------------------------------
-- Employee
-- ---------------------------------------------------------

CREATE OR REPLACE FUNCTION employee_craeted_at_before_future()
RETURNS TRIGGER AS 
$$
BEGIN
    IF NEW.created_at > CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'created_at cannot be in the future';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS employee_valid_created_at ON employee;

CREATE TRIGGER employee_valid_created_at
BEFORE INSERT OR UPDATE ON employee
FOR EACH ROW
EXECUTE FUNCTION employee_craeted_at_before_future();

-- ---------------------------------------------------------
-- Token
-- ---------------------------------------------------------

CREATE OR REPLACE FUNCTION token_created_at_before_future()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.created_at > CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'created_at cannot be in the future';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS token_valid_created_at ON token;
CREATE TRIGGER token_valid_created_at
    BEFORE INSERT OR UPDATE ON token
    FOR EACH ROW
    EXECUTE FUNCTION token_created_at_before_future();

-- ---------------------------------------------------------
-- Order
-- ---------------------------------------------------------

CREATE OR REPLACE FUNCTION order_created_at_before_future()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.created_at > CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'created_at cannot be in the future';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS order_valid_created_at ON order_data;
CREATE TRIGGER order_valid_created_at
    BEFORE INSERT OR UPDATE ON order_data
    FOR EACH ROW
    EXECUTE FUNCTION order_created_at_before_future();

-- ---------------------------------------------------------
-- Appointment data
-- ---------------------------------------------------------

CREATE OR REPLACE FUNCTION appointment_created_at_before_future()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.created_at > CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'created_at cannot be in the future';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS appointment_valid_created_at ON appointment_bill;
CREATE TRIGGER appointment_valid_created_at
    BEFORE INSERT OR UPDATE ON appointment_bill
    FOR EACH ROW
    EXECUTE FUNCTION appointment_created_at_before_future();


-- ideas for more triggers: 
--  work shift to not overlap for same employee