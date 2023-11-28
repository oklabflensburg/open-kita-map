-- POSTGIS ERWEITERUNG LADEN
CREATE EXTENSION IF NOT EXISTS postgis;


-- TABELLE KINDERTAGESSTAETTEN
DROP TABLE IF EXISTS childcare_facility CASCADE;

CREATE TABLE IF NOT EXISTS childcare_facility (
  id INT NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  postal_code VARCHAR,
  district VARCHAR,
  address VARCHAR,
  facility VARCHAR,
  director VARCHAR,
  institution VARCHAR,
  phone_number VARCHAR,
  opening_hours VARCHAR,
  integrational VARCHAR,
  childcare_places INT,
  lunch_offer VARCHAR,
  comments VARCHAR,
  group_6_14 INT,
  group_0_3 INT,
  group_3_6 INT,
  group_1_6 INT,
  nature_3_6 INT,
  groups_total INT,
  wkb_geometry GEOMETRY(GEOMETRY, 4326)
);

CREATE INDEX IF NOT EXISTS childcare_facility_wkb_geometry_idx ON childcare_facility USING GIST (wkb_geometry);
