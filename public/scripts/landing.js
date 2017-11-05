/* global document, $, window */

$(document).ready(() => {
  $('#landing-button').click(() => {
    if ($(window).width() < 400) {
      $('#landing-header').animate({ paddingTop: '10vh' }, 1000);
    } else {
      $('#landing-header').animate({ paddingTop: '19vh' }, 1000);
    }
    $('.img-thumbnail').animate({ opacity: 1 }, 1000);
    $('.bootstrap-select').css({ width: '100%' });
  });

  $('#toggle-one').bootstrapToggle({
    on: 'One-way',
    off: 'Return',
  });

  $('#toggle-one').parent().parent().css({ marginTop: '2.8vh' });
  $('#toggle-one').parent().css({ width: '100%' });

  $('#toggle-one').change(() => {
    $('#returning-blk').toggle(($('#toggle-one').is(':checked')));
  });

  if ($(window).width() < 400) {
    $('#landing-header').css({ paddingTop: '30vh' });
  }
});
