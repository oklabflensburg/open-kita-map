# Kitafinder Flensburg

Der Kiafinder Flensburg kann allen Helfen, welche eine geignete Kindertagesstätte in Flensburg finden wollen.


![Kitafinder Flensburg](https://raw.githubusercontent.com/oklabflensburg/open-kita-map/main/screenshot_kitafinder_flensburg.jpg)

_Haftungsausschluss: Dieses Repository und die zugehörige Datenbank befinden sich derzeit in einer Beta-Version. Einige Aspekte des Codes und der Daten können noch Fehler enthalten. Bitte kontaktieren Sie uns per E-Mail oder erstellen Sie ein Issue auf GitHub, wenn Sie einen Fehler entdecken._



## Datenquelle

- https://www.flensburg.de/media/custom/2306_2545_1.PDF



## Prerequisite

Install system dependencies and clone repository

```
sudo apt install git git-lfs virtualenv python3 python3-pip postgresql-15 postgresql-15-postgis-3 postgis
git clone https://github.com/oklabflensburg/open-kita-map.git
```

Create dot `.env` file inside root directory. Make sure to add the following content repaced by your actual values

```
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
