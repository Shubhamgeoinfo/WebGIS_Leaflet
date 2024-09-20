// Initialize the map
var map = L.map("map").setView([20.5937, 78.9629], 5); // Centered on India

// Add two basemaps (OpenStreetMap and Satellite)
var osmBaseLayer = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }
).addTo(map);

var satelliteBaseLayer = L.tileLayer(
  "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  {
    maxZoom: 19,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    attribution: "© Google Satellite",
  }
);

var layersControl = L.control
  .layers({
    OpenStreetMap: osmBaseLayer,
    Satellite: satelliteBaseLayer,
  })
  .addTo(map);

// Add WMS layers
var indiaCountryLayer = L.tileLayer
  .wms("https://wms.qgiscloud.com/shubhamgeoinfo/Database_using_QGIS/", {
    layers: "India_country",
    format: "image/png",
    transparent: true,
    attribution: "QGIS Cloud",
  })
  .addTo(map);

var indiaStateLayer = L.tileLayer.wms(
  "https://wms.qgiscloud.com/shubhamgeoinfo/Database_using_QGIS/",
  {
    layers: "India_State",
    format: "image/png",
    transparent: true,
    attribution: "QGIS Cloud",
  }
);

var indiaDistrictLayer = L.tileLayer.wms(
  "https://wms.qgiscloud.com/shubhamgeoinfo/Database_using_QGIS/",
  {
    layers: "India_District",
    format: "image/png",
    transparent: true,
    attribution: "QGIS Cloud",
  }
);

var indiaBlockLayer = L.tileLayer.wms(
  "https://wms.qgiscloud.com/shubhamgeoinfo/Database_using_QGIS/",
  {
    layers: "India_Block",
    format: "image/png",
    transparent: true,
    attribution: "QGIS Cloud",
  }
);

layersControl.addOverlay(indiaCountryLayer, "India Country");
layersControl.addOverlay(indiaStateLayer, "India State");
layersControl.addOverlay(indiaDistrictLayer, "India District");
layersControl.addOverlay(indiaBlockLayer, "India Block");

// Add the editor toolbar
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
  edit: {
    featureGroup: drawnItems,
  },
  draw: {
    polygon: true,
    polyline: true,
    rectangle: true,
    circle: false,
    marker: true,
  },
});
map.addControl(drawControl);

map.on("draw:created", function (e) {
  var type = e.layerType,
    layer = e.layer;
  drawnItems.addLayer(layer);
});

// Add the measurement tool for length and area
L.control
  .measure({
    primaryLengthUnit: "kilometers",
    primaryAreaUnit: "sqmeters",
    activeColor: "#ff0000",
    completedColor: "#ff0000",
  })
  .addTo(map);

// Buffer tool UI
var bufferToolDiv = document.createElement("div");
bufferToolDiv.id = "buffer-input";
bufferToolDiv.innerHTML = `
    <input type="number" id="buffer-distance" placeholder="Buffer Distance (m)" />
    <button id="create-buffer">Create Buffer</button>
`;
document.body.appendChild(bufferToolDiv);

// Buffer tool logic
document.getElementById("create-buffer").addEventListener("click", function () {
  var distance = parseFloat(document.getElementById("buffer-distance").value);
  if (isNaN(distance)) {
    alert("Please enter a valid buffer distance.");
    return;
  }

  var layers = drawnItems.getLayers();
  if (layers.length === 0) {
    alert("Please draw a feature first.");
    return;
  }

  // Create buffer around the first drawn layer
  var firstLayer = layers[0];
  var geojson = firstLayer.toGeoJSON();
  var buffered = turf.buffer(geojson, distance / 1000, { units: "kilometers" });

  // Add buffered layer to the map
  L.geoJSON(buffered).addTo(map);
});

// Shapefile Upload Button
var openDataButton = L.control({ position: "topleft" });
openDataButton.onAdd = function () {
  var div = L.DomUtil.create(
    "div",
    "leaflet-bar leaflet-control leaflet-control-custom"
  );
  div.innerHTML = "<input type='file' id='shapefile-input' accept='.zip' />";
  div.style.padding = "5px";
  return div;
};
openDataButton.addTo(map);

// Shapefile upload functionality
document
  .getElementById("shapefile-input")
  .addEventListener("change", function (event) {
    var file = event.target.files[0];
    if (file) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var shapefile = new L.Shapefile(e.target.result);
        shapefile.addTo(map);
      };
      reader.readAsArrayBuffer(file);
    }
  });
