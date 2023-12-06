$(document).ready(function () {
  // Nice Select Initialization
  // $('select').niceSelect();
  AOS.init({
    once: true,
    duration: 1000,
    disable: function () {
      var maxWidth = 991;
      return window.innerWidth < maxWidth;
    }
  });
  // Pricing Plan Change Trigger
  function pricingTrigger() {
    $("[data-plan-active]").each(function () {
      var id = $(this).attr("data-plan-id");
      var plan = $(this).attr("data-plan-active");
      if (plan == "monthly") {
        $("[data-pricing-trigger='" + id + "'][data-target='monthly']")?.addClass("active");
        $("[data-pricing-trigger='" + id + "'][data-target='yearly']")?.removeClass("active");
        $("[data-pricing-trigger='" + id + "'].toggle")?.attr("data-target", "yearly");
        $("[data-pricing-trigger='" + id + "'].toggle")?.removeClass("active");
      } else if (plan == "yearly") {
        $("[data-pricing-trigger='" + id + "'][data-target='monthly']")?.removeClass("active");
        $("[data-pricing-trigger='" + id + "'][data-target='yearly']")?.addClass("active");
        $("[data-pricing-trigger='" + id + "'].toggle")?.addClass("active");
        $("[data-pricing-trigger='" + id + "'].toggle")?.attr("data-target", "monthly");
      }

    })
    $('[data-pricing-trigger]').on('click', function (e) {
      var id = $(e.target).attr('data-pricing-trigger');
      var target = $(e.target).attr('data-target');
      // $(e.target).addClass('active').siblings().removeClass('active');
      // $("[data-pricing-trigger][data-target='yearly'].active").removeClass("active");
      $("[data-plan-id='" + id + "'] .dynamic-value").each(function () {
        let yearPrice = $(this).attr('data-yearly');
        let monthPrice = $(this).attr('data-monthly');

        if (target == 'monthly') {
          $(this).text(monthPrice);
          $("[data-pricing-trigger][data-target='monthly']:not(.toggle)").addClass("active");
          $("[data-pricing-trigger][data-target='yearly']:not(.toggle)").removeClass("active");
          $("[data-pricing-trigger].toggle")?.removeClass("active");
          $("[data-pricing-trigger].toggle").attr("data-target", "yearly");
        }
        if (target == 'yearly') {
          $(this).text(yearPrice);
          $("[data-pricing-trigger][data-target='monthly']:not(.toggle)").removeClass("active");
          $("[data-pricing-trigger][data-target='yearly']:not(.toggle)").addClass("active");
          $("[data-pricing-trigger].toggle")?.removeClass("active");
          $("[data-pricing-trigger].toggle")?.addClass("active")
          $("[data-pricing-trigger].toggle").attr("data-target", "monthly");
        }
      });
    });
  }
  pricingTrigger();

  inlineSVG.init({
    svgSelector: '.inline-svg', // the class attached to all images that should be inlined
    initClass: 'inline-svg-active', // class added to <html>
  });

  //***ISOTOPE***
  // Portfolio-01
  $(window).load(function () {
    $(".navigation-active").isotope({
      itemSelector: ".grid-item",
      layoutMode: "fitRows"
    });
  });

  $(window).load(function () {
    $('.portfolio-v2').isotope({
      itemSelector: '.grid-item',
      percentPosition: true,
      masonry: {
        // use outer width of grid-sizer for columnWidth
        columnWidth: 1,
      }
    })
  })

  // change is-checked class on buttons
  $('.isotope-nav').each(function (i, buttonGroup) {
    var $buttonGroup = $(buttonGroup);
    $buttonGroup.on('click', 'a', function () {
      $buttonGroup.find('.active').removeClass('active');
      $(this).addClass('active');
    });
  });

  // filter items on button click
  $(".navigation-list").on("click", "li", function () {
    $(this).addClass("active").siblings().removeClass("active");
    var filterValue = $(this).attr("data-filter");
    $(".isotope-navigation").isotope({
      filter: filterValue
    });
  });
  $(".home-7_testimonial-card-wrapper").slick({
    dots: true,
    infinite: true,
    autoplay: true,
    fade: true,
    cssEase: 'linear'
  });
  $(".home-10_testimonial-widget-wrapper").slick({
  })
});


$(window).on('load', function () {
  $('#clock').countdown('2024/10/10', function (event) {
    var $this = $(this).html(event.strftime(''
      + '<span class="counter-item">%d <span class="counter-postfixer">Days</span></span> : '
      + '<span class="counter-item">%H <span class="counter-postfixer">Hours</span></span> : '
      + '<span class="counter-item">%M <span class="counter-postfixer">Minutes</span></span> : '
      + '<span class="counter-item">%S <span class="counter-postfixer">Seconds</span></span> '));
  });
});

$(window).on('load', function () {
  $("body").addClass("loading");
  setTimeout(function () {
    $(".preloader-wrapper").fadeOut(500);
    $("body").removeClass("loading");
  }, 1000);
  setTimeout(function () {
    $(".preloader-wrapper").remove();
  }, 2000);
});

//pagination

$(document).ready(function () {
  // change active class on pagination
  $('.pagination-wrapper').each(function (i, buttonGroup) {
    var $buttonGroup = $(buttonGroup);
    $buttonGroup.on('click', '.btn-main', function () {
      $buttonGroup.find('.active').removeClass('active');
      $(this).addClass('active');
    });
  });
});