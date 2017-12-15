/* global $, window, document, TweenMax, MorphSVGPlugin, Linear, Power2, TimelineMax */

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

  $('#toggle-one').parent().css({ width: '100%' });

  $('#toggle-one').change(() => {
    $('#returning-blk').toggle(($('#toggle-one').is(':checked')));
  });

  $('#toggle-two').bootstrapToggle({
    on: 'Path-Length',
    off: 'Price',
  });

  $('#toggle-two').parent().css({ width: '100%' });

  $('#searchBtn').click(() => {
    $('#loadingOverlay').addClass('loading');
    $('#loadingOverlay').show();
    $('#loadingOverlay').animate({ opacity: 1 }, 'fast');
  });
});

$(document).ready(() => {
  TweenMax.set('#circlePath', {
    attr: {
      r: document.querySelector('#mainCircle').getAttribute('r'),
    },
  });
  MorphSVGPlugin.convertToPath('#circlePath');

  const select = function (s) {
    return document.querySelector(s);
  };
  const mainCircle = select('#mainCircle');
  const mainContainer = select('#mainContainer');
  const plane = select('#plane');
  // const mainSVG = select('.mainSVG');
  const mainCircleRadius = Number(mainCircle.getAttribute('r'));
  const numDots = mainCircleRadius / 2;
  const step = 360 / numDots;
  const dotMin = 0;
  const circlePath = select('#circlePath');

  TweenMax.set('svg', {
    visibility: 'visible',
  });
  TweenMax.set([plane], {
    transformOrigin: '50% 50%',
  });

  const circleBezier = MorphSVGPlugin.pathDataToBezier(circlePath.getAttribute('d'), {
    offsetX: -19,
    offsetY: -18,
  });

  const mainTl = new TimelineMax();

  function makeDots() {
    let d;
    let angle;
    let tl;
    let i;
    for (i = 0; i < numDots; i += 1) {
      d = select('#dot').cloneNode(true);
      mainContainer.appendChild(d);
      angle = step * i;
      TweenMax.set(d, {
        attr: {
          cx: (Math.cos((angle * Math.PI) / 180) * mainCircleRadius) + 400,
          cy: (Math.sin((angle * Math.PI) / 180) * mainCircleRadius) + 300,
        },
      });

      tl = new TimelineMax({
        repeat: -1,
      });
      tl
        .from(d, 0.2, {
          attr: {
            r: dotMin,
          },
          ease: Power2.easeIn,
        })
        .to(d, 1.8, {
          attr: {
            r: dotMin,
          },
          ease: Power2.easeOut,
        });

      mainTl.add(tl, i / (numDots / tl.duration()));
    }
    const planeTl = new TimelineMax({
      repeat: -1,
    });
    planeTl.to(plane, tl.duration(), {
      bezier: {
        type: 'cubic',
        values: circleBezier,
        autoRotate: true,
      },
      ease: Linear.easeNone,
    });
    mainTl.add(planeTl, 0.05);
  }

  makeDots();
  mainTl.time(20);
  TweenMax.to(mainContainer, 30, {
    rotation: -360,
    svgOrigin: '400 300',
    repeat: -1,
    ease: Linear.easeNone,
  });
  mainTl.timeScale(1.6);
});
