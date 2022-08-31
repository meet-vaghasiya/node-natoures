export const setMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibWVldC12YWdoYXNpeWF5YSIsImEiOiJjbDcyNnYzZ2owaGxwM29uOWZlNWNpZTE3In0.N0gA8yWoS0-gFZq-vqe3Zg';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-77.034084, 38.909671],
    zoom: 8,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((locations) => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(locations.coordinates)
      .addTo(map);
    bounds.extend(locations.coordinates);
  });

  map.fitBounds(bounds);
};
