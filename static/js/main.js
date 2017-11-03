$(document).ready(function(){

  var $root = $('html, body');

  $("a[href^='#']").click(function(e){
    e.preventDefault();
    if ( !$(this).hasClass('closemenu') ) {
      $(".mobile-nav").removeClass("mobile-nav__open");
      $root.animate({
          scrollTop: $( $.attr(this, 'href') ).offset().top - 100
      }, 500);
      return false;
    }
  })

  if ( $("body").hasClass("homepage") ) {
    // check if goto param is set in url.. if so do a smooth scroll to div.
    var whereTo = getParameterByName('goto');
    if (whereTo) {

      $root.animate({
          scrollTop: $("#"+ whereTo).offset().top - 100
      }, 500);
    }
  }

  function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


  $(".nav__logo").click(function(e){
    window.location.href = "/";
  })


  $(window).scroll(function(e){

    if ( !$("body").hasClass("support") ) {
      if ( !$(".mobile-nav").hasClass("mobile-nav__open") ) {
        var currentPosition = $(window).scrollTop();
        opacity = currentPosition / 550    /// 550 is the height of the hero..

        $(".nav").css("background-color", "rgba(16, 15, 18,"+ opacity +")");

      } else {
        $("body").css("overflow-y","hidden");
      }
    }

  })


  $(".nav__mobile-menu").click(function(){
    $(".mobile-nav").addClass("mobile-nav__open");
  })

  $(".closemenu").click(function(e){
    e.preventDefault();
    $(".mobile-nav").removeClass("mobile-nav__open");
      $("body").css("overflow-y","scroll");
  })


  $("#mdlDismiss").click(function() {

      var menu = document.getElementById("mdlDismiss");
      var form = document.getElementById("order-form");
      var overlay = document.getElementById("overlay");

      if ( $(this).attr("data-open") === "no" ) {
        $(".modal-options").css("opacity",1);
        form.className += " order__form--hidden";
        overlay.style.opacity = "0.8";
        menu.className += " dismiss-modal__btn--open";
        overlay.className += " checkout-overlay--open";
        menu.innerHTML = "Leave Bill Pay?";
       $(this).attr("data-open","yes");
      } else {
        $(".modal-options").css("opacity",0);
        menu.className = "dismiss-modal__btn";
        menu.innerHTML = "&#10005;";
        overlay.style.opacity = "0";
        form.className += "order__form";
        overlay.className = "checkout-overlay";
        $(this).attr("data-open","no");
      }

    })

    $(".modal-options__exit").click(function(){
    window.location.href= "/"
  })

  $(".modal-options__cancel").click(function(){

    var menu = document.getElementById("mdlDismiss");
    var form = document.getElementById("order-form");
    var overlay = document.getElementById("overlay");

    $(".modal-options").css("opacity",0);
    menu.className = "dismiss-modal__btn";
    menu.innerHTML = "&#10005;";
    overlay.style.opacity = "0";
    form.className += "order__form";
    overlay.className = "checkout-overlay";
    $("#mdlDismiss").attr("data-open","no");
  })


  if ( $("body").hasClass("checkout") ) {
    var handler = StripeCheckout.configure({
        key: 'pk_live_UyVqS0mTaHF2MO8ifwocJ4pv',
        image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
        locale: 'auto',
        token: function(token) {

          console.log('stripe token ', token)

          $.post( "/checkout", {
            token: token.id,
            email: localStorage.getItem('st-customerEmail'),
            servicedAt: localStorage.getItem('st-serviceAddress'),
            subtotal: localStorage.getItem('st-subtotal'),
            fee: localStorage.getItem('st-fee'),
            total: localStorage.getItem('st-total')
           })
          .done(function( data ) {
            console.log(token);

            if ( data !== "card failed" ) {

              $.post( "/customer-receipt", {
                email: localStorage.getItem('st-customerEmail'),
                servicedAt: localStorage.getItem('st-serviceAddress'),
                subtotal: localStorage.getItem('st-subtotal'),
                fee: localStorage.getItem('st-fee'),
                total: localStorage.getItem('st-total'),
                ccbrand: token.card.brand,
                lastfour: token.card.last4
              }).done(function( data ){
                // redirect to success page.
                console.log(data)
                window.location.href = "/pay/confirmation";
              })

            } else {
              alert("card failed");
            }

          });
        }
      });

  }


  $("#btnSend").click(function(){
    var name = document.getElementById("txtName");
    var email = document.getElementById("txtEmail");
    var phone = document.getElementById("txtPhone");
    var serviceAddress = document.getElementById("txtServiceAddress");
    var city = document.getElementById("txtCity");
    var zipcode = document.getElementById("txtZip");
    var message = document.getElementById("txtMessage");

    // validate form
    var hasError = false;
    if (!validate(name)) { hasError = true; }
    if (!validate(serviceAddress)) { hasError = true; }
    if (!validate(email)) { hasError = true; }
    if (!validate(city)) { hasError = true; }
    if (!validate(zipcode)) { hasError = true; }
    if (!validate(phone)) { hasError = true; }

    if (!hasError) {
      $.post( "/send-message", {
        name: name.value,
        email: email.value,
        phone: phone.value,
        address: serviceAddress.value,
        city: city.value,
        zip: zipcode.value,
        message: message.value

      }).done(function( data ){
        // redirect to success page.

        name.value = '';
        email.value = '';
        phone.value = '';
        city.value = '';
        zipcode.value = '';
        serviceAddress.value = '';
        message.value = '';

        $("#btnSend").text('Thanks!').attr("disabled","disabled").css("opacity", 0.8);

      })
    }


  })


  $("#btnPay").click(function(){

    var name = document.getElementById("txtName");
    var serviceAddress = document.getElementById("txtServiceAddress");
    var billingAddress = document.getElementById("txtBillingAddress");
    var email = document.getElementById("txtEmail");
    var phone = document.getElementById("txtPhone");
    var amount = document.getElementById("txtAmount");

    // validate form
    var hasError = false;
    if (!validate(name)) { hasError = true; }
    if (!validate(serviceAddress)) { hasError = true; }
    if (!validate(billingAddress)) { hasError = true; }
    if (!validate(email)) { hasError = true; }
    if (!validate(phone)) { hasError = true; }
    if (!validate(amount)) { hasError = true; }

    if (!hasError){
      // show stripe form.
      var subtotal = parseFloat(amount.value);
      var fee = 3/100; // 3%
      var feeTotal = fee * subtotal;
      var totalToCharge = parseFloat(subtotal + feeTotal).toFixed(2) * 100;

      localStorage.setItem('st-customerEmail', email.value);
      localStorage.setItem('st-serviceAddress', serviceAddress.value);
      localStorage.setItem('st-subtotal', subtotal);
      localStorage.setItem('st-fee', feeTotal);
      localStorage.setItem('st-total', totalToCharge);


      handler.open({
          name: 'Seal This',
          description: 'service at ' + serviceAddress.value,
          amount: totalToCharge
        });



    }



  })

  function validate(input){
    if (input.value === "") {
      input.className += " input-error";
      return false;
    } else {
      input.className = " ";
      return true;
    }
  }


  if ( $("body").hasClass("confirmation")) {

    $("#service-description").text("Service at " + localStorage.getItem('st-serviceAddress'))
    $("#service-charge").text(localStorage.getItem('st-subtotal'))
    $("#fee").text(parseFloat(localStorage.getItem('st-fee')).toFixed(2))
    $("#total").text(parseFloat((localStorage.getItem('st-total') / 100).toFixed(2)))

    $("#service-description--print").text("Service at " + localStorage.getItem('st-serviceAddress'))
    $("#service-charge--print").text(localStorage.getItem('st-subtotal'))
    $("#fee--print").text(parseFloat(localStorage.getItem('st-fee')).toFixed(2))
    $("#total--print").text(parseFloat((localStorage.getItem('st-total') / 100).toFixed(2)))

  }

  $("#btnPrint").click(function(){

    window.print();


  })



})
