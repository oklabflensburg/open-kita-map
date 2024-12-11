# Kitafinder Flensburg

[![Lint css files](https://github.com/oklabflensburg/open-kita-map/actions/workflows/lint-css.yml/badge.svg)](https://github.com/oklabflensburg/open-kita-map/actions/workflows/lint-css.yml)
[![Lint html files](https://github.com/oklabflensburg/open-kita-map/actions/workflows/lint-html.yml/badge.svg)](https://github.com/oklabflensburg/open-kita-map/actions/workflows/lint-html.yml)
[![Lint js files](https://github.com/oklabflensburg/open-kita-map/actions/workflows/lint-js.yml/badge.svg)](https://github.com/oklabflensburg/open-kita-map/actions/workflows/lint-js.yml)
[![Lighthouse CI](https://github.com/oklabflensburg/open-kita-map/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/oklabflensburg/open-kita-map/actions/workflows/lighthouse.yml)

Der Kiafinder Flensburg kann allen Helfen, welche eine geignete Kindertagesstätte in Flensburg finden wollen.


![Kitafinder Flensburg](https://raw.githubusercontent.com/oklabflensburg/open-kita-map/main/screenshot_kitafinder_flensburg.jpg)

_Haftungsausschluss: Dieses Repository und die zugehörige Datenbank befinden sich derzeit in einer Beta-Version. Einige Aspekte des Codes und der Daten können noch Fehler enthalten. Bitte kontaktieren Sie uns per E-Mail oder erstellen Sie ein Issue auf GitHub, wenn Sie einen Fehler entdecken._



## Hintergrund

Die Idee, einen Kitafinder für Flensburg zu entwickeln, ist aus der eigenen Suche nach einer Kita für den Kleinen entstanden. Auf der [städtischen Website](https://www.flensburg.de/Kultur-Bildung/Bildungsb%C3%BCro/Kindertagesbetreuung/Kindertagesst%C3%A4tten) finden sich zwar Kontaktdetails zu den städtischen Kindertagesstätten und ein Link zu einer PDF Datei mit einer Liste aller Kindertagesstätten in Flensburg, jedoch fehlt eine übersichtliche Karte, die alle Kitas anzeigt. Aus dieser Fragestellung heraus ist diese Karte entstanden, um anderen Eltern die Suche nach einem Kitaplatz zu erleichtern.


## Datenquelle

Ein Großteil der Informationen der Kindertagesstätten wurde aus dem [Datensatz](https://opendata.schleswig-holstein.de/dataset/kindertagesstaetten-2024-01-17) des Open Data Portals Schleswig-Holstein bezogen. Zusätzlich haben wir weitere Daten aus der [Liste aller Kindertagesstätten](https://www.flensburg.de/media/custom/2306_2545_1.PDF) in Flensburg genutzt. Die Kartendarstellung wird von engagierten Eltern und ehrenamtlichen Mitgliedern des [OK Lab Flensburgs](https://oklabflensburg.de) entwickelt.



## Mitmachen

Du kannst jederzeit ein Issue auf GitHub öffnen oder uns über oklabflensburg@grain.one schreiben




## Prerequisite

Install system dependencies and clone repository

```
sudo apt install git git-lfs virtualenv python3 python3-pip postgresql-15 postgresql-15-postgis-3 postgis
git clone https://github.com/oklabflensburg/open-kita-map.git
```

Create dot `.env` file inside root directory. Make sure to add the following content repaced by your actual values

```
BASE_URL=http://localhost

CONTACT_MAIL=mail@example.com
CONTACT_PHONE="+49xx"

PRIVACY_CONTACT_PERSON="Firstname Lastname"

ADDRESS_NAME="Address Name"
ADDRESS_STREET="Address Street"
ADDRESS_HOUSE_NUMBER="House Number"
ADDRESS_POSTAL_CODE="Postal Code"
ADDRESS_CITY="City"

DB_PASS=postgres
DB_HOST=localhost
DB_USER=postgres
DB_NAME=postgres
DB_PORT=5432
```


## Update repository

```
git pull
git lfs pull
```


## Create SQL schema

Run sql statements inside `open-kita-map` root directory

```
sudo -i -Hu postgres psql -U postgres -h localhost -d postgres -p 5432 < data/kitafinder_schema.sql
```


## Import inventory

Required when you want to fetch data via API

```
cd tools
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
python convert_dataset.py ../data/uebersicht_kitas_in_flensburg.csv
python insert_facility.py ../data/uebersicht_kitas_in_flensburg.geojson
deactivate
```


---


## How to Contribute

Contributions are welcome! Please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) guide for details on how to get involved.


---


## License

This repository is licensed under [CC0-1.0](LICENSE).
