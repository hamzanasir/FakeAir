/* global document, $ */

$(document).ready(() => {
  $('#loginModal').modal({ backdrop: 'static', keyboard: false });
  $('[data-toggle="popover"]').popover();

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
          $('#city').val(airportData.city);
          $('#longitude').val(airportData.lon);
          $('#latitude').val(airportData.lat);
          $('#name').val(airportData.name);
          if (airportData.country === 'United States' || airportData.country === 'Canada') {
            $('#state').val(airportData.state);
            $('#state').removeAttr('disabled');
          } else {
            $('#state').val('');
            $('#state').attr('disabled', 'disabled');
          }
        }
      });
    });
  });

  $('#code').focusout((e) => {
    $.getJSON('/scripts/airlines.json', (json) => {
      $.each(json, (airline, data) => {
        if (data.IATA === e.target.value.toUpperCase()) {
          $('#code').val(e.target.value.toUpperCase());
          $('#name-airline').val(data.name);
        }
      });
    });
  });
});
