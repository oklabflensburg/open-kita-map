#!./venv/bin/python

import os
import click
import psycopg2
import json

from shapely import wkb
from psycopg2 import ProgrammingError
from psycopg2.errors import UniqueViolation, NotNullViolation
from shapely.geometry import shape, Point
from dotenv import load_dotenv
from pathlib import Path


env_path = Path('../.env')
load_dotenv(dotenv_path=env_path)


try:
    conn = psycopg2.connect(
        database = os.getenv('DB_NAME'),
        password = os.getenv('DB_PASS'),
        user = os.getenv('DB_USER'),
        host = os.getenv('DB_HOST'),
        port = os.getenv('DB_PORT')
    )
    conn.autocommit = True
except Exception as e:
    raise


def retrieve_features(cur, features):
    for feature in features:
        properties = feature['properties']

        insert_object(cur, properties, feature['geometry'])


def insert_object(cur, properties, geometry):
    postal_code = properties['postal_code'] if properties['postal_code'] else None
    district = properties['district'] if properties['district'] else None
    address = properties['address'] if properties['address'] else None
    facility = properties['facility'] if properties['facility'] else None
    director = properties['director'] if properties['director'] else None
    comments = properties['comments'] if properties['comments'] else None
    lunch_offer = properties['lunch_offer'] if properties['lunch_offer'] else None
    institution = properties['institution'] if properties['institution'] else None
    phone_number = properties['phone_number'] if properties['phone_number'] else None
    opening_hours = properties['opening_hours'] if properties['opening_hours'] else None
    integrational = properties['integrational'] if properties['integrational'] else None
    childcare_places = properties['childcare_places'] if properties['childcare_places'] else None
    groups_total = properties['groups_total'] if properties['groups_total'] else None
    nature_3_6 = properties['nature_3_6'] if properties['nature_3_6'] else None
    group_6_14 = properties['group_6_14'] if properties['group_6_14'] else None
    group_0_3 = properties['group_0_3'] if properties['group_0_3'] else None
    group_3_6 = properties['group_3_6'] if properties['group_3_6'] else None
    group_1_6 = properties['group_1_6'] if properties['group_1_6'] else None

    g = Point(shape(geometry))
    wkb_geometry = wkb.dumps(g, hex=True, srid=4326)

    sql = '''
        INSERT INTO childcare_facility (postal_code, district, address, facility,
            director, institution, phone_number, opening_hours, integrational,
            childcare_places, lunch_offer, comments, group_6_14, group_0_3,
            group_3_6, group_1_6, nature_3_6, groups_total, wkb_geometry)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    '''

    try:
        cur.execute(sql, (postal_code, district, address, facility, director,
            institution, phone_number, opening_hours, integrational,
            childcare_places, lunch_offer, comments, group_6_14, group_0_3,
            group_3_6, group_1_6, nature_3_6, groups_total, wkb_geometry))
    except UniqueViolation as e:
        print(e)
        return


@click.command()
@click.argument('file')
def main(file):
    cur = conn.cursor()

    with open(Path(file), 'r') as f:
        features = json.loads(f.read())['features']

    retrieve_features(cur, features)


if __name__ == '__main__':
    main()
