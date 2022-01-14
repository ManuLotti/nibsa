var skuSelector = (function () {

	var config = {
		elements:{
			classes:{
				skuContainer:'.seletor-sku'
			}
		},
		sellerId:'1',
		qtButton: {
			minusLimit:0,
			moreLimit:1000
		},
		quotationOnly: false,
		footerDiv: {
			version: '2',
			redirectTo: '/checkout/#/cart'
		},
		totalPrice: true,
		showNotifyMe: false
	};


	// Elementos html
	var popCart = 	'<div id="popCart" style="display:none">\
						<div class="popCartMessage">Hemos enviado los productos seleccionados al carro de compras donde podrar comprar o cotizar.<span class="closePopCart"><a href="#">X</a></span></div>\
						<div class="btns">\
							<span class="continueshopping"><a href="#">Seguir comprando</a></span>\
							<span class="quoting"><a href="/cotizacion">Cotizar</a></span>\
							<span class="goCart"><a href="/checkout/#/cart">Ir al carro <i class="fa fa-cart-plus" aria-hidden="true"></i></a></span>\
						</div>\
					</div>\
					';

	var footerDivV1 = '<div class="footerSku">'+
						'<div class="first">'+
							'<div class="totalMsg" style="display:none">Total</div>'+
							'<p class="msg">Seleccione productos</p>'+
						'</div>'+
						'<div class="second"><a class="addItensToCart">Cotizar o Comprar</a></div>'
					'</div>';

	var footerDivV2 = '<div class="footerSku">'+
						'<div class="first">'+
							'<div class="totalMsg" style="display:none">Total</div>'+
							'<p class="msg">Seleccione productos</p>'+
						'</div>'+
						'<div class="second"><a class="cartButton">Comprar <i class="fa fa-cart-plus" aria-hidden="true"></i></a>'+
						'<a class="quotationButton">Cotizar este producto</a></div>'+
					'</div>';				

	var _createCheckboxWithId = function (id) {
		return 	'<div class="skuCheck">'+
                	'<input type="checkbox" class="qtCheckbox cb_'+id+'" id="cb_'+id+'" name="skuSelector" value="'+id+'">'+
               		'<label for="cb_'+id+'"></label>'+
                '</div>';
	};

	var _createInputWithId = function (id) {
		return 	'<div class="qtde">'+
                '<div class="qtButtons qt_'+id+'"> <a class="minus" style="display:block">-</a>'+
                    '<input type="number" class="qtdeInput" value="0"> <a class="more" style="display:block">+</a> </div>'+
            	'</div>';
	};

	var _transformPrice = function (value, format) {
		//private
		if (!value) {
			return '';
		}
		var text = '';
		switch(format) {
			case 'colon':
				text = value.substr(value.indexOf(':')+1, value.length);
				break;
			case 'comma':
				text = value.substr(0, value.indexOf(','));
				break;
		}
		return text;
	};


	var _createUI = function () {
		$('#buyButton').hide();
		switch (config.footerDiv.version) {
			case '1':
				$(footerDivV1).insertAfter(config.elements.classes.skuContainer);
				if (config.quotationOnly) {
					$('.addItensToCart').html('Cotizar');
				}
				break;
			case '2':
				$(footerDivV2).insertAfter(config.elements.classes.skuContainer);
				break;
		}
		if (!config.quotationOnly) {
			$('body').append(popCart);
		}
		$(config.elements.classes.skuContainer+' .skuList').each(function(){
				if ($(this) && $('.preco',this).length != 0 && $('.buy-button',this).length != 0) {
					$('.buy-button',this).hide();

					var sku = $('.buy-button',this).attr('href').match("sku=[^&]*").toString();
					var id = sku.substr(sku.indexOf("=") + 1)
					$(this).addClass('sku_'+id);

					//crear e insertar sku container 
					var skuHtml = '<div class="skuNumber_'+id+'"></div>';
					$(skuHtml).insertAfter($('.nomeSku',this));
					skuHtml = '<div class="skuStock_'+id+'"></div>';
					$(skuHtml).insertAfter($('.nomeSku',this));
					//crear e insertar chechbox 
					$(_createCheckboxWithId(id)).insertBefore($('.imageSku',this));

					
					//crear e insertar input
			        $(_createInputWithId(id)).insertAfter($('.preco',this));
			        $('.preco',this).addClass('pr_'+id);

			        $('.pr_'+id+' em.valor-por').html(_transformPrice($('.pr_'+id+' em.valor-por').html(), 'colon'));
			        $('.pr_'+id+' em.valor-de').html(_transformPrice($('.pr_'+id+' em.valor-de').html(), 'colon'));
			        $('.pr_'+id+' em.valor-por strong').html(_transformPrice($('.pr_'+id+' em.valor-por strong').html(), 'comma'));
			        $('.pr_'+id+' em.valor-de strong').html(_transformPrice($('.pr_'+id+' em.valor-de strong').html(), 'comma'));

				} else {
					if (config.showNotifyMe) {
						var notifyLink = '<span>Este producto no estÃ¡ disponible, <a class="showNotifyMe">dÃ©janos tu correo</a> y entÃ©rate sobre disponibilidad.</span>';
						$(notifyLink).insertAfter($('.nomeSku',this));
					} else {
						$(this).hide();
					}
					
				}
		});
	};

	var _addToCart = function () {
		var orderItems = [];
		$(config.elements.classes.skuContainer+' .skuList').each(function() {
				if ($(this) && $('.preco',this).length != 0) {
					if ($('.skuCheck .qtCheckbox',this).is(":checked")) {
						var sku = _getIdentifier($('.skuCheck .qtCheckbox',this).attr('class').split(/\s+/), 'cb_');
						var qtde = 0;
						qtde = $('.qt_'+sku).children('.qtdeInput').val();
						orderItems.push({
							"id": sku, // SKU do item
							"quantity": qtde
						});

					};
				}
		});
		_makeCartRequest(orderItems);
	};

	var _makeCartRequest = function (orderItems) {
		if (orderItems.length > 0) {
			$('#ajaxBusy').show();
			var newAdd = "/checkout/cart/add?";
			for (var i = 0; i < orderItems.length; i++) {
				newAdd = newAdd + 'sku=' + orderItems[i].id + '&qty=' + orderItems[i].quantity + '&seller='+config.sellerId+'&redirect=true&'
			};
			newAdd = newAdd + (window.location.search).replace('?','');

			$.ajax({
				type: 'GET',
				url: newAdd,
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				processData: false,
				crossDomain: true,
				async: true,
				error: function(xhr, ajaxOptions, thrownError) {
					var error_message = '';
					switch (xhr.status) {
						case 404:
							error_message = '404 - A pÃƒÂ¡gina da requisiÃƒÂ§ÃƒÂ£o nÃƒÂ£o foi encontrada.';
							break;
						case 403:
							error_message = '403 - A pÃƒÂ¡gina da requisiÃƒÂ§ÃƒÂ£o nÃƒÂ£o foi encontrada e o retorno foi "Acesso negado"';
							break;
						case 500:
							error_message = '500 - Houve um erro interno no servidor.';
							break;
						default:
							break;
					}
					console.log(error_message);
					switch (config.footerDiv.version) {
						case '1':
							if (config.quotationOnly) {
								window.location.href = "/cotizacion";
							} else {
								$('#popCart').fadeIn(400);
							}
							break;
						case '2':
							window.location.href = config.footerDiv.redirectTo;
							break;
					}
					
				}
			});
		} else {
			alert('Ningun producto disponible para ser agregado al carro. \n Por favor verifique si existe disponibilidad de productos.');
		}
	}

	var _getProductoData = function () {
	 	var skuRequestUrl = 'https://nibsa.vtexcommercestable.com.br/api/catalog_system/pub/products/search?fq=productId:'+$('#___rc-p-id').val();
		$.get(skuRequestUrl, function( data ) {
			$(data[0].items).each(function(){
				if (this.referenceId[0]) {
					$('.skuNumber_'+this.itemId).html(this.referenceId[0].Value);
				}
			});
		});
	}

	var _getProductWithVar = function () {
		var skuId = $('#___rc-p-id').val();
		vtexjs.catalog.getProductWithVariations(skuId).done(function(product) {
			if (product.skus.length) {
		      	$(product.skus).each(function() {
		      		var avQty = this.availablequantity;
		      		if (avQty == '99999') {
		      			avQty = '+15';
		      		} 
		      		$('.skuStock_'+this.sku).append('<span> Stock: </span>'+avQty);
		        	
		      	});
		    }
		    
		  });
	}

	var _qtButtonPressed = function (button, type) {
		//private
		var quantityInput = $(button).siblings('.qtdeInput');
		var factor = 0;
		switch(type) {
			case 'minus':
				factor = -1;
				break;
			case 'more':
				factor = 1;
				break;
		}
		var newQuantity = parseInt(quantityInput.val()) + factor;
		var identifier = _getIdentifier($(button).parent().attr('class').split(/\s+/), 'qt_');
		if (newQuantity == config.qtButton.minusLimit) {
			if ($('.cb_'+identifier).is(":checked")) {
				$('.cb_'+identifier).prop('checked', false);
			}
		} else if (newQuantity > config.qtButton.minusLimit) {
			if (!$('.cb_'+identifier).is(":checked")) {
				$('.cb_'+identifier).prop('checked', true);
			}
		}
		if (newQuantity >= config.qtButton.minusLimit && newQuantity <= config.qtButton.moreLimit) {
			quantityInput.val(newQuantity);
			_updateQuantity();
		}
	};

	var _qtCheckboxPressed = function (button) {
		//private
		var identifier = _getIdentifier($(button).attr('class').split(/\s+/), 'cb_');
		var quantityInput = $('.qt_'+identifier).children('.qtdeInput');
		if (!$(button).is(":checked")) {
			quantityInput.val(config.qtButton.minusLimit);
		} else {
			quantityInput.val(config.qtButton.minusLimit+1);
		};
		_updateQuantity();
	};

	var _qtInputModified = function(input) {
		if ($(input).val() < config.qtButton.minusLimit) {
			$(input).val(config.qtButton.minusLimit);
		} else if ($(input).val() > config.qtButton.moreLimit) {
			$(input).val(config.qtButton.moreLimit);
		}
		var identifier = _getIdentifier($(input).parent().attr('class').split(/\s+/), 'qt_');
		if ($(input).val() > config.qtButton.minusLimit) {
			$('.cb_'+identifier).prop('checked', true);
		} else {
			$('.cb_'+identifier).prop('checked', false);
		}
		_updateQuantity();
	}

	var _getIdentifier = function (classArray, type) {
		//private
		var identifier;
		$(classArray).each(function(index, value){
			if (value.substr(0,3) == type) {
				identifier = value.substr(value.indexOf('_')+1, value.length);
			}
		});
		return identifier;
	};

	var _floatToCurrency = function (number) {
		var numberToArray = number.toString().split("").reverse();
		var numberConverted = [];
		for(var i = numberToArray.length; i >= 0; i--){
			if ((i != 0) && (i % 3 == 0) && i != numberToArray.length) {
				numberConverted.push(numberToArray[i]+'.');
			} else {
				numberConverted.push(numberToArray[i]);
			};
		}
		return numberConverted.join('');
	}

	var _updateQuantity = function() {
		var checkOutTotal = 0;
		$('.qtdeInput').each(function() {
			if ($(this).val() >= 0) {
				if (config.totalPrice) {
					var identifier = _getIdentifier($(this).parent().attr('class').split(/\s+/), 'qt_');
					var precioUnitario = $('.pr_'+identifier+' em.valor-por strong').text().replace('$ ', '').replace('.', '');
					checkOutTotal += parseInt($(this).val()) * precioUnitario;
				} else {
					checkOutTotal += parseInt($(this).val());
				}
			}
		});
	    //checkOutTotal = checkOutTotal + quantity;
	    if (checkOutTotal == 0) {
	    	$('.footerSku .msg').text('Seleccione productos');
	    	$('.totalMsg').hide();
	    } else {
	    	if (config.totalPrice) {
	    		$('.footerSku .msg').text('$'+_floatToCurrency(checkOutTotal));
	    	} else {
	    		$('.footerSku .msg').text(checkOutTotal);
	    	}
	    	$('.totalMsg').show();
	    };
	}

	var _bindUIActions = function () {
		//private
		//Evento para vinculo a "seguir comprando"
		if (!config.quotationOnly) {
			$('.continueshopping a').bind('click', function(e) {
				e.preventDefault();
				location.reload();
			});
			//Evento para vinculo a "boton de cerrar popcart"
			$('.closePopCart a').bind('click', function(e) {
				e.preventDefault();
				$('#popCart').fadeOut(200);
			});
		}
		//Evento para aÃƒÂ±adir items al carro
		switch (config.footerDiv.version) {
			case '1':
				$('.footerSku .addItensToCart').bind('click', function(e) {
					e.preventDefault();
					_addToCart();
				});
				break;
			case '2':
				$('.footerSku .cartButton').bind('click', function(e) {
					e.preventDefault();
					config.footerDiv.redirectTo = '/checkout/#/cart';
					_addToCart();
				});
				$('.footerSku .quotationButton').bind('click', function(e) {
					e.preventDefault();
					config.footerDiv.redirectTo = '/cotizacion';
					_addToCart();
				});
				break;
		}
		
		$('.qtButtons .minus').bind('click', function() {
			_qtButtonPressed($(this),'minus');
		});
		$('.qtButtons .more').bind('click', function() {
			_qtButtonPressed($(this),'more');
		});
		$('.qtCheckbox').bind('click', function() {
			_qtCheckboxPressed($(this));
		});
		$('.qtdeInput').on('input', function() { 
			_qtInputModified($(this));
		});

		if (config.showNotifyMe) {
			$('.showNotifyMe').bind('click', function() {
				$(this).parent().fadeOut("fast", function(){
					$(this).siblings('.portal-notify-me-ref').fadeIn("fast");
				});
			});
		}
	};

  // Configuration changes 
	var _changeConfig = function() {
		function set(o){
			var reg = /\./g;
			if(isObj(o)){
				for(var i in o){
					if(i.indexOf('.')!== -1){
						var str = '["' + i.replace(reg,'"]["') + '"]';
						var val = getValue(o[i]);
						eval('config' + str + '=' + val);
					} else {
						findProperty(config,i,o[i]);
					}
				}
			}
		};
		function findProperty(o,p,v){
			for(var i in o){
				if(isObj(o[i])){
					findProperty(o[i],p,v);
				} else {
					if(i === p){o[p] = v;};
				}
			}
		};
		function isObj(o){
			return (typeof o === 'object' && typeof o.splice !== 'function');
		};
		function getValue(v){
			switch(typeof v){
				case 'string': return "'"+v+"'"; break;
				case 'number': return v; break;
				case 'object':
				if(typeof v.splice === 'function'){
					return '['+v+']';
				} else {
					return '{'+v+'}';
				}
				break;
				case NaN: break;
			};
		};
		return{set:set};
	}();

	var init = function (config) {
		if (config) {
			_changeConfig.set(config);
		}
		_createUI();
		_bindUIActions();
		_getProductoData();
		_getProductWithVar();
	};
  
	return {
		init: init,
		config: config
	};

})();

if ($('#product-content').length) {
	skuSelector.init({
		'sellerId':'1',
		'elements.classes.skuContainer':'.seletor-sku',
		'quotationOnly':false,
		'qtButton.moreLimit':200,
		'footerDiv.version':'1',
		'totalPrice': true,
		'showNotifyMe':true
	});
}


if(document.querySelector('#product-page .seletor-sku .skuCheck label')){
 
  	let skuFirst = document.querySelector('#product-page .seletor-sku .skuCheck label');
  		skuFirst.click();
}
