import L from 'leaflet'
import 'leaflet-control-geocoder'
import 'leaflet.markercluster'

import 'leaflet/dist/leaflet.css'
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'

import kitas from 'url:../data/kitas_in_flensburg.geojson'
import districts from 'url:../data/flensburg_stadtteile.geojson'

import markerDefault from 'url:../static/marker-icon-default.webp'
import markerActive from 'url:../static/marker-icon-active.webp'

import { Env } from './env.js'


const env = new Env()
env.injectLinkContent('.contact-mail', 'mailto:', '', env.contactMail, 'E-Mail')


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
  standard: {
    color: '#fff',
    fillColor: '#6ed0ef',
    fillOpacity: 0.4,
    opacity: 0.6,
    weight: 3
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
let slugUrlActive = null


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


function capitalizeEachWord(str) {
  return str.replace(/-/g, ' ').replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}


function renderFeatureDetails(feature) {
  const slug = feature.properties.slug
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

  const title = `${capitalizeEachWord(slug)} - Schulen in Flensburg`

  document.querySelector('title').innerHTML = title
  document.querySelector('meta[property="og:title"]').setAttribute('content', title)
  document.querySelector('meta[property="og:url"]').setAttribute('content', `${window.location.href}${slug}`)

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
    detailOutput += `<li class="pt-2"><strong>Leitung</strong><br>${director}</li>`
  }

  document.querySelector('#details').classList.remove('hidden')
  document.querySelector('#detailList').innerHTML = detailOutput

  document.querySelector('title').innerHTML = facility
  document.querySelector('meta[property="og:title"]').setAttribute('content', facility)
}


const defaultIcon = L.icon({
  iconUrl: markerDefault,
  iconSize: [30, 36],
  iconAnchor: [15, 36],
  tooltipAnchor: [0, -37]
})


const selectedIcon = L.icon({
  iconUrl: markerActive,
  iconSize: [30, 36],
  iconAnchor: [15, 36],
  tooltipAnchor: [0, -37]
})


function marker(data) {
  const markers = L.markerClusterGroup({
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 15
  })

  const geojsonGroup = L.geoJSON(data, {
    onEachFeature(feature, layer) {
      const slug = String(feature.properties.slug)
      const path = decodeURIComponent(window.location.pathname)

      if (slug === path.slice(1)) {
        document.querySelector('#about').classList.add('hidden')
        layer.setIcon(selectedIcon)
        previousSelectedMarker = layer
        renderFeatureDetails(feature)
        map.setView(layer._latlng, 18)
        slugUrlActive = true
      }

      layer.on('click', function (e) {
        document.getElementById('filter').scrollTo({
          top: 0,
          left: 0
        })

        const currentZoom = map.getZoom()

        if (currentZoom < 15) {
          map.setView(e.latlng, 15)
        }

        document.querySelector('#about').classList.add('hidden')
        map.setView(e.latlng, 18)
        renderFeatureDetails(e.target.feature)
        history.pushState({ page: slug }, slug, slug)
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

window.addEventListener('popstate', (event) => {
  console.debug(`location: ${document.location}, state: ${JSON.stringify(event.state)}`)
})