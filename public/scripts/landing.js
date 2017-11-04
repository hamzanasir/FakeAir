/* global document, $ */

$(document).ready(() => {
  $('#landing-button').click(() => {
    $('#landing-header').animate({ paddingTop: '19vh' }, 1000);
    $('.img-thumbnail').animate({ opacity: 1 }, 1000);
    $('.bootstrap-select').css({ width: '100%' });
  });
});
