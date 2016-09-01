
// Google Map object
var map;

// Object representing a Venue
function Venue(dataObj) {
    var self = this;

    self.name = dataObj.venue.name;
    self.categorieName = dataObj.venue.categories[0].name;
    self.categorieId = dataObj.venue.categories[0].id;
    self.hours = dataObj.venue.hours;
    self.location = dataObj.venue.location;
    self.latitude = parseFloat(dataObj.venue.location.lat);
    self.longitude = parseFloat(dataObj.venue.location.lng);
    self.url = dataObj.venue.url;
    self.price = dataObj.venue.price;
    self.rating = dataObj.venue.rating;

    self.mapMarker = new google.maps.Marker({
        position: {lat: self.latitude, lng: self.longitude},
        map: map,
        title: self.name
    });




    // Create the info window for this Venue object
    self.infoWindow = new google.maps.InfoWindow();

    self.showInfoWindow = function() {
        if (!self.infoWindow.getContent()) {
            self.infoWindow.setContent('Loading content...');
            var content = '<h3>' + self.name + '</h3>';
            content += '<small>' + self.categorieName + ' / ' +
                dataObj.venue.location.address + ' / ' +
                '</br> ' + 'Rating: ' + self.rating + '</small>';

            if (self.url){
                content+= '</br> <small>' + 'URL:' + self.url
            }

            self.infoWindow.setContent(content);
        }

        self.infoWindow.open(map, self.mapMarker);
    };


    self.activate = function () {

        if (Venue.prototype.active) {
            if (Venue.prototype.active !== self) {
                Venue.prototype.active.deactivate();
            }
        }

        self.mapMarker.setAnimation(google.maps.Animation.BOUNCE);
        self.showInfoWindow();

        Venue.prototype.active = self;
    };

    self.deactivate = function () {
        self.mapMarker.setAnimation(null);
        self.infoWindow.close();

        Venue.prototype.active = null;
    };

    self.focus = function () {
        map.panTo({lat: self.latitude, lng: self.longitude});
        self.activate();
    };


    self.mapMarkerClickHandler = function () {

        if (Venue.prototype.active === self) {
            self.deactivate();
        } else {
            self.activate();
        }

    };

    self.infoWindowCloseClickHandler = function () {
        self.deactivate();
    };

    self.infoWindow.addListener('closeclick', self.infoWindowCloseClickHandler);
    self.mapMarker.addListener('click', self.mapMarkerClickHandler);




}
Venue.prototype.active = null;

// Venue View Model
function VenuesViewModel() {
    var self = this;
    self.typesOptions = ko.observableArray([]);
    self.message = ko.observable('Loading Places...');
    self.venues = ko.observableArray([]);
    self.filterSelection = ko.observable('');
    self.filterSearch = ko.observable('')
    self.isVisible = ko.observable(true);

    //this calls the foursquare API in order to get the information from the place
    $.getJSON("https://api.foursquare.com/v2/venues/explore?mode=url&near=nijmegen&oauth_token=YE3CBYKSU2NPNJWNRMME2LWETMLZCFDW1A20LDBAUHNSLEHD&v=20160831", function (data) {
        var venuesArray = [];
        var typeFilters = [];
        var venue;
        var bounds = new google.maps.LatLngBounds();
        self.centerLat = data.response.geocode.center.lat;
        self.centerLong = data.response.geocode.center.lng;

        data.response.groups[0].items.forEach(function (dataObj) {
            var option = dataObj.venue.categories[0].name;

            if ($.inArray(option, typeFilters) === -1) {
                typeFilters.push(option);
            }
            venue = new Venue(dataObj);
            venuesArray.push(venue);
            bounds.extend(venue.mapMarker.position);
        });

        self.venues(venuesArray);
        self.typesOptions(typeFilters);
        map.fitBounds(bounds);

        self.message(null);
    }).fail(function (data) {
        self.message('Unable to load data... try another city or refresh the page with F5');
        alert(self.message() + "  Status Code: " + data.status + " Status Text: " + data.statusText
            + ", see the console for more information");
        console.log('ERROR: Could not acquire the place Information from the JSON');
        console.log("JSON RESPONSE: " + data.responseText);
    });


    self.filterResults = ko.computed(function () {

        var matches = [];

        if (self.filterSelection() != undefined) {
            var filter = self.filterSelection();
            var re = new RegExp(filter, 'i');
        }


        self.venues().forEach(function (venue) {

            if (venue.categorieName.search(re) !== -1) {
                matches.push(venue);
                venue.mapMarker.setVisible(true);
            } else {
                venue.mapMarker.setVisible(false);

                if (Venue.prototype.active === venue) {
                    venue.deactivate();
                }
            }
        });

        return matches;
    });


    self.toggleVisibility = function () {
        self.isVisible(!self.isVisible());
    };

    self.clickHandler = function (place) {
        if (window.innerWidth < 1024) {
            self.isVisible(false);
        }

        place.focus();
    };


}

// Callback that initializes the Google Map object and activates Knockout
function initMap() {

    var latlng = new google.maps.LatLng("51.8126", "5.8372");

    var mapOptions = {
        center: latlng,
        scrollWheel: false,
        zoom: 13
    };

    var marker = new google.maps.Marker({
        position: latlng,
        url: '/',
        animation: google.maps.Animation.DROP
    });

    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    marker.setMap(map);

    ko.applyBindings(new VenuesViewModel());

}

// This fires if there's an issue loading the Google Maps API script
function initMapLoadError() {
    alert('Failed to initialize the Google Maps API');
    console.log('Failed to initialize Google Maps API');
}



