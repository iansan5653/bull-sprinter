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

function showRoutes(data) {
  let container = document.querySelector(".container");
  container.innerHTML = "";
  data.routes.forEach(route => {
    let routeHtml = `<li><span style="color:white;background-color:#${route.tags.route_color}">•••</span>
      Route ${route.name} (${route.tags.route_long_name})</li>`;
    container.innerHTML += routeHtml;
  });
}

getJson(ROUTES_URL).then(getJSONFromResponse).then(showRoutes);
document.addEventListener("ready", () => {
  console.log("test");
});