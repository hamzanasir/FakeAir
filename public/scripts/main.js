/* global document, $ */

$(document).ready(() => {
  $('#loginModal').modal({ backdrop: 'static', keyboard: false });
  $('#miles').focusout((e) => {
    const miles = parseInt(e.target.value, 10);
    const baseFare = 50 + (miles * 0.11);
    $('#ec-price').val(baseFare);
    $('#fc-price').val(baseFare + 200);
  });

  $('#iata').focusout((e) => {
    $.getJSON('/scripts/airports.json', (json) => {
      json.forEach((airportData) => {
        if (airportData.code === e.target.value.toUpperCase()) {
          $('#iata').val(e.target.value.toUpperCase());
          $('#country').val(airportData.country);
          $('#state').val(airportData.state);
          $('#city').val(airportData.city);
          $('#longitude').val(airportData.lon);
          $('#latitude').val(airportData.lat);
        }
      });
    });
  });
});
