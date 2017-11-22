/* global document, $, moment, avgrund */

function showError(err) {
  if (!err) {
    return;
  }
  if ($(document).width() <= 500) {
    $('html, body').animate({ scrollTop: 0 }, 'fast', () => {
      $('#avPopup p').text(err);
      avgrund.activate('stack');
    });
  }
  $('#avPopup p').text(err);
  avgrund.activate('stack');
}

$(document).ready(() => {
  $('#loadingOverlay').animate({ opacity: 0 }, 'fast', function () {
    $(this).removeClass('loading');
    $(this).hide();
  });
  $('#loginModal').modal({ backdrop: 'static', keyboard: false });
  $('[data-toggle="popover"]').popover();

  // Initializing time
  $('#totalDuration').attr('data-deptime', JSON.stringify({
    hours: 0,
    minutes: 0,
  }));

  $('#totalDuration').attr('data-returntime', JSON.stringify({
    hours: 0,
    minutes: 0,
  }));

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

  $('.pretty').click(function () {
    const flightData = $(this).closest('#accordion').data('flight');
    const hours = Math.abs(flightData.duration.hours);
    const minutes = flightData.duration.minutes ? Math.abs(flightData.duration.minutes) : 0;
    const price = $(this).data('price');
    const classType = $(this).attr('id');

    $('#summaryCard').addClass('animated pulse').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => {
      $('#summaryCard').removeClass('animated pulse');
    });

    if ($(this).data('flightType') === 'depart') {
      $('#depart').html(flightData.route.join('<i id="arrow" class="material-icons">arrow_forward</i>'));
      $('#depart').attr('data-price', price);
      $('#totalDuration').attr('data-deptime', JSON.stringify({
        hours,
        minutes,
      }));
      $('#summaryCard').attr('data-depart', JSON.stringify(flightData));
      $('#summaryCard').attr('data-depart-class', classType);
      $('#departDuration').attr('data-time', `Hours: ${hours} Minutes: ${minutes}`);
      $('#departDuration').text(`Hours: ${hours} Minutes: ${minutes}`);
    } else {
      $('#return').html(flightData.route.reverse().join('<i id="arrow" class="material-icons">arrow_back</i>'));
      $('#return').attr('data-price', price);
      $('#totalDuration').attr('data-returntime', JSON.stringify({
        hours,
        minutes,
      }));
      $('#summaryCard').attr('data-return', JSON.stringify(flightData));
      $('#summaryCard').attr('data-return-class', classType);
      $('#returnDuration').attr('data-time', `Hours: ${hours} Minutes: ${minutes}`);
      $('#returnDuration').text(`Hours: ${hours} Minutes: ${minutes}`);
    }
    const time = moment();
    const depDuration = JSON.parse($('#totalDuration').attr('data-deptime'));
    const returnDuration = JSON.parse($('#totalDuration').attr('data-returntime'));
    time.set('hour', depDuration.hours);
    time.set('minute', depDuration.minutes);
    time.set('day', 0);
    time.add(returnDuration.minutes, 'minutes');
    time.add(returnDuration.hours, 'hours');
    const timeString = `${time.get('day') === 0 ? '' : `Days: ${time.get('day')} `} Hours: ${time.get('hour')} Minutes: ${time.get('minute')}`;
    $('#totalDuration').text(timeString);
    const departPrice = ($('#depart').attr('data-price') === '') || ($('#depart').attr('data-price') === undefined) ? 0 : parseFloat($('#depart').attr('data-price'));
    const returnPrice = ($('#return').attr('data-price') === '') || ($('#return').attr('data-price') === undefined) ? 0 : parseFloat($('#return').attr('data-price'));
    $('#summaryCard').attr('data-total-price', departPrice + returnPrice);
    $('#totalPrice').text(`$${departPrice + returnPrice}`);
  });

  $('#bookButton').click(() => {
    const returnState = $('#summaryCard').data('returnState');
    const departState = $('#summaryCard').attr('data-depart') === '';
    const returnS = $('#summaryCard').attr('data-return') === '';
    const seats = $('#summaryCard').data('seats');
    const price = $('#summaryCard').data('totalPrice');
    const departTime = $('#departDuration').data('time');
    const returnTime = $('#returnDuration').data('time');
    const departClass = $('#summaryCard').data('departClass');
    const returnClass = $('#summaryCard').data('returnClass');
    const totalDuration = $('#totalDuration').text();
    const flightData = {};
    let i;
    let j;

    if (returnState) {
      if (departState && returnS) {
        showError('Please select a departing and returning flight.');
      } else if (departState) {
        showError('Please select a departing flight.');
      } else if (returnS) {
        showError('Please select a returning flight.');
      } else {
        showError(false);
        $('#loadingOverlay').addClass('loading');
        $('#loadingOverlay').show();
        $('#loadingOverlay').animate({ opacity: 1 }, 'fast');
        flightData.depart = JSON.parse($('#summaryCard').attr('data-depart'));
        flightData.return = JSON.parse($('#summaryCard').attr('data-return'));
        for (i = 0; i < flightData.depart.serialid.length; i += 1) {
          flightData.depart.serialid[i] = parseInt(flightData.depart.serialid[i], 10);
        }
        for (j = 0; j < flightData.return.serialid.length; j += 1) {
          flightData.return.serialid[j] = parseInt(flightData.return.serialid[j], 10);
        }
        flightData.seats = seats;
        flightData.returnState = returnState;
        flightData.totalPrice = price;
        flightData.departTime = departTime;
        flightData.returnTime = returnTime;
        flightData.depart.departClass = departClass;
        flightData.return.returnClass = returnClass;
        flightData.totalDuration = totalDuration;
        $('#toSubmit input').val(JSON.stringify(flightData));
        $('#toSubmit').submit();
      }
    } else {
      if (departState) { //eslint-disable-line
        showError('Please select a departing flight.');
      } else {
        showError(false);
        $('#loadingOverlay').addClass('loading');
        flightData.depart = JSON.parse($('#summaryCard').attr('data-depart'));
        for (i = 0; i < flightData.depart.serialid.length; i += 1) {
          flightData.depart.serialid[i] = parseInt(flightData.depart.serialid[i], 10);
        }
        flightData.seats = seats;
        flightData.returnState = returnState;
        flightData.totalPrice = price;
        flightData.departTime = departTime;
        flightData.depart.departClass = departClass;
        flightData.totalDuration = totalDuration;
        $('#toSubmit input').val(JSON.stringify(flightData));
        $('#toSubmit').submit();
      }
    }
  });

  $('#submitPass').click(() => {
    $('#finalBook').submit();
  });

  $('#avgrundClose').click(() => {
    avgrund.deactivate();
  });
});
