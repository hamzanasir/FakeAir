/* global $, window */

$(window).on('load', () => {
  $('#loadingOverlay').animate({ opacity: 0 }, 'fast', function () {
    $(this).removeClass('loading');
    $(this).hide();
  });
  $('#landing-button').click(() => {
    if ($(window).width() < 500) {
      $('#landing-header').animate({ paddingTop: '5vh' }, 1000);
    } else {
      $('#landing-header').animate({ paddingTop: '19vh' }, 1000);
    }
    $('.img-thumbnail').animate({ opacity: 1 }, 1000);
    $('.bootstrap-select').css({ width: '100%' });
  });

  $('#toggle-one').bootstrapToggle({
    on: 'Return',
    off: 'One-way',
  });

  $('#toggle-one').parent().parent().css({ marginTop: '2.8vh' });
  $('#toggle-one').parent().css({ width: '100%' });

  $('#toggle-one').change(() => {
    $('#returning-blk').toggle(($('#toggle-one').is(':checked')));
  });
  $('#searchBtn').click(() => {
    $('#loadingOverlay').addClass('loading');
    $('#loadingOverlay').show();
    $('#loadingOverlay').animate({ opacity: 1 }, 'fast');
  });
});
