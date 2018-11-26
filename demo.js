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
  })
}

function initMapWithRoutes(data) {
  const USF = {lat: 28.0610596, lng: -82.4155004};
  let map = new google.maps.Map(
      document.getElementById('map-container'), {
        zoom: 15, 
        center: USF,
        disableDefaultUI: true,
        gestureHandling: "greedy",
        minZoom: 13
      });

  showRoutes(data, map)
}

function initRoutesMenu(data) {
  let routesMenu = document.getElementById("routes-menu");
  let routeTemplate = routesMenu.querySelector(".route-card")
  routeTemplate = routeTemplate.parentElement.removeChild(routeTemplate);
  data.routes.forEach(route => {
    let routeElement = routeTemplate.cloneNode(true);
    routeElement.style.borderLeftColor = "#" + route.tags.route_color;
    let routeTitle = routeElement.querySelector(".route-card--title");
    routeTitle.innerText = `Route ${route.name}`;
    let routeSubTitle = routeElement.querySelector(".route-card--subtitle");
    routeSubTitle.innerText = route.tags.route_long_name;
    routesMenu.appendChild(routeElement);
  });
}

function initRoutes(data) {
  initMapWithRoutes(data);
  initRoutesMenu(data);
}

function initMap() {
  getJson(ROUTES_URL).then(getJSONFromResponse).then(initRoutes).catch(err => {
    console.error(err);
  })
}