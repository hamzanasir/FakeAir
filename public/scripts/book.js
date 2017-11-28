/* global document, $ */

$(document).ready(() => {
  $.ajax({
    type: 'POST',
    url: '/airportcodes',
    success(data) {
      data.forEach((airport) => {
        $('.homeairport').append(`<option>${airport.iata}</option>`);
      });
    },
  });
});
