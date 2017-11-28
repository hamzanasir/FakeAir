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

  $('.email').focusout(function () {
    const email = $(this).val();
    $.ajax({
      type: 'POST',
      url: '/verifyuser',
      data: { email },
      success(data) {
        if (data) {
          $('.userExists').val('true');
          $('#userMessage').show();
        } else {
          $('.userExists').val('false');
        }
      },
    });
  });
});
