const ROUTES_URL = "https://transit.land/api/v1/routes?operated_by=o-dhvrs-usfbullrunner";

function getJson(url) {
  return new Promise((res, rej) => {
    let xhr = new XMLHttpRequest();
    xhr.addEventListener("load", () => {
      res(xhr);
    });
    xhr.addEventListener("error", rej);
    xhr.open("GET", url);
    xhr.send();
  });
}

function getJSONFromResponse(xhr) {
  return new Promise((res, rej) => {
    if(xhr.status == 200) {
      try {
        parsedData = JSON.parse(xhr.response);
        res(parsedData);
      } catch(err) {
        rej(err);
      }
    } else {
      console.error(`Data loading failed with error ${xhr.status}`);
    }
  });
}

function showRoutesList(data) {
  let container = document.querySelector(".container");
  container.innerHTML = "";
  data.routes.forEach(route => {
    let routeHtml = `<li><span style="color:white;background-color:#${route.tags.route_color}">•••</span>
      Route ${route.name} (${route.tags.route_long_name})</li>`;
    container.innerHTML += routeHtml;
  });
}

function showRoutes(data, map) {
  data.routes.forEach(route => {
    coordinates = route.geometry.coordinates[0].map(point => {
      let pointAsLatLng = {lng: +point[0], lat: +point[1]};
      return pointAsLatLng;
    });
    let routePath = new google.maps.Polyline({
      map: map,
      path: coordinates,
      strokeColor: "#" + route.tags.route_color,
      strokeOpacity: 0.5,
      strokeWeight: 2,
      visible: true
    });
    console.log(routePath)
  })
}

function initMapWithRoutes(data) {
  const USF = {lat: 28.0610596, lng: -82.4155004};
  let map = new google.maps.Map(
      document.getElementById('map-container'), {zoom: 15, center: USF});

  showRoutes(data, map)
}

function initMap() {
  getJson(ROUTES_URL).then(getJSONFromResponse).then(initMapWithRoutes).catch(err => {
    console.error(err);
  })
}