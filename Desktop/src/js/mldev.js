//Mobile Setup  Logic
//var mobileBreakpoint = 991,
//    isMobile;


//Cookie management
function createCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function deleteCookie(name) {
    createCookie(name,"",-1);
}


jQuery(document).ready(function(){

    //Newsletter Popup Logic
    function newsletterPopupOpen() {
      jQuery('#newsletter-popup-wrapper').show(0, function(){
        jQuery(this).css({'display': 'block' });        
      });
    }
  
    function newsletterPopupClose(e) {

        var _closer = function() {
          jQuery('#newsletter-popup-wrapper').hide(0, function(){
            jQuery(this).css({'display': 'none'});
          });          
        }

        jQuery('#newsletter-popup-wrapper .closemodal').click(function(){
	        jQuery("#newsletter-popup-wrapper").css({'display': 'none' });	        
	      });

        if(e.target.className === "newsletter-title") {
            _closer();
            return;
        } else {
          if (
            jQuery('#newsletter-popup-wrapper .newsletter')[0].contains(e.target) || 
            e.target.className === "btn-ok newsletter-button-ok" || 
            e.target.className === "bt-voltar newsletter-button-back"        
            ){
            // Clicked inside Element
          } else { _closer(); }
        }
    }
    // newsletterPopupClose

    //Cookie based Open
    if(!readCookie("visited")) {
    //  createCookie("visited",1,0);
      newsletterPopupOpen();
    }

    //------------------------------------------------------Newsletter Popup Logic
  
    //Click Outside Listener
    window.addEventListener('click', function(e){
      if (document.body.id === 'new-home-page') { newsletterPopupClose(e); }
    });
    //------------------------------------------------------Click Outside Listener

});

NIBSA = {
	TOOLS: {
		formatPrice: function(number, thousands, decimals, length, currency) {
		  /* Transforms any complete number to a Currency format
		   * Usage: formatPrice(789953, '.', ',', 0, '$');
		   */
		  
		  currency = typeof currency === 'string' ? currency : '$ ';
		  length = typeof length === 'number' ? length : 2;

		  const re = '\\d(?=(\\d{' + (3) + '})+' + (length > 0 ? '\\D' : '$') + ')';
		  number = number / 100;
		  number = (number * 1).toFixed(Math.max(0, ~~length));

		  return currency + number.replace('.', (decimals || ',')).replace(new RegExp(re, 'g'), '$&' + (thousands || '.'));
		},

		constructMC: function (whereTo, emptyFirst) {

		  /* Constructs MiniCart internal items (Not the outer structure)
		   * whereTo [Selector] - Where the items should be placed.
		   * emptyFirst [Boolean] - removes anything inside the previous selector to make room for new items.
		   */       

		  if (emptyFirst) jQuery(whereTo).empty();


		  console.log("[MiniCart] Getting Info...");


		  // Variables
		  var cartHolder = jQuery('#mini-cart-holder-full');

		  cartControl = jQuery('#mini-cart-control');

		  var itemTemplate = '<div class="item id-{{INDEX}}" data-id="{{ID}}">' + 

		                      '<div class="item-image">' + 

		                      '<a class="item-link" href="{{LINK}}"></a>' + 

		                        '<img class="softLoaded" alt="{{NAME}}" src="{{IMAGE}}">' + 

		                      '</div>' +

		                      '<div class="item-info">' + 

		                        '<div class="item-name">{{NAME}}</div>' +

		                        '<div class="sub-b">' +
		                          '<span class="item-listPrice">{{LISTPRICE}}</span>' + 
		                          '<span class="item-bestPrice">{{PRICE}}</span>' +
		                        '</div>' +

		                        '<div class="sub">' +
		                        '<a class="item-remove" href="#" data-index="{{INDEX}}" data-id="{{ID}}"></a>' + 
		                          '<div class="sub-wrapper">' + 
		                            '<a href="#" class="qty minicart_subs" data-index="{{INDEX}}" data-id="{{ID}}">-</a>'+
		                            '<span class="item-qty">{{QTY}}</span>' +
		                            '<a href="#" class="qty minicart_adds" data-index="{{INDEX}}" data-id="{{ID}}">+</a>' +
		                          '</div>' + 
		                        '</div>' +		                        

		                      '</div>' +

		                    '</div>',

		      currentItems = vtexjs.checkout.orderForm.items;

		      // -- Clean Grid Inputs
		      jQuery('.buyInGrid input.added').text(0).removeClass('added');
		      
		      // -- ReAssign Grid inputs
		      currentItems.forEach(function(item, index) {
		          jQuery('.buyInGrid').find('.input[data-sku="'+item.id+'"]')
		              .text(item.quantity)
		              .addClass('added');
		      });

		  if ( currentItems.length > 0 ) {

		    jQuery(whereTo).parent().removeClass('empty');
		    jQuery('#mini-cart-link').addClass('filled');


		    for (var i = 0; i < currentItems.length; i++) {          

		      //Multiplicador de precio
		      var sellingPrice = Number(currentItems[i].sellingPrice * currentItems[i].quantity);
		      var listPrice = Number(currentItems[i].listPrice * currentItems[i].quantity)

		      // Set Placeholder for Missing Images
		      if (!currentItems[i].imageUrl) currentItems[i].imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mO8VA8AAikBU9RsF2cAAAAASUVORK5CYII=';

		      var currentItemTemplate = 
		          itemTemplate.replace(/\{{IMAGE}}/g, currentItems[i].imageUrl )
		            .replace(/\{{LINK}}/g, currentItems[i].detailUrl)
		            .replace(/\{{NAME}}/g, currentItems[i].name)
		            .replace(/\{{PRICE}}/g, 
		              NIBSA.TOOLS.formatPrice(sellingPrice, '.', ',', 0, '$'))
		            .replace(/\{{QTY}}/g, currentItems[i].quantity)
		            .replace(/\{{ID}}/g, currentItems[i].productId)
		            .replace(/\{{INDEX}}/g, i);

		      if (currentItems[i].sellingPrice != currentItems[i].listPrice) {
		        currentItemTemplate = currentItemTemplate.replace(/\{{LISTPRICE}}/g, 
		          NIBSA.TOOLS.formatPrice(listPrice, '.', ',', 0, '$'));
		      } else {
		        currentItemTemplate = currentItemTemplate.replace(/\{{LISTPRICE}}/g, '');
		      }

		      jQuery(whereTo).append(currentItemTemplate);

		    }

		    // Fill Quantity in MiniCart Link
		    jQuery('#mini-cart-link .quantity').text(currentItems.length);

		    // Set Remove Item Function
		    jQuery('.item-remove').on('click', function(e){
		      e.preventDefault();
		      var itemToRemove = [{
		          "index": jQuery(this).data('index'),
		          "quantity": 0,
		        }];
		      vtexjs.checkout.removeItems(itemToRemove).done(function(){

		        NIBSA.TOOLS.constructMC(whereTo, true);
		      });
		    });

		    var total = cartControl.find('.vtexsc-totalCart .vtexsc-text').text().replace(",00", "");
		    cartHolder.find('.mini-cart-footer .totals .money').text(total);

		  } else {		    
		    jQuery(whereTo).parent().addClass('empty');
		    jQuery('#mini-cart-link').removeClass('filled');

		  }    

		},
		// constructMC();
	},
	views: { 

		global: function () {
			
			jQuery("#mini-cart-link").click(function() {
			  jQuery("header").addClass("open");			  
			  jQuery("#mini-cart-holder-full").addClass("open");			  
			});
			jQuery("#mini-cart-holder-full .mini-cart-header .close , #newheader div#mini-cart-overley").on('click',function() {
			  jQuery("header").removeClass("open");			  
			  jQuery("#mini-cart-holder-full").removeClass("open");			  
			});

			(function makeHoverMenu(){
				//Add Hover effect to menus
				jQuery('header #new-top-menu ul.navbar-nav li.dropdown').hover(function() {
				  jQuery(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn();
				}, function() {
				  jQuery(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut();
				});



				jQuery('header #new-top-menu .dropdown-menu .row .categories-list ul h3').hover(function () {
				  var h3Selected = $("header #new-top-menu .dropdown-menu .row .categories-list ul h3")
				  h3Selected.css({				    
				  })

				  jQuery(this).css({
				    "display": "flex",
				  })

				  var classSelected = '.submenu-dropdown.' + $(this).attr('class');
				  console.log(classSelected)
				  jQuery('.submenu-dropdown').css({
				    "display": "none"
				  });

				  jQuery(classSelected).css({
				    "display": "flex",
				  });

				})
			})();
		  
		  // see if the user is logged in or not
		  (function _makeLoggin(){
		    jQuery(document).on("ajaxStop",function(){
		      _ifUserLoggedIn();
		    });        
		    function _ifUserLoggedIn(){
		      if (jQuery('.ajax-content-loader').find("#login").length > 0){
		        //user NO logueado
		        jQuery('body').removeClass("logged-user").addClass("guestuser");
		      }else{
		        //User logueado.
		        jQuery('body').removeClass("guestuser").addClass("logged-user");
		      }
		    }
		    _ifUserLoggedIn();

		    //this function is to close popuplogin
		    function goToHome(){
		        jQuery(window).load(function(){
		            jQuery('#login-page .modal-header .vtexIdUI-close').on('click', function(){
		                window.location = '/';
		            });
		        });
		    }
		    goToHome();

		  })();

		  //resize search image
		  (function resizeSearchImage() {
		      jQuery(document).on("ajaxStop load", function(){
		          jQuery(".ui-autocomplete .ui-menu-item").each(function(){
		              liElement     = jQuery(this);
		              thumbImg        = jQuery(liElement).find('img');
		              if (thumbImg.length) {
		                  thumbSrc        = jQuery(thumbImg).attr("src");
		                  newSource     = thumbSrc.replace("25-25","50-50"); 

		                  jQuery(thumbImg).attr("src",newSource); 
		              }
		          });
		      });
		  })();

		},


		homepage: function () {             

		},
		//HOMEPAGE

		grid: function () {

			var mobileBreakpoint = 991;
			if( window.innerWidth <= mobileBreakpoint ){
				jQuery('#departament-page #open-link').appendTo('#departament-page #main-content .orderBycustom');

				jQuery('#departament-page .open-close-filter').on('click',function(){                
				  jQuery('#departament-page .sidebar').toggleClass('active'); 
				});
			}	

		  // -- AJAX Filters
		  function checkForSmartResearch() {

		    if (jQuery.fn.vtexSmartResearch != undefined) {

		      clearInterval(checkForSmartResearchInterval);

		      jQuery(".sidebar input[type='checkbox']").vtexSmartResearch({
		        filtersFullWrapper: ".sidebar .departament-navegador",
		        loadContent: ".prateleira[id^=ResultItems]",
		        shelfClass: ".prateleira.vitrine",
		        menuDepartament: ".navigation-tabs .menu-departamento",
		        insertMenuAfter: ".search-multiple-navigator h3:first",
		        emptySearchElem: jQuery('<div class="vtexsr-emptySearch"></div>'),
		        elemLoading: '<div id="scrollLoading"><div class="placeholder"></div><div class="placeholder"></div></div>',
		        returnTopText: '<span class="text">volver</span><span class="text2">ARRIBA</span>',
		        emptySearchMsg: '<h3>No hay resultados para estos filtros</h3>',
		        filterErrorMsg: "hubo un error al intentar filtrar.",
		        showFiltersQty: false,
		        trackGTM: false,
		        orderByToCustom: true,
		        orderByCustomPlace: '#collections .orderBycustom',
		        showAppliedFilters: false,
		        clearFiltersLink: false,
		        clearFiltersLinkPlace: '#applied-filters',
		        clearFiltersLinkText: 'Eliminar filtros',
		        productsMergeClass: 'prateleira vitrine n1colunas',
		        showAppliedFiltersTags: '#applied-filters',
		        callback: function () {
		        	jQuery('fieldset h5').click(function(){
		        	    jQuery(this).parent().toggleClass('active');
		        	});
		        }
		        // Callback
		      });
		      // SmartResearch()		      

		    }
		    // If Smart Research
		  }
		  //checkForSmartResearch()

		  // We set an interval check to ensure library load.
		  var checkForSmartResearchInterval = setInterval(checkForSmartResearch, 100);
		},
		// GRID

		productPage: function() {

			function imagenZoom() {
				jQuery('<div class="zoom-image"></div>').appendTo('.product-image #show #include');
				jQuery('.zoom-image').click(function () {
				  setTimeout(function () {
				    jQuery("body").css("overflow", "hidden");
				    var urlImagenFull = jQuery('.product-image #show #include img#image-main').attr('src').replace('-55-55', '-1800-1800');
				    var htmlLightBoxImage = '<div class="zoombox fullImageZoom" style="display: none;"><div class="lightbox"><div class="closeLightbox"></div><div class="contentFullImage"><img class="fullImage" src="' + urlImagenFull + '" /></div></div></div>';
				
				
				    jQuery('body').append(htmlLightBoxImage);
				    jQuery('.fullImageZoom').fadeIn();
				
				    jQuery('.fullImageZoom .closeLightbox').click(function () {
				      jQuery('.zoombox').fadeOut(500, function () {
				        jQuery('.zoombox').remove();
				        jQuery('body').css({ overflow: 'scroll' });
				      });
				    });
				    jQuery('.fullImageZoom').click(function (event) {
				      jQuery(this).fadeOut(500, function () {
				        jQuery(this).remove();
				        jQuery('body').css({ overflow: 'scroll' });
				      });
				    });
				    jQuery('.fullImageZoom').click(function (event) {
				      event.stopPropagation();
				    });
				    var zoomHeight = jQuery('.zoombox .lightbox');
				    jQuery('.zoombox').scrollTop(zoomHeight.height() / 3);
				    var imgSrc = jQuery('.fullImageZoom .contentFullImage .fullImage').attr("src").replace("-500-500", "-1800-1800");
				    jQuery('.fullImageZoom .contentFullImage .fullImage').attr("src", imgSrc);
				  }, 200);
				  jQuery("body").css("overflow", "auto");
				});

			}
			imagenZoom();

			// Info Panels Logic
			(function stockAvailable() {
  			// Put Sotck available
         var skuData2 = skuJson.skus[0].availablequantity; 

        document.querySelector(".stock-text").innerText = "Solo quedan algunos productos. Haz un pedido pronto.";
        document.querySelector(".stock-quantity").innerText = "(" + skuData2 + " " + "disponibles)";

        if (skuData2 > 0 && skuData2 < 15) {
          $(".stock-disponible").show();
        } else {
          $(".stock-disponible").hide();
        }
        // Put Sotck available

			})();
			
			jQuery("#toggle-especification > h3").click(function() {
			  jQuery("#toggle-especification").toggleClass("active");
			});

			jQuery(".video-descargas #Descargas > h3").click(function() {
			  jQuery(".video-descargas #Descargas").toggleClass("active");
			});

			jQuery(".video-descargas #video > h3").click(function() {
			  jQuery(".video-descargas #video").toggleClass("active");
			});


			(function attributesWrapper() {

				if(jQuery("#caracteristicas .value-field.DESCRIPCION-TECNICA").length > 0){
				  var toggleInfo = jQuery("#caracteristicas .value-field.DESCRIPCION-TECNICA").html();
				  jQuery("#toggle-especification .toggle-info").append(toggleInfo);	
				  jQuery("#toggle-especification .toggle-info br").remove();		  
				}else {
					jQuery("#toggle-especification").hide();	
				}

				if(jQuery("#caracteristicas .value-field.FICHAS-TECNICAS").length > 0){
				   var url = jQuery('td.value-field.FICHAS-TECNICAS a').attr('href');
				  jQuery("#new-product-page #Descargas a").attr('href',url)
				}else {
					jQuery("#new-product-page #Descargas").hide();	
				}

				if(jQuery("#caracteristicas .value-field.VIDEO").length > 0){
				   var video = jQuery('td.value-field.VIDEO').clone();
				  jQuery("#new-product-page #video .video-info").append(video);	
				}else {
					jQuery("#new-product-page #video").hide();	
				}

			})();

			// Product Added Event
			jQuery(window).on('cartProductAdded.vtex', function (e) {
			
			  alert = function () {};
			
			  jQuery.fancybox({
			    'href': '#seguircomprando',
			    'titleShow': false,
			    'transitionIn': 'elastic',
			    'transitionOut': 'elastic',
			    wrapCSS: 'seguir_compra',
			  });
			
			  //$("html, body").animate({ scrollTop: 0 }, "slow");
			
			  vtexjs.checkout.getOrderForm().done(function (e) {

			  	jQuery(".btn_siga, .fancybox-overlay").click(function () {
			  	  window.location.reload();
			  	});
			
			  });
			
			});

			if (jQuery("#new-product-page .page section .product-image #show .thumbs li").length == 1) {
				jQuery("#new-product-page .page section .product-image").addClass("onlyOneThumbs");
			}

			// We catch the event with jQuery as it's fired from the library an VainillaJS can't access it
			//jQuery(window).on('skuSelected.vtex', function () {
			jQuery(window).on('skuSelected.vtex', function (eventData, prodID, skuData) {
				imagenZoom();
			});			

			// (function change_text_buy_together() {
			// 	var text_buy_together = jQuery("#new-product-page .page .comprar-junto table tbody tr td.buy").text();
			// 	var text_buy_togetherSplit = text_buy_together.split('  ');
			// 	var text_buy_togetherFinal = text_buy_togetherSplit[0].replace(",00"," ").replace("$ ","$");

			// 	var total_price = '<div class="total_price"></div>';
			// 	jQuery(total_price).insertBefore("#new-product-page .page .comprar-junto table tbody tr td.buy strong");
			// 	jQuery("#new-product-page .page .comprar-junto table tbody tr td.buy .total_price").text(text_buy_togetherFinal);


			// 	var changeTextButtomBuy = jQuery("#new-product-page .page .comprar-junto table tbody tr td.buy strong").text().replace(",00"," ").replace("$ ","$");
			// 	jQuery("#new-product-page .page .comprar-junto table tbody tr td.buy strong").text(changeTextButtomBuy);
			// })();

		}
	}
}



function eventBindedInit() {

	NIBSA.views.global();

  // Given that any view is based on ID & Classes of the Body, we store
  // to ensure we have fast access to them.
  var bodyNode = document.querySelector('body'),
  currentViewID = bodyNode.id,
  currentViewClass = bodyNode.classList;

  // -- homepage
  if (currentViewID === 'new-home-page') {
    NIBSA.views.homepage();
  }

    // -- GRID
  if (currentViewID === 'departament-page') {
    NIBSA.views.grid();
  }

  // -- PRODUCT PAGE
  if (currentViewID === 'new-product-page') {
    NIBSA.views.productPage();
  }

}
// Inits on Corresponding Event

jQuery(document).ready(function () {
  eventBindedInit();
});


/*************************************/
/*********FUNCIONES MINICART**********/
/*************************************/
var MINICART ={
    init:function(){
        this.nibsaCart();
        this.refreshOnBuy();
        this.refreshOnProdRemoved();
    },

    refreshOnBuy: function (){
        jQuery(window).on("cartProductAdded.vtex", function () {
            NIBSA.TOOLS.constructMC("#mini-cart-holder-full .items", true);
        });
    },

    refreshOnProdRemoved: function (){
        jQuery(window).on("cartProductRemoved.vtex", function () {
            NIBSA.TOOLS.constructMC("#mini-cart-holder-full .items", true);
        });
    },

    nibsaCart: function() {

        // Quantity Control - Set here to avoid request overflow
        jQuery(document).on('click', '#mini-cart-holder-full .items .sub .qty', function(e) {

            e.preventDefault();

            jQuery(this).parents(".sub-wrapper").addClass('loading');

            var prodID = jQuery(this).data('id');
            var indexProd = jQuery(this).data('index');
            var qtyProd = Number( jQuery(this).parent().children(".item-qty").text() );

            if ( jQuery(this).hasClass('minicart_adds') ) qtyProd++;
            if ( jQuery(this).hasClass('minicart_subs') && qtyProd > 0 ) qtyProd--;
            
            var itemToUpdate = [{
            index: indexProd,
            quantity: qtyProd
            }];

            vtexjs.checkout.updateItems(itemToUpdate, null, false).done(function(data, textStatus, xhr) {
                jQuery(this).parents(".sub-wrapper").removeClass('loading');
                NIBSA.TOOLS.constructMC("#mini-cart-holder-full .items", true);
            });

        });

        // --- Forge Full Minicart
        var checkForVtexCart;
        console.log("[MiniCart] Starting... ");

        // Checks if MiniCartart is available, else waits for the Event
        checkForVtexCart = setInterval(function () {
          
          // if (body && body.hasOwnProperty('result')){

          if ( vtexjs.checkout.orderForm && vtexjs.checkout.orderForm.hasOwnProperty('items') ) {
            clearInterval(checkForVtexCart);
            NIBSA.TOOLS.constructMC('#mini-cart-holder-full .items', true);
            console.log("[MiniCart] Ready. ");
          }

        }, 50);

    }
}




jQuery(document).ready(function () {
	vtexjs.checkout.getOrderForm().then(function( orderForm ) { console.log(orderForm); })    
  MINICART.init(); 
});

// EVENT --------------------------------------------------------