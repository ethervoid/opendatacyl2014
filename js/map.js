var VIZ_URL = 'http://opendatacyl.cartodb.com/api/v2/viz/81b7caf8-9c49-11e4-8bfa-0e018d66dc29/viz.json';
var ZOOM_TO_POINT = 7;

var PROVINCE_COORD = {
    'Ávila': [40.654347222222, -4.6962222222222],
    'Burgos': [42.35, -3.69],
    'León': [42.598888888889, -5.5669444444444],
    'Palencia': [42.016666666667, -4.5333333333333],
    'Salamanca': [40.965, -5.6638888888889],
    'Segovia': [41.166667, -4],
    'Soria': [41.666666666667, -2.6666666666667],
    'Valladolid': [41.583333, -4.666667],
    'Zamora': [41.75, -6]
};

var map;
var grouped_layer;
var points_layer;

function init_map() {
    cartodb.createVis('header_map', VIZ_URL, {
        zoom: ZOOM_TO_POINT,
        center: PROVINCE_COORD['Palencia'],
        minZoom: 5,
        maxZoom: 7
    })
        .done(function (vis, layers) {
            map = vis.getNativeMap();
            grouped_layer = layers[1].getSubLayer(1);
            points_layer = layers[1].getSubLayer(2);

            points_layer.set({'interactivity': ['titulo', 'localidad', 'identificador']});

            points_layer.on('featureClick', function (e, pos, latlng, data) {
                var scope = angular.element($("#region")).scope();
                scope.mainController.goToDetail(data.identificador);
            });

            map.on('zoomend', function () {
                if (map.getZoom() > ZOOM_TO_POINT) {
                    show_points_layer();
                } else {
                    show_grouped_layer();
                }
            });

            show_points_layer();

            geolocate();
        });
}

function geolocate() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(moveToGPS);
    }
}

function moveToGPS(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    if (latitude > 40.5 && latitude < 43 && longitude > -6 && longitude < -2.4) {
        map.setView([latitude, longitude], 9, {pan: {animate: true, duration: 0.5, easeLinearity: 0.5}});
    }
}


function show_grouped_layer() {
    grouped_layer.show();
    points_layer.hide();
}

function show_points_layer() {
    grouped_layer.hide();
    points_layer.show();
}

function center_in_province(province) {
    map.setView(PROVINCE_COORD[province], 9, {pan: {animate: true, duration: 0.5, easeLinearity: 0.5}});
}