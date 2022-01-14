/* Metodo encargado de sacar decimales despues de la coma.
  cloneReplace es un parametro booleano
  clonesReplace = YES, clona el elemento y lo modifica, escondiendo el original  */

  function formatPriceWithoutComma (selector, cloneReplace) {
    $(selector).each ( function (index, obj) {
      var priceContainerValue = $(this).html();
      if (priceContainerValue.indexOf(',') > 0) {
        var formattedPriceContainerValue = priceContainerValue.substr(0, priceContainerValue.indexOf(','));
        var selectorClass =  $(this).attr('class');
        if (cloneReplace == 'true' && (!$(this).parent().hasClass('cloned'))) {
          var priceClone = $(this).clone();
          priceClone.insertAfter($(this)).removeClass(selectorClass).addClass(selectorClass+'-clone');
          priceClone.text(formattedPriceContainerValue);
          $(this).parent().addClass('cloned');
          $(this).remove();
        } else {
          $(this).text(formattedPriceContainerValue);
        }
      } 
    });
  }
  
  /* Metodo que maneja la finalizaciÃ³n de la llamada ajax al servidor, al seleccionar un cambio de tamaÃ±o de parka */
  
  var laTerribleFlag = true
  
  $(document).ajaxStop(function(){
    formatPriceWithoutComma ('.skuBestPrice', 'true');
    formatPriceWithoutComma ('.skuListPrice', 'true');
    formatPriceWithoutComma ('.total-cart-em', 'false');
    formatPriceWithoutComma ('.best-price', 'false');
    formatPriceWithoutComma ('.old-price', 'false');
    formatPriceWithoutComma ('#mini-cart-admake-total', 'false');
  
    $('.notifyme-client-name').attr('placeholder', 'Nombre');
    $('.notifyme-client-email').attr('placeholder', 'e-mail');
  
    if (laTerribleFlag) {
      SkuShowcase();
    }
  });
  
  
  $("body").on('DOMSubtreeModified', "#mini-cart-admake", function() { 
    formatPriceWithoutComma ('.qtd-valor>.preco', 'false');
  });
  
  //Add Hover effect to menus
  jQuery('ul.navbar-nav li.dropdown').hover(function() {
    jQuery(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn();
  }, function() {
    jQuery(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut();
  });


  
  var banoCocina = $('header #top-menu .dropdown-menu .row .categories-list ul .bano-cocina')
  banoCocina.css({
    "display": "flex",
    "margin-left": "0",
    "margin-right": "0",
    "padding-left": "10px",
    "background-color": "#f2f2f2",
    "border-top": "3px solid #026DB4",
    "color": "#026DB4",
    "font-weight": "bold !important"
  })
  var banoCocinaSpanSelector = $('header #top-menu .dropdown-menu .row .categories-list ul .bano-cocina .content-span-selector')
  banoCocinaSpanSelector.css({
    "display": "block"
  })

  $('header #top-menu .dropdown-menu .row .categories-list ul h3').hover(function () {
    var h3Selected = $("header #top-menu .dropdown-menu .row .categories-list ul h3")
    var h3SelectedMarcador = $("header #top-menu .dropdown-menu .row .categories-list ul h3 .content-span-selector")

    h3Selected.css({
      "background-color": "transparent",
      "border-top": "3px solid white",
      "color": "black"
    })
    h3SelectedMarcador.css({
      "display": "none"
    })
   

    $(this).css({
      "display": "flex",
        "margin-left": "0",
        "margin-right": "0",
        "padding-left": "10px",
        "background-color": "#f2f2f2",
        "border-top": "3px solid #026DB4",
        "color": "#026DB4",
        "font-weight": "bold !important"
    })
    $(this).children().children().css({
        "display": "block"
    })

    var classSelected = '.submenu-dropdown.' + $(this).attr('class');
    console.log(classSelected)
    $('.submenu-dropdown').css({
      "display": "none"
    }
    );
    $(classSelected).css({
      "display": "flex",
      "flex-flow": "column wrap",
      "overflow": "initial",
      "overflow-y": "initial",
      "height": "230px",
      "max-height": "230px"
    }
    );

  })


  

  //Add Sticky header
  $(window).scroll(function() {
      if ($(this).scrollTop() > 100){  
        $('header').addClass("sticky");
      }
      else{
        $('header').removeClass("sticky");
      }
  });
  
  
  $('#filtro-tiendas').change(function(){
    var filtro = $(this).attr('value');
  
    if(filtro == filtro){
      $('.lojas > div').hide();
      $('.lojas > div.'+filtro).fadeIn('fast');
    }else if(filtro == 'todos'){
      $('.lojas .todos').fadeIn('fast');
    }
  });
  
  $(document).ready(function() {
    $('.main-categories li .child-categories:first').show();
    if ($('.main-categories').length) {
      $('.main-categories li a.main-category-name').hover(function(){
        $('.main-categories li a').each(function(){
          $(this).removeClass('hover-in');
        })
        $(this).addClass('hover-in');
        $('.child-categories').each(function(){
          $(this).hide();
        })
        $(this).siblings('.child-categories').show();
        console.log($(this));
      },function(){
        //HOVER OUT
      });
    }
    SkuShowcase();
  });
  
  /* 
    1. Hacer metodo para debug get parameter for develop
    2. Tomar como referente el metodo de hwwear y generar sku bajo cada elemento de la vitrina.
    3. Generar el correo de solucionado.
  */
  function SkuShowcase(){
    //let debug = window.location.search.substring(1);
    //if(debug == "develop"){
    //console.log("Esta en develop");
  
      //shelfProductIds = dataLayer[0].shelfProductIds;
      if($('#departament-page').length){
  
            $('.prateleira .helperComplement').each(function() {
              let elementId = $(this).attr('id');
              let productId = elementId.substr(elementId.indexOf('_')+1, elementId.length);
              var skuRequestUrl = 'https://nibsa.myvtex.com/api/catalog_system/pub/products/search?fq=productId:'+productId;
              $.get(skuRequestUrl, function( data ) {
                let productItem = $('a.product-image[href="'+ data[0].link +'"]');
                if (data[0].items[0]) {
                    let item = data[0].items[0];
                    let SkuNumber = $('<div class="skuIdName">'+item.referenceId[0].Value +'</div>');
                    $(productItem).append(SkuNumber);    
                }
  
              });
            });
  
            $('.pager.bottom .pages li').on('click touchstart', function () {
              console.log('paginaxx');
              laTerribleFlag = true;
            });
  
            laTerribleFlag = false
      } 
      // if($('#home-page').length){
      //     $('.prateleira .owl-item').each(function() {
      //       let SkuNumber = $(this).find('.product-image img').attr('alt');
      //       $(this).find('.product-image').append(SkuNumber);  
      //     });
      // }
  
  }
  
  
  // agrega flag descuento
  function addListFlagRange() {
  
      // product
      let product = document.getElementById("product-page");    
      if (product) {
          let listPriceProduct = product.querySelector(".skuListPrice");
          let bestPriceProduct = product.querySelector(".skuBestPrice");
          let ofertProduct  = product.querySelector(".ofert-flag");
          // let noTfreeProduct = product.querySelector(".envio-gratis-excluido");
          
          /* free
           if (formatPrice(bestPriceProduct.innerText) > 3000 && !noTfreeProduct) {
              let freeFlag = product.querySelector(".envio-gratis");
              freeFlag.style.display = "block";
          }*/
          
          if (listPriceProduct && ofertProduct) {
              let percentageProduct = percentageCalculate(listPriceProduct,bestPriceProduct);
              addOfert(percentageProduct,ofertProduct);
          }
      }
      // items
      var items = document.querySelectorAll('li  span.box-item');
      // console.log("item",items);
  
      [].forEach.call(items, function(item) { 
      
          let oldPrice = item.querySelector(".old-price");
          // console.log("oldPrice",oldPrice);
          let bestPrice = item.querySelector(".best-price");
          // console.log("bestPrice",bestPrice);  
          let ofert  = item.querySelector(".ofert-flag");
          // console.log("ofert",ofert);
          // let noTfreeFlag = item.querySelector(".envio-gratis-excluido");
          /* free flag
            if (formatPrice(bestPrice.innerText) > 3000 && !noTfreeFlag) {
              let freeFlag = item.querySelector(".envio-gratis");
              freeFlag.style.display = "block";
          }*/
  
          if (oldPrice && ofert) {
              let percentage = percentageCalculate(oldPrice,bestPrice);
              addOfert(percentage,ofert);
          }
      });
  }
  
  function addOfert (percentagePrice,ofert) {
    ofert.innerText = percentagePrice.toFixed();
      ofert.style.background = "#AD304D";
      ofert.style.color = "#fff";
    ofert.style.display = "block";  
  }
  
  function percentageCalculate (oldPrice,bestPrice) {
      bestPrice = formatPrice(bestPrice.innerText);
      oldPrice = formatPrice(oldPrice.innerText);
      let diffPrice = oldPrice - bestPrice;
      let percentagePrice = oldPrice - diffPrice ;
      percentagePrice = (diffPrice / oldPrice) * 100;
      return percentagePrice;
  }
  
  
  function formatPrice(price) {
      price = price.substr(2,price.length);
      price = price.replace(".",'');
      price = price.replace(",",".");
      return parseInt(price, 10).toFixed(2);
  }
  
  function loadFlag(){
          document.addEventListener('DOMContentLoaded',function(){
              let vitrine = document.querySelector('.vitrine.resultItemsWrapper .prateleira ');
              if(vitrine) {
                const observer = new MutationObserver( (mutationList) => {
                  mutationList.forEach((mutation) => {
                      if (mutation.addedNodes.length) {
              addListFlagRange();
                      }
                  })
              });
              const observerOptions = { 
                  attributes: true, 
                  childList: false, 
                  subtree: false, 
              };
              observer.observe(vitrine, observerOptions);
              }
          })
  }
  
  function newsletter() {
  
    document.getElementById('newsletterClientEmail').addEventListener('keyup', function(e) {
      var mailing = document.getElementById("mailing");
      if(mailing === null) {
        mailing=document.createElement("input");
        mailing.setAttribute("type","hidden");
        mailing.setAttribute("id","mailing");
        
        document.body.appendChild(mailing);
      }
  
      mailing.value = e.target.value;
    });
  
    document.getElementById('newsletterButtonOK').addEventListener('click', function() {
      var email = document.getElementById('mailing').value;
      var url = '/api/dataentities/NW/documents';
      var data = {email: email};
  
      fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers:{
          'Content-Type': 'application/json'
        }
      }).then(res => null)
      .catch(error => console.error('Error:', error))
      .then(response => null);
    });
  }
  
  function notifyme() {
    let isNofityMePage = document.querySelector('#product-page .sku-notifyme');
  
    if(!isNofityMePage) return;
    
    document.body.classList.add('out-of-stock');
    $('.showNotifyMe').parent().hide();
    $('.showNotifyMe').parent().after('<span id="showNotifyMe"><a class="showNotifyMe">Recibe un email cuando se encuentre disponible:</a></span>');
    $('#notifymeButtonOK').val('ENVIAR');
    $('#showNotifyMe').click(function() {
      $(this).hide();
      $('.portal-notify-me-ref').fadeIn();
    });
  }
  function carouselHome() {
    var $carouselNewHome = $(".showcase-owl .prateleira > ul");
    if( $carouselNewHome.length ){
      $carouselNewHome.find('.helperComplement').remove();
      $carouselNewHome.owlCarousel({
         items 				: 5,
          autoPlay 			: true,
          stopOnHover 		: true,
          pagination 	 		: false,
          itemsDesktop 		: [1199,5],
          itemsDesktopSmall 	: [980,5],
          itemsTablet 		: [768,3],
          itemsMobile 		: [479,1],
          navigation 			: true,
          navigationText 		: ['<button class="btn btn-default btn-lg"><i class="fa fa-chevron-left"></i></button>','<button class="btn btn-default btn-lg"><i class="fa fa-chevron-right"></i></button>'],
      });
   } 
  }
  function changeNewsletter(){
    let inputMail = document.querySelector("#newsletterClientEmail");
    let buttonOk = document.querySelector("#newsletterButtonOK");
    inputMail.value = 'Ingrese su e-mail para suscribirse';
    buttonOk.value = 'ENVIAR';
  }
  function addHrefTextBanner() {
    if(document.querySelector('.banner-home-01 .box-banner a img')){
      let banner = document.querySelector('.banner-home-01 .box-banner a img');
      bannerHref = banner.src;
      let textHref = document.querySelector('.banner-home-01 .text-banner a');
      if(textHref) {
        textHref.href = bannerHref;
      }
    }
  }
  function addNewTabBanner(id) {
    if(document.querySelector("."+ id)){
    let banner = document.querySelector("."+ id);
      let linkBanner = banner.querySelector('a');
      linkBanner.setAttribute('target', '_blank');
    }
  }
  
  function popUp(){
    if(document.querySelector(".contenedor-popup")){
      let contenedorPopUp = document.querySelector(".contenedor-popup")
      let contenedorTransparent = document.querySelector(".contenedor-transparent")
      let popUp =  document.querySelector(".popUp"); 
      contenedorPopUp.style.display = "block";
    
      document.addEventListener('click', function(e){
          if (e.target == contenedorTransparent || e.target == document.querySelector(".close-popup")){
            contenedorPopUp.style.display = "none";
            localStorage.setItem('popupFlag', 'true')
          }
      })
     console.log(popUp)
    }
 
  }
  
  /*function createCookie(cookieName, cookieValue, daysToExpire) {
    var date = new Date();
    date.setTime(date.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));
    document.cookie = cookieName + "=" + cookieValue + "; expires=" + date.toGMTString();
  }
  
  function accessCookie(cookieName) {
    var name = cookieName + "=";
    var allCookieArray = document.cookie.split(';');
    for (var i = 0; i < allCookieArray.length; i++) {
      var temp = allCookieArray[i].trim();
      if (temp.indexOf(name) == 0)
        return temp.substring(name.length, temp.length);
    }
    return "";
  }
  */
  /*function popUpCookie() {
    var cookie = accessCookie("popupFlag");
    if (cookie == "") {
      popUp()
      createCookie("popupFlag", "true", "1");
    }
  }*/
  
  // var buscador = document.querySelector("input")
  // var buscadorBorrar = document.querySelector(".close-search")
  
  // window.onload = function() {
  //   document.querySelector("header").addEventListener('keypress', function(){
  //       buscadorBorrar.style.display = "block";
  //     })
  
  
  //     buscadorBorrar.addEventListener('click', function(e){
  //       console.log("buscadorBorrar atr", e.target.parentNode.childNodes[1].childNodes[4])
  //       e.target.parentNode.childNodes[1].childNodes[4].value = ' ';
  //       buscadorBorrar.style.display = "none";
  //     })
  // }
  // console.log("")
  
  

document.querySelector(".accordeon").style.display = "none";

  //menu mobile
  $(".produc-hogar").click(function(){
    $(this).toggleClass('active');
    $(".accordeon").slideToggle();
  });

$("#garatia-soporte-mobile").click(function(){
  $(this).toggleClass('active');
  $(".acordeon-garantias").slideToggle();
});



  popUp();
  addListFlagRange();
  loadFlag();
  newsletter();
  notifyme();
  //carouselHome()
  addNewTabBanner('banner-home-01');
  addNewTabBanner('category .cat-4');
  changeNewsletter()
  addHrefTextBanner();
  
  