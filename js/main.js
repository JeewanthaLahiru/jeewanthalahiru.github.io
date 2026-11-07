/*
* Template Name: BreezyCV - Resume / CV / vCard / Portfolio Template
* Author: LMPixels
* Author URL: http://themeforest.net/user/lmpixels
* Version: 1.7.0
*/

(function($) {
"use strict";
    // Portfolio subpage filters
    function portfolio_init() {
        var portfolio_grid = $('.portfolio-grid'),
            portfolio_filter = $('.portfolio-filters');
            
        if (portfolio_grid) {

            portfolio_grid.shuffle({
                speed: 450,
                itemSelector: 'figure'
            });

            portfolio_filter.on("click", ".filter", function (e) {
                portfolio_grid.shuffle('update');
                e.preventDefault();
                $('.portfolio-filters .filter').parent().removeClass('active');
                $(this).parent().addClass('active');
                portfolio_grid.shuffle('shuffle', $(this).attr('data-group') );
            });

        }
    }
    // /Portfolio subpage filters


    // Hide Mobile menu
    function mobileMenuHide() {
        var windowWidth = $(window).width(),
            siteHeader = $('#site_header');

        if (windowWidth < 1025) {
            siteHeader.addClass('mobile-menu-hide');
            $('.menu-toggle').removeClass('open');
            setTimeout(function(){
                siteHeader.addClass('animate');
            }, 500);
        } else {
            siteHeader.removeClass('animate');
        }
    }
    // /Hide Mobile menu

    // Custom scroll
    function customScroll() {
        var windowWidth = $(window).width();
        if (windowWidth > 1024) {
            $('.animated-section, .single-page-content').each(function() {
                $(this).perfectScrollbar();
            });
        } else {
            $('.animated-section, .single-page-content').each(function() {
                $(this).perfectScrollbar('destroy');
            });
        }
    }
    // /Custom scroll

    // Contact form validator
    $(function () {

        $('#contact_form').validator();

        $('#contact_form').on('submit', function (e) {
            if (!e.isDefaultPrevented()) {
                var url = "contact_form/contact_form.php";

                $.ajax({
                    type: "POST",
                    url: url,
                    data: $(this).serialize(),
                    success: function (data)
                    {
                        var messageAlert = 'alert-' + data.type;
                        var messageText = data.message;

                        var alertBox = '<div class="alert ' + messageAlert + ' alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' + messageText + '</div>';
                        if (messageAlert && messageText) {
                            $('#contact_form').find('.messages').html(alertBox);
                            $('#contact_form')[0].reset();
                        }
                    }
                });
                return false;
            }
        });
    });
    // /Contact form validator

    //On Window load & Resize
    $(window)
        .on('load', function() { //Load
            // Animation on Page Loading
            $(".preloader").fadeOut( 800, "linear" );

            // initializing page transition.
            var ptPage = $('.animated-sections');
            if (ptPage[0]) {
                PageTransitions.init({
                    menu: 'ul.main-menu',
                });
            }
        })
        .on('resize', function() { //Resize
             mobileMenuHide();
             $('.animated-section').each(function() {
                $(this).perfectScrollbar('update');
            });
            customScroll();
        });


    // On Document Load
    $(document).ready(function () {
        var movementStrength = 23;
        var height = movementStrength / $(document).height();
        var width = movementStrength / $(document).width();
        $("body").on('mousemove', function(e){
            var pageX = e.pageX - ($(document).width() / 2),
                pageY = e.pageY - ($(document).height() / 2),
                newvalueX = width * pageX * -1,
                newvalueY = height * pageY * -1,
                elements = $('.lm-animated-bg');

            elements.addClass('transition');
            elements.css({
                "background-position": "calc( 50% + " + newvalueX + "px ) calc( 50% + " + newvalueY + "px )",
            });

            setTimeout(function() {
                elements.removeClass('transition');
            }, 300);
        })

        // Mobile menu
        $('.menu-toggle').on("click", function () {
            $('#site_header').addClass('animate');
            $('#site_header').toggleClass('mobile-menu-hide');
            $('.menu-toggle').toggleClass('open');
        });

        // Mobile menu hide on main menu item click
        $('.main-menu').on("click", "a", function (e) {
            mobileMenuHide();
        });

        // Awards detail popup
        var $awardsModal = $('#awards-modal');
        var $awardImageLightbox = $('#award-image-lightbox');
        var $lastAwardTrigger = null;
        var $lastAwardImage = null;

        $('.awards-grid').on('click', '.award-card', function () {
            var $card = $(this),
                eventImage = $card.attr('data-award-event'),
                extraImage = $card.attr('data-award-extra-image'),
                certificateImage = $card.attr('data-award-certificate'),
                $eventFigure = $awardsModal.find('.award-event-image').closest('figure'),
                $extraFigure = $awardsModal.find('.award-extra-image-item'),
                $certificateFigure = $awardsModal.find('.award-certificate-item');

            $lastAwardTrigger = $card;
            $awardsModal.find('#award-modal-title').text($card.attr('data-award-title'));
            $awardsModal.find('.award-modal-date').text($card.attr('data-award-date'));
            $awardsModal.find('.award-modal-description').text($card.attr('data-award-description'));

            if (eventImage) {
                $awardsModal.find('.award-event-image')
                    .attr('src', eventImage)
                    .attr('alt', $card.attr('data-award-image-alt') || 'Award or activity image');
                $awardsModal.find('.award-event-caption').text($card.attr('data-award-image-caption') || 'Event photo');
                $eventFigure.show();
            } else {
                $eventFigure.hide();
            }

            if (extraImage) {
                $awardsModal.find('.award-extra-image')
                    .attr('src', extraImage)
                    .attr('alt', $card.attr('data-award-extra-alt') || 'Additional event photo');
                $awardsModal.find('.award-extra-caption').text($card.attr('data-award-extra-caption') || 'Event photo');
                $extraFigure.show();
            } else {
                $extraFigure.hide();
            }

            if (certificateImage) {
                $awardsModal.find('.award-certificate-image').attr('src', certificateImage).show();
                $awardsModal.find('.award-image-placeholder').hide();
                $certificateFigure.show();
            } else {
                $awardsModal.find('.award-certificate-image').hide();
                $awardsModal.find('.award-image-placeholder').hide();
                $certificateFigure.hide();
            }

            $awardsModal.attr('aria-hidden', 'false');
            $('body').addClass('award-modal-open');
            $awardsModal.find('.award-modal-close').trigger('focus');
        });

        $awardsModal.on('click', '[data-award-close]', function () {
            $awardsModal.attr('aria-hidden', 'true');
            $('body').removeClass('award-modal-open');
            if ($lastAwardTrigger) {
                $lastAwardTrigger.trigger('focus');
            }
        });

        $awardsModal.on('click keydown', '.award-gallery-image', function (e) {
            if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') {
                return;
            }
            if (e.type === 'keydown') {
                e.preventDefault();
            }
            if (!this.src || this.style.display === 'none') {
                return;
            }

            $lastAwardImage = $(this);
            $awardImageLightbox.find('.award-image-lightbox-content')
                .attr('src', this.currentSrc || this.src)
                .attr('alt', $(this).attr('alt') || 'Award image');
            $awardImageLightbox.attr('aria-hidden', 'false');
            $awardImageLightbox.find('.award-image-lightbox-close').trigger('focus');
        });

        $awardImageLightbox.on('click', '[data-award-image-close]', function () {
            $awardImageLightbox.attr('aria-hidden', 'true');
            $awardImageLightbox.find('.award-image-lightbox-content').attr('src', '');
            if ($lastAwardImage) {
                $lastAwardImage.trigger('focus');
            }
        });

        $(document).on('keydown', function (e) {
            if (e.key === 'Escape' && $awardImageLightbox.attr('aria-hidden') === 'false') {
                $awardImageLightbox.attr('aria-hidden', 'true');
                $awardImageLightbox.find('.award-image-lightbox-content').attr('src', '');
                if ($lastAwardImage) {
                    $lastAwardImage.trigger('focus');
                }
            } else if (e.key === 'Escape' && $awardsModal.attr('aria-hidden') === 'false') {
                $awardsModal.attr('aria-hidden', 'true');
                $('body').removeClass('award-modal-open');
                if ($lastAwardTrigger) {
                    $lastAwardTrigger.trigger('focus');
                }
            }
        });

        // Sidebar toggle
        $('.sidebar-toggle').on("click", function () {
            $('#blog-sidebar').toggleClass('open');
        });

        // Initialize Portfolio grid
        var $portfolio_container = $(".portfolio-grid");
        $portfolio_container.imagesLoaded(function () {
            portfolio_init(this);
        });

        // Blog grid init
        var $container = $(".blog-masonry");
        $container.imagesLoaded(function(){
            $container.masonry();
        });

        customScroll();

        // Text rotation
        $('.text-rotation').owlCarousel({
            loop: true,
            dots: false,
            nav: false,
            margin: 0,
            items: 1,
            autoplay: true,
            autoplayHoverPause: false,
            autoplayTimeout: 3800,
            animateOut: 'animated-section-scaleDown',
            animateIn: 'animated-section-scaleUp'
        });

        // Testimonials Slider
        $(".testimonials.owl-carousel").owlCarousel({
            nav: true, // Show next/prev buttons.
            items: 3, // The number of items you want to see on the screen.
            loop: false, // Infinity loop. Duplicate last and first items to get loop illusion.
            navText: false,
            autoHeight: true,
            margin: 25,
            responsive : {
                // breakpoint from 0 up
                0 : {
                    items: 1,
                },
                // breakpoint from 480 up
                480 : {
                    items: 1,
                },
                // breakpoint from 768 up
                768 : {
                    items: 2,
                },
                1200 : {
                    items: 2,
                }
            }
        });

        // Clients Slider
        $(".clients.owl-carousel").imagesLoaded().owlCarousel({
            nav: true, // Show next/prev buttons.
            items: 2, // The number of items you want to see on the screen.
            loop: false, // Infinity loop. Duplicate last and first items to get loop illusion.
            navText: false,
            margin: 10,
            autoHeight: true,
            responsive : {
                // breakpoint from 0 up
                0 : {
                    items: 2,
                },
                // breakpoint from 768 up
                768 : {
                    items: 4,
                },
                1200 : {
                    items: 5,
                }
            }
        });


        //Form Controls
        $('.form-control')
            .val('')
            .on("focusin", function(){
                $(this).parent('.form-group').addClass('form-group-focus');
            })
            .on("focusout", function(){
                if($(this).val().length === 0) {
                    $(this).parent('.form-group').removeClass('form-group-focus');
                }
            });

        // Lightbox init
        $('body').magnificPopup({
            delegate: 'a.lightbox',
            type: 'image',
            removalDelay: 300,

            // Class that is added to popup wrapper and background
            // make it unique to apply your CSS animations just to this exact popup
            mainClass: 'mfp-fade',
            image: {
                // options for image content type
                titleSrc: 'title',
                gallery: {
                    enabled: true
                },
            },

            iframe: {
                markup: '<div class="mfp-iframe-scaler">'+
                        '<div class="mfp-close"></div>'+
                        '<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>'+
                        '<div class="mfp-title mfp-bottom-iframe-title"></div>'+
                      '</div>', // HTML markup of popup, `mfp-close` will be replaced by the close button

                patterns: {
                    youtube: {
                      index: 'youtube.com/', // String that detects type of video (in this case YouTube). Simply via url.indexOf(index).

                      id: null, // String that splits URL in a two parts, second part should be %id%
                      // Or null - full URL will be returned
                      // Or a function that should return %id%, for example:
                      // id: function(url) { return 'parsed id'; }

                      src: '%id%?autoplay=1' // URL that will be set as a source for iframe.
                    },
                    vimeo: {
                      index: 'vimeo.com/',
                      id: '/',
                      src: '//player.vimeo.com/video/%id%?autoplay=1'
                    },
                    gmaps: {
                      index: '//maps.google.',
                      src: '%id%&output=embed'
                    }
                },

                srcAction: 'iframe_src', // Templating object key. First part defines CSS selector, second attribute. "iframe_src" means: find "iframe" and set attribute "src".
            },

            callbacks: {
                markupParse: function(template, values, item) {
                 values.title = item.el.attr('title');
                }
            },
        });

        //Google Maps
        if ($(".lmpixels-map")[0]){
            var address = 'Balangoda, Sri Lanka', //Replace with Your Address
                address = encodeURIComponent(address),
                src = 'https://maps.google.com/maps?q=' + address + '&amp;t=m&amp;z=16&amp;output=embed&amp;iwloc=near&output=embed';
            $(".lmpixels-map iframe").attr("src", src);
        }

        $('.messages').on('click', '.close', function(){
            $(this).parent().remove();
        });
    });

})(jQuery);
