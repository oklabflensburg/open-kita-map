#!./venv/bin/python

import os
import csv
import click
import json
import re

from dotenv import load_dotenv
from geojson import FeatureCollection, Feature, Point
from geopy.geocoders import GoogleV3
from pathlib import Path


env_path = Path('../.env')
load_dotenv(dotenv_path=env_path)


try:
    api_key = os.getenv('API_KEY')
except Exception as e:
    raise(e)


def remove_chars(string):
    slug = string

    tpl = (('©', ''), ('"', ''), ('\\', ''), ('&', 'und'), ('(', ''), (')', ''))

    for item1, item2 in tpl:
        slug = slug.replace(item1, item2)

    return slug


def replace_umlauts(string):
    slug = string

    tpl = (('ü', 'ue'), ('Ü', 'Ue'), ('ä', 'ae'), ('Ä', 'Ae'), ('ö', 'oe'), ('Ö', 'Oe'), ('ß', 'ss'), ('ø', 'oe'))

    for item1, item2 in tpl:
        slug = slug.replace(item1, item2)

    return slug


def get_slug(values):
    parts = []

    for value in values:
        parts.append(re.sub(r'[\d\s!@#\$%\^&\*\(\)\[\]{};:,\./<>\?\|`~\-=_\+]', ' ', value))

    slug = ' '.join(list(dict.fromkeys(parts))).lower()
    slug = remove_chars(slug)
    slug = replace_umlauts(slug)
    slug = re.sub(r'\s+', ' ', slug).replace(' ', '-')
    slug = slug.replace('str-', 'strasse-')

    if 'kita' not in slug and 'krippe' not in slug:
        slug = f'kita-{slug}'

    print(slug)

    return slug


def get_coordinates(lookup):
    g = GoogleV3(api_key=api_key)
    locations = g.geocode(query=lookup, exactly_one=True)

    coords = []

    try:
        if not hasattr(locations, 'raw'):
            return loc

        try:
            coords = [locations.latitude, locations.longitude]
        except (TypeError, AttributeError, IndexError) as e:
            print(e)
    except Exception as e:
        print(e)

    return coords


def generate_geojson(features):
    fc = []

    crs = {
        'type': 'name',
        'properties': {
            'name': 'urn:ogc:def:crs:OGC:1.3:CRS84'
        }
    }

    for feature in features:
        coordinates = feature['geometry']['coordinates']

        geometry = Point((float(coordinates[1]), float(coordinates[0])))
        properties = feature['properties']

        fc.append(Feature(geometry=geometry, properties=properties))

    c = FeatureCollection(fc, crs=crs)

    return c


def read_input(src):
    features = []

    with open(src, 'r') as f:
        reader = csv.DictReader(f)

        for i in reader:
            address = i['address'].replace(' ', '+')
            postal_code = i['postal_code'].strip()
            phone_number = i['phone_number'].strip()
            district = i['district'].strip()

            lookup = f'{address}+{postal_code}+{district}+Flensburg'

            properties = {}
            geometries = {}
            values = []

            properties['district'] = district
            properties['postal_code'] = postal_code
            properties['address'] = i['address'].strip()
            properties['facility'] = i['facility'].strip()
            properties['director'] = i['director'].strip()
            properties['phone_number'] = f'0461/{phone_number}'
            properties['institution'] = i['institution'].strip()
            properties['prerequisite'] = i['prerequisite'].strip() if i['prerequisite'] else ''
            properties['opening_hours'] = i['opening_hours'].strip()
            properties['integrational'] = int(i['integrational'].strip())
            properties['childcare_places'] = int(i['childcare_places'].strip())
            properties['group_6_14'] = int(i['group_6_14'].strip())
            properties['group_0_3'] = int(i['group_0_3'].strip())
            properties['group_3_6'] = int(i['group_3_6'].strip())
            properties['group_1_6'] = int(i['group_1_6'].strip())
            properties['nature_3_6'] = int(i['nature_3_6'].strip())
            properties['groups_total'] = int(i['groups_total'].strip())
            properties['lunch_offer'] = True if i['lunch_offer'].strip() == 'X' else False
            properties['comments'] = i['comments'].strip()

            if i['facility']:
                for item in re.split(r'[ |-]', i['facility']):
                    values.append(item)

            if i['address']:
                for item in re.split(r'[ |-]', i['address']):
                    values.append(item.replace('Str.', 'strasse'))

            values.append('Flensburg')

            properties['slug'] = get_slug(values)
            geometries['coordinates'] = get_coordinates(lookup)

            f = {
                'geometry': geometries,
                'properties': properties
            }

            features.append(f)

    return features


@click.command()
@click.argument('src')
def main(src):
    filename = Path(src).stem
    parent = str(Path(src).parent)
    dest = Path(f'{parent}/{filename}.geojson')

    features = read_input(src)
    collection = generate_geojson(features)

    with open(dest, 'w', encoding='utf8') as f:
        json.dump(collection, f, ensure_ascii=False)


if __name__ == '__main__':
    main()
