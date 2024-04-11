// Create the tile layer that will be the background of our map.
const streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Fetch earthquake data from USGS GeoJSON feed using d3.json
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

d3.json(url)
  .then(data => {
    // Create Leaflet map
    const map = L.map('map', {
      layers: [streetmap] // Add streetmap tile layer as default
    }).setView([0, 0], 2);

    // Define marker style function
    function getMarkerStyle(feature) {
      const magnitude = feature.properties.mag;
      const depth = feature.geometry.coordinates[2]; // Third coordinate is depth
      const markerRadius = Math.sqrt(magnitude) * 5;
       // Define color scale
  const colorScale = d3.scaleSequential(d3.interpolateRgb('greenyellow', 'red'))
  .domain([-10, 90]); // Domain of earthquake depth

const markerColor = colorScale(depth);

      return { radius: markerRadius, color: `black`, fillColor: markerColor, fillOpacity: 1.8,weight:1 };
    }

    // Add earthquake markers to map
    L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, getMarkerStyle(feature));
      },
      onEachFeature: function (feature, layer) {
        layer.bindPopup(`<strong>Location:</strong> ${feature.properties.place}<br><strong>Magnitude:</strong> ${feature.properties.mag}<br><strong>Depth:</strong> ${feature.geometry.coordinates[2]} km`);
      }
    }).addTo(map);

// Create legend
const legend = L.control({ position: 'bottomright' });
legend.onAdd = function (map) {
  const div = L.DomUtil.create('div', 'info legend');
  const depthRanges = ['-10-10', '10-30', '30-50', '50-70', '70-90', '90+'];

  // Define color scale from green to red
  const colorScale = d3.scaleSequential(d3.interpolateRgb('greenyellow', 'red'))
                      .domain([0, depthRanges.length - 1]);

  let labels = '<div style="background-color: white; padding: 10px;"><h4>Depth Legend</h4>';
  for (let i = 0; i < depthRanges.length; i++) {
    const color = colorScale(i);
    labels += `<div><span style="background-color:${color}; width: 20px; height: 20px; display: inline-block;"></span> ${depthRanges[i]}</div>`;
  }
  labels += '</div>';

  div.innerHTML = labels;
  return div;
};
legend.addTo(map);



  })
  .catch(error => console.error('Error fetching earthquake data:', error));
