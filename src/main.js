import L from 'leaflet'
import 'leaflet-control-geocoder'
import 'leaflet.markercluster'

import 'leaflet/dist/leaflet.css'
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'

import kitas from 'url:../data/kitas_in_flensburg.geojson'
import districts from 'url:../data/flensburg_stadtteile.geojson'

import markerDefault from 'url:../static/marker-icon-default.webp'
import markerSelected from 'url:../static/marker-icon-active.webp'



fetch(kitas, {
  method: 'GET'
}).then((response) => response.json()).then((data) => {
  marker(data)
}).catch(function (error) {
  console.log(error)
})


fetch(districts, {
  method: 'GET'
}).then((response) => response.json()).then((data) => {
  addDistrictsLayer(data)
}).catch(function (error) {
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
  attribution: '<a href="https://www.bkg.bund.de">© GeoBasis-DE / BKG 2024</a> | <a href="https://creativecommons.org/licenses/by/4.0">CC BY 4.0</a>'
}).addTo(map)

/* L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map)*/

let geocoder = L.Control.Geocoder.nominatim()
let previousSelectedMarker = null


if (typeof URLSearchParams !== 'undefined' && location.search) {
  // parse /?geocoder=nominatim from URL
  const params = new URLSearchParams(location.search)
  const geocoderString = params.get('geocoder')

  if (geocoderString && L.Control.Geocoder[geocoderString]) {
    console.log('Using geocoder', geocoderString)
    geocoder = L.Control.Geocoder[geocoderString]()
  }
  else if (geocoderString) {
    console.warn('Unsupported geocoder', geocoderString)
  }
}

const osmGeocoder = new L.Control.geocoder({
  query: 'Flensburg',
  position: 'topright',
  placeholder: 'Adresse oder Ort',
  defaultMarkGeocode: false
}).addTo(map)


osmGeocoder.on('markgeocode', (e) => {
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
  const prerequisite = feature.properties.prerequisite
  const opening_hours = feature.properties.opening_hours
  const integrational = feature.properties.integrational
  const childcare_places = feature.properties.childcare_places
  const group_6_14 = feature.properties.group_6_14
  const group_0_3 = feature.properties.group_0_3
  const group_3_6 = feature.properties.group_3_6
  const group_1_6 = feature.properties.group_1_6
  const nature_3_6 = feature.properties.nature_3_6
  const groups_total = feature.properties.groups_total
  const lunch_offer = feature.properties.lunch_offer
  const comments = feature.properties.comments

  let detailOutput = ''

  if (facility !== '') {
    detailOutput += `<li class="pb-2 text-xl lg:text-2xl"><strong>${facility}</strong></li>`
  }

  if (address !== '' && postal_code !== '') {
    detailOutput += `<li class="last-of-type:pb-2 py-1 mb-3">${address}<br>${postal_code} Flensburg</li>`
  }

  if (childcare_places > 0 && groups_total > 0) {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>${childcare_places}</strong> Plätze in <strong>${groups_total}</strong> Gruppen</li>`
  }

  if (group_6_14 > 0) {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>${group_6_14}</strong> Hort für 6 - 14 jährige</li>`
  }

  if (group_0_3 > 0) {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>${group_0_3}</strong> Krippengruppen für 1 - 3 jährige</li>`
  }

  if (group_3_6 > 0) {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>${group_3_6}</strong> Regelgruppen für 3 - 6 jährige</li>`
  }

  if (group_1_6 > 0) {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>${group_1_6}</strong> Altersgemischte Gruppen für 1 - 6 jährige</li>`
  }

  if (nature_3_6 > 0) {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>${nature_3_6}</strong> Naturgruppen für 3 - 6 jährige</li>`
  }

  if (lunch_offer === true) {
    detailOutput += '<li class="last-of-type:pb-2 pt-2"><strong>Mittagsessen:</strong> Ja</li>'
  }

  if (opening_hours !== '') {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>Öffnungszeiten</strong><br>${opening_hours} Uhr</li>`
  }

  if (comments !== '') {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>Bemerkungen</strong><br>${comments}</li>`
  }

  if (institution !== '') {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>Träger</strong><br>${institution}</li>`
  }

  if (prerequisite !== '') {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>Aufnahmekriterien</strong><br><a class="text-blue-600 hover:text-blue-400 focus:text-blue-400" target="_blank" href="${prerequisite}">Externes PDF Dokument öffnen</a></li>`
  }

  if (phone_number !== '') {
    detailOutput += `<li class="last-of-type:pb-2 pt-2"><strong>Telefon</strong><br><a class="text-blue-600 hover:text-blue-400 focus:text-blue-400" href="tel:${phone_number}">${phone_number}</a></li>`
  }

  if (director !== '') {
    detailOutput += `<li class="pt-2"><strong>Ansprechpartner</strong><br>${director}</li>`
  }

  document.querySelector('#details').classList.remove('hidden')
  document.querySelector('#detailList').innerHTML = detailOutput

  document.querySelector('title').innerHTML = facility
  document.querySelector('meta[property="og:title"]').setAttribute('content', facility)
}


const defaultIcon = L.icon({
  iconUrl: markerDefault,
  iconSize: [25, 35],
  iconAnchor: [12, 35],
  tooltipAnchor: [0, -35]
})


const selectedIcon = L.icon({
  iconUrl: markerSelected,
  iconSize: [25, 35],
  iconAnchor: [12, 35],
  tooltipAnchor: [0, -35]
})


function marker(data) {
  const markers = L.markerClusterGroup({
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 15
  })

  const geojsonGroup = L.geoJSON(data, {
    onEachFeature(feature, layer) {
      layer.on('click', function (e) {
        document.getElementById('filter').scrollTo({
          top: 0,
          left: 0
        })

        const currentZoom = map.getZoom()

        if (currentZoom < 15) {
          map.setView(e.latlng, 15)
        }
        else {
          map.setView(e.latlng, currentZoom)
        }

        renderFeatureDetails(e.target.feature)
      })
    },
    pointToLayer(feature, latlng) {
      const label = String(feature.properties.facility)

      return L.marker(latlng, { icon: defaultIcon }).bindTooltip(label, {
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