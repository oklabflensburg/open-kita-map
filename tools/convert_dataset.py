#!./venv/bin/python

import os
import csv
import click
import json

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


def read_input(src):
    result = []

    with open(src, 'r') as f:
        reader = csv.DictReader(f)

        for i in reader:
            address = i['address'].replace(' ', '+')
            postal_code = i['postal_code'].strip()
            district = i['district'].strip()

            lookup = f'{address}+{postal_code}+{district}+Flensburg'
            coords = get_coordinates(lookup)

            d = {}
            d['geometry'] = coords
            d['district'] = district
            d['postal_code'] = postal_code
            d['address'] = i['address'].strip()
            d['facility'] = i['facility'].strip()
            d['director'] = i['director'].strip()
            d['institution'] = i['institution'].strip()
            d['integrational'] = i['integrational'].strip()
            d['opening_hours'] = i['opening_hours'].strip()
            d['phone_number'] = i['phone_number'].strip()
            d['free_places'] = i['free_places'].strip()
            d['group_6_14'] = i['group_6_14'].strip()
            d['group_0_3'] = i['group_0_3'].strip()
            d['group_3_6'] = i['group_3_6'].strip()
            d['group_1_6'] = i['group_1_6'].strip()
            d['nature_3-6'] = i['nature_3-6'].strip()
            d['groups_total'] = i['groups_total'].strip()
            d['lunch_offer'] = True if i['lunch_offer'].strip() == 'X' else False
            d['comments'] = i['comments'].strip()

            result.append(d)

    return result


def get_coordinates(lookup):
    g = GoogleV3(api_key=api_key)
    locations = g.geocode(query=lookup, exactly_one=True)

    loc = {
        'coordinates': []
    }

    try:
        if not hasattr(locations, 'raw'):
            return loc

        try:
            loc['coordinates'] = [locations.latitude, locations.longitude]
        except (TypeError, AttributeError, IndexError) as e:
            print(e)
    except Exception as e:
        print(e)

    return loc


@click.command()
@click.argument('src')
def main(src):
    filename = Path(src).stem
    parent = str(Path(src).parent)
    dest = Path(f'{parent}/{filename}.json')

    result = read_input(src)

    with open(dest, 'w') as f:
        json.dump(result, f)


if __name__ == '__main__':
    main()
