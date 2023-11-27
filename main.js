fetch('./data/uebersicht_kitas_in_flensburg.geojson', {
    method: 'GET'
})
.then((response) => {
    return response.json()
})
.then((data) => {
    marker(data)
})
.catch(function (error) {
    console.log(error)
})


fetch('./data/flensburg_stadtteile.geojson', {
    method: 'GET'
})
.then((response) => {
    return response.json()
})
.then((data) => {
    addDistrictsLayer(data)
})
.catch(function (error) {
    console.log(error)
})


const layerStyle = {
    transparent: {
        color: 'transparent',
        fillColor: 'transparent',
        fillOpacity: 0.7,
        opacity: 0.6,
        weight: 1
    },
    standard: {
        color: '#fff',
        fillColor: '#11aa44',
        fillOpacity: 0.4,
        opacity: 0.6,
        weight: 3
    },
    click: {
        color: '#fff',
        fillColor: '#002db4',
        fillOpacity: 0.4,
        opacity: 0.8,
        weight: 4
    }
}


const map = L.map('map').setView([54.7836, 9.4321], 13)

L.tileLayer.wms('https://sgx.geodatenzentrum.de/wms_basemapde?SERVICE=WMS&Request=GetCapabilities', {
  layers: 'de_basemapde_web_raster_grau',
  maxZoom: 19,
  attribution: '<a href="https://www.bkg.bund.de">© GeoBasis-DE BKG</a> | <a href="https://creativecommons.org/licenses/by/4.0">CC BY 4.0</a>'
}).addTo(map);

/*L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map)*/

let geocoder = L.Control.Geocoder.nominatim()
let previousSelectedMarker = null


if (typeof URLSearchParams !== 'undefined' && location.search) {
    // parse /?geocoder=nominatim from URL
    let params = new URLSearchParams(location.search)
    let geocoderString = params.get('geocoder')

    if (geocoderString && L.Control.Geocoder[geocoderString]) {
        console.log('Using geocoder', geocoderString)
        geocoder = L.Control.Geocoder[geocoderString]()
    } else if (geocoderString) {
        console.warn('Unsupported geocoder', geocoderString)
    }
}

const osmGeocoder = new L.Control.geocoder({
    query: 'Flensburg',
    position: 'topright',
    placeholder: 'Adresse oder Ort',
    defaultMarkGeocode: false
}).addTo(map)


osmGeocoder.on('markgeocode', e => {
    const bounds = L.latLngBounds(e.geocode.bbox._southWest, e.geocode.bbox._northEast)
    map.fitBounds(bounds)
})


function addDistrictsLayer(data) {
    L.geoJson(data, {
        style: layerStyle.standard
    }).addTo(map)
}


function renderFeatureDetails(feature) {
    const district = feature.properties.district
    const address = feature.properties.address
    const postal_code = feature.properties.postal_code
    const facility = feature.properties.facility
    const director = feature.properties.director
    const phone_number = feature.properties.phone_number
    const institution = feature.properties.institution
    const opening_hours = feature.properties.opening_hours
    const integrational = feature.properties.integrational
    const free_places = feature.properties.free_places
    const group_6_14 = feature.properties.group_6_14
    const group_0_3 = feature.properties.group_0_3
    const group_3_6 = feature.properties.group_3_6
    const group_1_6 = feature.properties.group_1_6
    const nature_3_6 = feature.properties.nature_3_6
    const groups_total = feature.properties.groups_total
    const lunch_offer = feature.properties.lunch_offer
    const comments = feature.properties.comments

    console.log(feature.properties)

    document.getElementById('details').classList.remove('hidden')
    document.getElementById('address').innerHTML = feature.properties

    document.querySelector('title').innerHTML = facility
    document.querySelector('meta[property="og:title"]').setAttribute('content', facility)
}


const defaultIcon = L.icon({
    iconUrl: './static/marker-icon-blue.png',
    shadowUrl: './static/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    tooltipAnchor: [2, -41],
    shadowSize: [45, 41]
})


const selectedIcon = L.icon({
    iconUrl: './static/marker-icon-red.png',
    shadowUrl: './static/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    tooltipAnchor: [2, -41],
    shadowSize: [45, 41]
})


function marker(data) {
    let markers = L.markerClusterGroup({
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 15
    })

    const geojsonGroup = L.geoJSON(data, {
        onEachFeature: function (feature, layer) {
            layer.on('click', function (e) {
                document.getElementById('filter').scrollTo({
                    top: 0,
                    left: 0
                })
                
                const currentZoom = map.getZoom()

                if (currentZoom < 15) {
                    map.setView(e.latlng, 15)
                }

                renderFeatureDetails(e.target.feature)
            })
        },
        pointToLayer: function (feature, latlng) {
            const label = String(feature.properties.facility)

            return L.marker(latlng, {icon: defaultIcon}).bindTooltip(label, {
                permanent: false,
                direction: 'top'
            }).openTooltip()
        }
    })


    markers.on('click', function (a) {
        if (previousSelectedMarker !== null) {
            previousSelectedMarker.setIcon(defaultIcon)
        }

        a.layer.setIcon(selectedIcon)
        previousSelectedMarker = a.layer
    })

    markers.addLayer(geojsonGroup)
    map.addLayer(markers)
}
