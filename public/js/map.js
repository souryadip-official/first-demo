/* let mapToken = "<%= process.env.MAP_TOKEN %>"; */
/* We have to store the map token in a variable and then use it in the script tag because we cannot directly use the process.env.MAP_TOKEN in the script tag and moreover it should be inside double quotes because it is a string and we have to do it explicitly */
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 10 // starting zoom
});

const marker1 = new mapboxgl.Marker({ color: 'red' })
.setLngLat(listing.geometry.coordinates) // list.geometry.coordinates
.setPopup(new mapboxgl.Popup({offset: 25})
    .setHTML(`<h4>${listing.title}</h4>Exact location will be provided after booking<p>`))
.addTo(map);