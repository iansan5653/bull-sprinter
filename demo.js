const ROUTES_URL = "https://transit.land/api/v1/routes?operated_by=o-dhvrs-usfbullrunner";
const STOPS_BASE_URL = "https://transit.land/api/v1/stops?served_by=";

function fetchResource(url) {
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
  routePaths = {all: []};
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
    routePaths[route.onestop_id] = routePath;
    routePaths.all.push(routePath);
  });

  showStops(data, map, routePaths);
}

function showStops(data, map, routePaths) {
  let routes = {all: []}
  data.stops.forEach(stop => {
    coordinates = {lng: +stop.geometry.coordinates[0], lat: +stop.geometry.coordinates[1]};
    let stopMarker = new google.maps.Marker({
      animation: google.maps.Animation.DROP,
      title: stop.name,
      map: map,
      opacity: 0.5,
      position: coordinates
    })
    for(let route of stop.routes_serving_stop) {
      if(!routes[route.route_onestop_id]) {
        routes[route.route_onestop_id] = []
      }
      routes[route.route_onestop_id].push(stopMarker)
      routes.all.push(stopMarker)
    }
  });

  addRouteListeners(routes, routePaths)
}

function addRouteListeners(routes, routePaths) {
  document.querySelectorAll(".route-selector").forEach(routeSelector => {
    routeSelector.addEventListener("mouseover", event => {
      routePaths.all.forEach(routePath => {
        routePath.setVisible(false);
      });
      routes.all.forEach(stopMarker => {
        stopMarker.setVisible(false);
      });
      routePaths[routeSelector.dataset.onestop_id].setVisible(true);
      routes[routeSelector.dataset.onestop_id].forEach(stopMarker => {
        stopMarker.setVisible(true);
      });
    });
    routeSelector.addEventListener("mouseout", event => {
      routePaths.all.forEach(routePath => {
        routePath.setVisible(true);
      });
      routes.all.forEach(stopMarker => {
        stopMarker.setVisible(true);
      });
    });
    routeSelector.addEventListener("click", event => {
      routePaths[routeSelector.dataset.onestop_id]
    });
  })
}

function startMap(data) {
  const USF = {lat: 28.0610596, lng: -82.4155004};
  let map = new google.maps.Map(
      document.getElementById('map-container'), {
        zoom: 15, 
        center: USF,
        disableDefaultUI: true,
        gestureHandling: "greedy",
        minZoom: 13
      });

  initRoutesMenu(data, map)
}

function initRoutesMenu(data, map) {
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
    routeElement.dataset.onestop_id = route.onestop_id;
    routesMenu.appendChild(routeElement);
  });

  showRoutes(data, map)
}

function initialize(data) {
  console.log(data);
  startMap(data);
}

function initMap() {
  fetchResource(ROUTES_URL).then(getJSONFromResponse).then(loadStops).then(initialize).catch(err => {
    console.error(err);
  })
}

async function loadStops(routesData) {
  allStops = [];
  for(let route of routesData.routes) {
    let stopsUrl = STOPS_BASE_URL + route.onestop_id;
    await fetchResource(stopsUrl).then(getJSONFromResponse).then(stopsData => {
      for(let stop of stopsData.stops) {
        if(!allStops.some(item => item.onestop_id === stop.onestop_id)) {
          allStops.push(stop)
        } else {
          stopIndex = allStops.findIndex(item => item.onestop_id === stop.onestop_id)
          allStops[stopIndex].routes_serving_stop.push(stop.routes_serving_stop[0])
        }
      }
    }).catch(err => console.error(err));
  }
  return {
    routes: routesData.routes,
    stops: allStops
  };
}