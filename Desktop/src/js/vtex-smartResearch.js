/**
 * ---------------------------------------------------------------------
 *	Smart Research
 *	@description Converts the native VTEX Filters into Ajax equivalents.
 *	@author Carlos Vinicius
 *	@contributor Edson Domingos Júnior
 *	@version 3.9
 *	@date 2012-10-22
 * ---------------------------------------------------------------------
 * 
 * @description New modded version for improved perfomance, translated
 * to english, applied changes in animations based on VTEX Clean template 
 * @author Brandlive
 * @version 4.2
 * @date 08-2018
 * TODO: Feature List, Add Documentation
 * ---------------------------------------------------------------------
 */
var currentPage = 2;
"function" !== typeof String.prototype.replaceSpecialChars && (String.prototype.replaceSpecialChars = function () {
  var b = {
    "\u00e7": "c",
    "\u00e6": "ae",
    "\u0153": "oe",
    "\u00e1": "a",
    "\u00e9": "e",
    "\u00ed": "i",
    "\u00f3": "o",
    "\u00fa": "u",
    "\u00e0": "a",
    "\u00e8": "e",
    "\u00ec": "i",
    "\u00f2": "o",
    "\u00f9": "u",
    "\u00e4": "a",
    "\u00eb": "e",
    "\u00ef": "i",
    "\u00f6": "o",
    "\u00fc": "u",
    "\u00ff": "y",
    "\u00e2": "a",
    "\u00ea": "e",
    "\u00ee": "i",
    "\u00f4": "o",
    "\u00fb": "u",
    "\u00e5": "a",
    "\u00e3": "a",
    "\u00f8": "o",
    "\u00f5": "o",
    u: "u",
    "\u00c1": "A",
    "\u00c9": "E",
    "\u00cd": "I",
    "\u00d3": "O",
    "\u00da": "U",
    "\u00ca": "E",
    "\u00d4": "O",
    "\u00dc": "U",
    "\u00c3": "A",
    "\u00d5": "O",
    "\u00c0": "A",
    "\u00c7": "C"
  };
  return this.replace(/[\u00e0-\u00fa]/g, function (a) {
    return "undefined" != typeof b[a] ? b[a] : a
  })
});
"function" !== typeof String.prototype.trim && (String.prototype.trim = function () {
  return this.replace(/^\s+|\s+$/g, "")
});
jQuery.fn.vtexSmartResearch = function (opts) {
  $this = jQuery(this);

  var log = function (msg, type) {
    if (typeof console == "object")
      console.log("[Smart Research - " + (type || "Error") + "] " + msg);
  };

  var defaults = {
    fullResults: true, // [Boolean] Brings ALL the filtered results in the same ajax call, added to solve pagination limitations
    pageLimit: null, // [Number] Maximun number of pages. Example: "pageLimit=3" will bring results up to the third page.
    filtersFullWrapper: "#filters", // [Selector] The element containing the full filtering control.
    loadContent: ".prateleira[id^=ResultItems]", // [Selector] Wrapper element for the returned products
    shelfClass: ".prateleira", // [Selector] Product results container (Defined in BackEnd)
    filtersMenu: ".search-multiple-navigator", // [Selector] Checkbox Based Filters Menu
    linksMenu: ".search-single-navigator", // [Selector] Link Based Filters Menu
    menuDepartament: ".navigation .menu-departamento", // [Selector] Department Navigation Menu
    mergeMenu: false, // [Boolean] Merges the checkbox base menu with the link based one
    insertMenuAfter: ".search-multiple-navigator h3:first", // [Selector] Link based menu, merge destination
    emptySearchElem: jQuery('<div class="vtexsr-emptySearch"></div>'), // [jQuery ELement] Empty Search Message wrapper
    elemLoading: '<div id="scrollLoading">Loading...</div>', // [HTML element] loading message
    emptySearchMsg: '<h3>There are no results matching your filters</h3>', // [HTML element] No matching results message
    filterErrorMsg: "Theres was an error whle filtering the results.", // [Plain Text] Filtering error Message
    smartFilters: undefined, // [Selector] The element that will contain the smart filtering control.
    trackGTM: false, // [Boolean] If the filtering should push it's values to GTM DataLayer
    showFiltersQty: true, // [Boolean] Wheter or not the quantity of products from that filter should appear in the label.
    searchUrl: null, // [URL] Search Page URL
    showLinks: false, // [Boolean] Show Link Based menu in case of Checkbox Based menu is not available
    orderByToCustom: false, // [Boolean] Forges orderBy control as a HTML piece to Style
    orderByCustomPlace: null, // [Selector] The element that will contain the custom orderBy control.
    showAppliedFilters: false, // [Boolean] Shows the applied filters as a Number on the Filter Title
    showAppliedFiltersTags: false, // [Selector] Where the applied filters tags should show
    clearFiltersLink: false,  // [Boolean] Show a "CLEAR FILTERS" link at the end of the filters.
    clearFiltersLinkPlace: null, // [Selector/Optional] The element that will contain the clear filters link.
    clearFiltersLinkText: 'Borrar Filtros', // [STRING] Clear Filters Button text
    productsMergeClass: 'product-list n1colunas', // [STRING] Class(es), not selectors, of the current shelf to merge all products in.
    callback: function () { },
    // Calculates the Shelf Height to ensure a new, if available, page is loaded before the user reaches the "end"
    getShelfHeight: function (container) {
      return (container.scrollTop() + container.height());
    },
    // Callback after the Shelf is inserted
    shelfCallback: function () { },
    /* Callback after each successful AJAX Request
       Receives as a parameter, an Object containing all requests mades and the quantity of applied filters */
    ajaxCallback: function () { },
    /* Callback after a request returns an empty search
       Receives as a parameter, an Object containing all requests mades and the quantity of applied filters */
    emptySearchCallback: function () { },
    /* Authorizes, or not, the infinite scroll execution
    Receives as a parameter, an Object containing all requests mades and the quantity of applied filters */
    authorizeScroll: function () {
      return true;
    },
    // Função para permitir ou não que o conteúdo de "loadContent" seja atualizado. Esta deve retornar "true" ou "false"
    /* Authorizes, or not, the update of content inside loadContent
    Receives as a parameter, an Object containing all requests mades and the quantity of applied filters */
    authorizeUpdate: function () {
      return true;
    },
    // Callback after Fieldsets & Labels have forged. Returns data about them.
    labelCallback: function (data) { }
  };

  var options = jQuery.extend(defaults, opts),
    _console = "object" === typeof (console),
    $empty = jQuery(""),
    elemLoading = jQuery(options.elemLoading),
    moreResults = true,
    _window = jQuery(window),
    _document = jQuery(document),
    _html = jQuery("html,body"),
    body = jQuery("body"),
    currentSearchUrl = "",
    urlFilters = "",
    searchUrl = "",
    animatingFilter = false,
    loadContentE = jQuery(options.loadContent),
    filtersMenuE = jQuery(options.filtersMenu),
    filtersFullWrapperE = jQuery(options.filtersFullWrapper),
    smartFiltersWrapperE = jQuery(options.smartFilters),
    ajaxCallbackObj = {
      requests: 0,
      filters: 0,
      isEmpty: false
    },
    trackGTM = options.trackGTM,
    orderByToCustom = options.orderByToCustom,
    orderByCustomPlace = jQuery(options.orderByCustomPlace),
    _mergeRegexObject = new RegExp('^([^])+(' + options.productsMergeClass + '">)', "i"),
    labelCallbackData = {};

  var fn = {
    getUrl: function (scroll) {
      var s = scroll || false;
      if (s) {
        //console.log('currentSearchUrl - ', currentSearchUrl);
        return currentSearchUrl.replace(/PageNumber=[0-9]*/, "PageNumber=" + currentPage);
      } else {
        //console.log('searchUrl + urlFilters - ', searchUrl + urlFilters);
        if (searchUrl.indexOf('&O') > -1 ) {
          searchUrl = searchUrl.replace(/&O.*&PS/, '&PS');
        }
        return (searchUrl + urlFilters).replace(/PageNumber=[0-9]*/, "PageNumber=" + pageNumber);
      }
    },
    // ---------- getUrl ---------------------------
    getSearchUrl: function () {
      var url, content, preg;
      jQuery("script:not([src])").each(function () {
        content = jQuery(this)[0].innerHTML;
        preg = /\/buscapagina\?.+&PageNumber=/i;
        if (content.search(/\/buscapagina\?/i) > -1) {
          url = preg.exec(content);
          return false;
        }
      });

      if (typeof (url) !== "undefined" && typeof (url[0]) !== "undefined") {
        return url[0];
      } else {
        log("Search Page URL not found.\n Try adding the .js file at the end of the document. \n[Method: getSearchUrl]");
        return "";
      }
    },
    // ---------- getSearchUrl ---------------------------
    infinitScroll: function () {
      var elementPages, pages, currentStatus, tmp;

      elementPages = body.find(".pager:first").attr("id");
      tmp = (elementPages || "").split("_").pop();
      pages = (null !== options.pageLimit) ? options.pageLimit : window["pagecount_" + tmp];
      currentStatus = true;

      // Reportando erros
      // if("undefined"===typeof pages) log("Não foi possível localizar quantidade de páginas.\n Tente adicionar o .js ao final da página. \n[Método: infinitScroll]");

      if ("undefined" === typeof pages)
        pages = 99999999;

        _window.bind('scroll', function () {

        var _this = jQuery(this);
        if (!animatingFilter && currentPage <= pages && moreResults && options.authorizeScroll(ajaxCallbackObj)) {

          if ((_this.scrollTop() + _this.height()) >= (options.getShelfHeight(loadContentE)) && currentStatus) {

            // var currentItems = loadContentE.find(options.shelfClass).filter(":last");
            //Select what container is available to receive the products
            var currentItems = loadContentE;
            if (loadContentE.find(options.shelfClass).length > 0) currentItems = loadContentE.find(options.shelfClass);

            // Lock Filters
            filtersFullWrapperE.addClass("locked");
            if (smartFiltersWrapperE.length > 0) {
              smartFiltersWrapperE.find('.filter-group').addClass("locked");
            }

            // Mobile, Applying Filters (This must be remove)
            jQuery('#filters .mobile-wrapper .info span').addClass("show");

            currentItems.after(elemLoading);
            currentStatus = false;

            pageJqxhr = jQuery.ajax({
              url: fn.getUrl(true),
              success: function (data) {
                if (data.trim().length < 1) {

                  moreResults = false;
                  log("No more resultas after page " + (currentPage - 1), "Warning");

                } else {
                  // currentItems.after(data);

                  // Remove Beginnings 
                  data = data.replace(_mergeRegexObject, '');

                  // Remove Endings
                  data = data.replace('</div></body></html>', '');

                  // Put the isolated items on the wrapper
                  currentItems.append(data);

                }

                currentStatus = true;
                elemLoading.remove();

                // Lock Filters
                filtersFullWrapperE.removeClass("locked");
                if (smartFiltersWrapperE.length > 0) {
                  smartFiltersWrapperE.find('.filter-group').removeClass("locked");
                }

                // Mobile, Applying Filters (This must be removed)
                jQuery('#filters .mobile-wrapper .info span').removeClass("show");

                ajaxCallbackObj.requests++;
                options.ajaxCallback(ajaxCallbackObj);
              }
            });
            currentPage++;
          }
        } else
          return false;
      });

    }
    // ---------- infinitScroll ---------------------------
  };

  if (null !== options.searchUrl)
    currentSearchUrl = searchUrl = options.searchUrl;
  else
    currentSearchUrl = searchUrl = fn.getSearchUrl();

  // Error handling
  if ($this.length < 1) {
    log("No filters options found", "Warning");
    if (options.showLinks) jQuery(options.linksMenu).css("visibility", "visible").show(0);
    fn.infinitScroll();
    return $this;
  }

  if (loadContentE.length < 1) {
    log("Results container Element not found \n (" + loadContentE.selector + ")");
    return false;
  }

  if (filtersMenuE.length < 1) log("Filters menu not found \n (" + filtersMenuE.selector + ")");
  // Error Handling ============================================================

  var currentUrl = document.location.href,
    linksMenuE = jQuery(options.linksMenu),
    prodOverlay = jQuery('<div class="vtexSr-overlay"></div>'),
    departamentE = jQuery(options.menuDepartament),
    loadContentOffset = loadContentE.offset(),
    pageNumber = 1,
    shelfJqxhr = null,
    pageJqxhr = null;

  options.emptySearchElem.append(options.emptySearchMsg);
  loadContentE.before(prodOverlay);

  var fns = {
    exec: function () {
      fns.fieldsetFormat();

      $this.each(function () {

        var _this = jQuery(this),
          label = _this.parent();

        if (_this.is(":checked")) {
          urlFilters += "&" + (_this.attr("rel") || "");
          label.addClass("sr_selected");
        }

        fns.adjustText(_this);

        //label.append('<span class="sr_box"></span><span class="sr_box2"></span>');

        _this.bind("change", function () {

          fns.inputAction(_this);
          if (_this.is(":checked"))
            fns.addFilter(_this);
          else
            fns.removeFilter(_this);
          ajaxCallbackObj.filters = $this.filter(":checked").length;

          fns.evaluateNextSmartFilter();

        });

      });

      if (smartFiltersWrapperE.length > 0) {

        //Avoids Bubbling
        jQuery('#filters fieldset label').click(function (e) {
          e.stopPropagation();
        });

        smartFiltersWrapperE.find('a').each(function () {

          jQuery(this).click(function (e) {

            e.preventDefault();

            var fiterToApply = '.' + jQuery(this).data('filter');
            jQuery(fiterToApply).trigger("click");

          });

        });

        jQuery('.filter-group').eq(0).addClass('open');

      } // If SmartFilters

      if ("" !== urlFilters)
        fns.addFilter($empty);
    },
    evaluateNextSmartFilter: function () {

      // Evaluate current Filter without the Clear or Order fieldsets
      var currentFilterGroup = filtersMenuE.find('fieldset:not(".clear-filters-link, .orderBy")').not(':has(.sr_selected)').first().attr('class');

      if (currentFilterGroup) {
        // Clean current Filter Group Class
        currentFilterGroup = currentFilterGroup
          .replace('refino', '')
          .replace('even', '')
          .replace('Características', '')
          .replace('open', '')
          .replace(/\s/g, '');

        // Convert to class
        currentFilterGroup = '.' + currentFilterGroup;
        currentFilterGroup = currentFilterGroup
          .replace(/[[]/g, '')
          .replace(/]/g, '_');

        //console.log('[evaluateNextSmartFilter] - ', currentFilterGroup);

        // Close all filters and open the first available
        smartFiltersWrapperE.find('.filter-group').removeClass('open');
        smartFiltersWrapperE.find(currentFilterGroup).addClass('open');

      } else {
        // if there are no more free filters, hideall
        smartFiltersWrapperE.find('.filter-group').removeClass('open');
      }

    },
    mergeMenu: function () {
      if (!options.mergeMenu) return false;

      var elem = departamentE;
      elem.insertAfter(options.insertMenuAfter);
      fns.departamentMenuFormat(elem);
    },
    mergeMenuList: function () {
      var i = 0;
      filtersMenuE.find("h3,h4").each(function () {
        var ul = linksMenuE.find("h3,h4").eq(i).next("ul");
        ul.insertAfter(jQuery(this));
        fns.departamentMenuFormat(ul);
        i++;
      });
    },
    departamentMenuFormat: function (elem) {
      elem.find("a").each(function () {
        var a = jQuery(this);
        a.text(fns.removeCounter(a.text()));
      });
    },
    fieldsetFormat: function () {

      var smartFiltersTemplateCollection = new Array(),
        noFieldOrderBase = 99;

      labelCallbackData.fieldsetCount = 0;
      labelCallbackData.tmpCurrentLabel = {};

      // Checks for Specific order given by Filter Name
      // Cleans it, and applies a FlexBox Order.
      function getFieldOrder(fieldTitle) {
        var fieldOrder = fieldTitle.text().match(/\[([^)]+)\]/);
        if (fieldOrder != null) {
          fieldTitle.text(fieldTitle.text().replace(/\[.*?\]/g, ''));
          fieldTitle.parent().css('order', fieldOrder[1]);
          return fieldOrder[1];
        } else {
          fieldTitle.parent().css('order', noFieldOrderBase.toString());
          noFieldOrderBase++;
          return (noFieldOrderBase - 1);
        }
      }

      filtersMenuE.find("fieldset").each(function () {

        var $t = jQuery(this),
          label = $t.find("label"),
          currentFieldOrder = getFieldOrder($t.find("h5:first")),
          fieldsetClass = ($t.find("h5:first").text() || "")
            .toLowerCase()
            .replaceSpecialChars()
            .replace(/\s/g, "-")
            .replace(/[[]/g, '')
            .replace(/]/g, '_')
            .replace(/[0-9]/g, ''),
          smartFiltersTemplate;

        // Set Field Order
        fieldsetClass = "filtro_" + currentFieldOrder + "_" + fieldsetClass;


        labelCallbackData[fieldsetClass] = {};

        // Hide fieldset when there's no filter and exit this method
        if (label.length < 1) {
          $t.hide();
          return;
        }

        if (smartFiltersWrapperE.length > 0) {
          smartFiltersTemplate = '<div class="filter-group ' + fieldsetClass + '">' +
            '<h3>SELECCIONÁ ' + $t.find("h5:first").text() + ':</h3>' +
            '<div class="wrapper">';
        }

        // Remove EVEN filter class
        $t.removeClass('even');

        // Add Fieldset filter class
        $t.addClass(fieldsetClass);

        //Insert quantity holder
        if (options.showAppliedFilters) {
          $t.find('h5').html($t.find('h5').html() + '<b></b>');
        }

        // Add Class & Title for each Filter
        label.each(function (ndx) {

          var t = jQuery(this),
            v = (t.find("input").val() || ""),
            //labelClass = "sr_" + v.toLowerCase().replaceSpecialChars().replace(/\s/g, "-");
            // Added replacer to avoid special characters suchas [,],/,!,?, etc.
            labelClass = "sr_" + v.toLowerCase().replaceSpecialChars().replace(/\s/g, "-").replace(/[^a-zA-Z0-9]/g, '_');

          if (
            Boolean(fieldsetClass.match(/preco/)) === true ||
            Boolean(fieldsetClass.match(/precio/)) === true
          ) {
            labelClass = labelClass.replace(/[.[\]]/g, '');
          }

          if (!options.showFiltersQty) {
            var tempInputE = t.find("input");
            t.text(t.text().replace(/ *\([^)]*\) */g, ''));
            t.prepend(tempInputE);
          }

          labelCallbackData.tmpCurrentLabel = {
            fieldsetParent: [$t, fieldsetClass],
            elem: t
          };

          labelCallbackData[fieldsetClass][ndx.toString()] = {
            className: labelClass,
            title: v
          };

          t.addClass(labelClass).attr({
            "title": v,
            "index": ndx
          });

          if (smartFiltersWrapperE.length > 0) {
            smartFiltersTemplate += '<a href="#" data-filter="' + labelClass + '">' + v + '</a>';
          }

          options.labelCallback(labelCallbackData);

        }); // Label Each

        if (smartFiltersWrapperE.length > 0) {
          smartFiltersTemplate += '</div><!-- wrapper -->' +
            '</div><!-- Filter group -->';
        }

        if (smartFiltersWrapperE.length > 0) {
          smartFiltersTemplateCollection[currentFieldOrder] = smartFiltersTemplate;
        }

        labelCallbackData.fieldsetCount++;

        // Show rendered fieldset
        $t.css('opacity', 1);

      }); // FieldSet Each

      // Inyect Smart Filters
      if (smartFiltersWrapperE.length > 0) {
        for (i = 0; i < smartFiltersTemplateCollection.length; i++) {
          smartFiltersWrapperE.append(smartFiltersTemplateCollection[i]);
        }
      }

      // Sort Filters
      function sortMe(a, b) {
        return a.className > b.className;
      }

      jQuery(function () {
        var elem = filtersMenuE.find('fieldset').sort(sortMe);
        filtersMenuE.append(elem);
      });

      // Forge Custom OrderBy
      if (orderByToCustom) {

        var orderByOriginalE = jQuery('.sub .orderBy').first(),
          orderByCustomTemplate = '<fieldset class="orderBy" style="order: ' + noFieldOrderBase + '; opacity: 1;">';
        noFieldOrderBase++;

        //Get first option as the title
        orderByCustomTemplate += '<h5>' + orderByOriginalE.find('option:first').text() + '<b></b></h5><div>';

        //Format every Option
        orderByOriginalE.find('option:not(:first)').each(function () {

          var currentOptionE = jQuery(this),
            currentOptionTemplate = '<label class="' + currentOptionE.val() + '">';

          currentOptionTemplate += '<input rel="' + currentOptionE.val() + '" ';
          currentOptionTemplate += 'class="multi-search-checkbox order" type="checkbox" ';
          currentOptionTemplate += 'name="' + currentOptionE.text().replace(/\s/g, "+") + '" value="' + currentOptionE.text() + '" />';
          currentOptionTemplate += currentOptionE.text() + '</label>';

          orderByCustomTemplate += currentOptionTemplate;

        });

        orderByCustomTemplate += '</div></fieldset>';

        orderByCustomPlace.append(jQuery(orderByCustomTemplate));

        //Forge filter Actions
        orderByCustomPlace.find("input[type='checkbox']").each(function () {

          var _this = jQuery(this),
            label = _this.parent();

          if (_this.is(":checked")) {
            urlFilters += "&O=" + (_this.attr("rel") || "");
            label.addClass("sr_selected");
          }

          _this.bind("change", function () {

            fns.inputAction(_this);
            if (_this.is(":checked"))
              fns.addFilter(_this);
            else
              fns.removeFilter(_this);

            ajaxCallbackObj.filters = $this.filter(":checked").length;

            fns.evaluateNextSmartFilter();

          });

        });

      }// if Custom orderBY

      //Insert Clear Filters Button
      if (options.clearFiltersLink) {

        var tempClearE = '<fieldset class="clear-filters-link" style="order: ' + noFieldOrderBase + ';">';
        tempClearE += '<a href="#">' + options.clearFiltersLinkText + '</a>';
        tempClearE += '</fieldset>';

        if (options.clearFiltersLinkPlace != null) {
          jQuery(options.clearFiltersLinkPlace).append(tempClearE);
        } else {
          filtersMenuE.append(tempClearE);
        }

        jQuery('.clear-filters-link a').click(function (e) {
          e.preventDefault();
          filtersFullWrapperE.find('input:checked').click();
          if (options.showAppliedFiltersTags) {
            jQuery(options.showAppliedFiltersTags).find('.filter-tag').remove();
          }
        });

      }

    }, // fieldsetFormat()
    inputAction: function (_this) {
      if (null !== pageJqxhr) pageJqxhr.abort();
      if (null !== shelfJqxhr) shelfJqxhr.abort();
      currentPage = 2;
      moreResults = true;
    },
    addFilter: function (input) {
      if (input.hasClass('order')) {
        jQuery(options.orderByCustomPlace + ' .orderBy input:checked').click();
        urlFilters += "&O=" + (input.attr("rel") || "");
      } else {
        urlFilters += "&" + (input.attr("rel") || "");
      }

      prodOverlay.fadeTo(300, 0.6);
      // Lock Filters
      filtersFullWrapperE.addClass("locked");
      if (smartFiltersWrapperE.length > 0) {
        smartFiltersWrapperE.find('.filter-group').addClass("locked");
      }

      // Mobile, Applying Filters
      jQuery('#filters .mobile-wrapper .info span').addClass("show");

      currentSearchUrl = fn.getUrl();
      shelfJqxhr = jQuery.ajax({
        url: currentSearchUrl,
        success: fns.filterAjaxSuccess,
        error: fns.filterAjaxError
      });
      input.parent().addClass("sr_selected");

      // Create and Insert a Filter Tag to remove the filter
      if (options.showAppliedFiltersTags) {
        var currentTagId = input.parent().prop('classList')[0],
          appliedFilterTagTemplate = '<a href="#" id="' +
            currentTagId +
            '" class="filter-tag" alt="' +
            input.parent().text().toLowerCase() + '">' +
            input.parent().text().toLowerCase() + '</a>';

        jQuery(options.showAppliedFiltersTags).prepend(appliedFilterTagTemplate);
        jQuery(options.showAppliedFiltersTags).find('#' + currentTagId).click(function (e) {
          e.preventDefault();
          filtersFullWrapperE.find('.' + currentTagId).click();
          jQuery(this).remove();
        });
      }

      // Puts the current applied filters on the Title
      if (input.closest('fieldset').find('input:checked').length > 0) {
        input.closest('div').siblings('h5').find('b').text(input.closest('fieldset').find('input:checked').length);
        //If Clear Links is active, show it when filters are apllied
        if (options.clearFiltersLink) {
          jQuery('.clear-filters-link').addClass('active');
        }
      }

      // Fire Filter Metric
      if (trackGTM) {
        dataLayer.push({
          'event': 'trackEvent',
          'eventCategory': 'grilla-productos',
          'eventAction': 'filtro-' + input.parents('fieldset').find('h5').text().toLowerCase().replaceSpecialChars().replace(/\s/g, "-"),
          'eventLabel': input.val().toLowerCase().replaceSpecialChars().replace(/\s/g, "-")
        });
      }

    },
    removeFilter: function (input) {

      if (input.hasClass('order')) {
        var url = "O=" + (input.attr("rel") || "");
      } else {
        var url = (input.attr("rel") || "");
      }

      prodOverlay.fadeTo(300, 0.6);
      // Lock Filters
      filtersFullWrapperE.addClass("locked");
      if (smartFiltersWrapperE.length > 0) {
        smartFiltersWrapperE.find('.filter-group').addClass("locked");
      }
      // Mobile, Applying Filters
      jQuery('#filters .mobile-wrapper .info span').addClass("show");

      if (url !== "") urlFilters = urlFilters.replace("&" + url, "");

      currentSearchUrl = fn.getUrl();
      shelfJqxhr = jQuery.ajax({
        url: currentSearchUrl,
        success: fns.filterAjaxSuccess,
        error: fns.filterAjaxError
      });

      input.parent().removeClass("sr_selected");

      // Remove the current filters or clear the number
      if (input.closest('fieldset').find('input:checked').length > 0) {
        input.closest('div').siblings('h5').find('b').text(input.closest('fieldset').find('input:checked').length);
      } else {
        input.closest('div').siblings('h5').find('b').text('');
        //If Clear Links is active, hide it when no filters are apllied
        if (options.clearFiltersLink) {
          jQuery('.clear-filters-link').removeClass('active');
        }
      }

      // Remove the applied Tags
      if (options.showAppliedFiltersTags) {
        var currentTagId = input.parent().prop('classList')[0];
        jQuery(options.showAppliedFiltersTags).find('#' + currentTagId).remove();
      }

    },
    filterAjaxSuccess: function (data) {
      var $data = jQuery(data);

      prodOverlay.fadeTo(300, 0, function () {
        jQuery(this).hide();
      });
      // Unlock Filters
      filtersFullWrapperE.removeClass("locked");
      if (smartFiltersWrapperE.length > 0) {
        smartFiltersWrapperE.find('.filter-group').removeClass("locked");
      }
      // Mobile, Applying Filters
      jQuery('#filters .mobile-wrapper .info span').removeClass("show");

      fns.updateContent($data, data);
      ajaxCallbackObj.requests++;
      options.ajaxCallback(ajaxCallbackObj);
    },
    filterAjaxError: function () {
      prodOverlay.fadeTo(300, 0, function () {
        jQuery(this).hide();
      });
      // Unlock Filters
      filtersFullWrapperE.removeClass("locked");
      if (smartFiltersWrapperE.length > 0) {
        smartFiltersWrapperE.find('.filter-group').removeClass("locked");
      }

      /* alert(options.filterErrorMsg); */
      log("There was an error on the filtered Ajax call.");
    },
    updateContent: function ($data, response) {
      animatingFilter = true;
      if (!options.authorizeUpdate(ajaxCallbackObj)) return false;

      var shelf = $data.filter(options.shelfClass);
      var shelfPage = loadContentE.find(options.shelfClass);

      //Clean Previous Shelf & Empty Search Msg
      jQuery(shelfPage).remove();
      options.emptySearchElem.remove();

      //Fill the Shelf if there's products
      if (shelf.length > 0) {
        // We keep the Shelf var to ensure functionality
        // but the full response is used for content as in
        // the infinitScroll.
        // loadContentE.append(shelf); // Original Results

        // Remove Beginnings 
        response = response.replace(_mergeRegexObject, '');

        // Remove Endings
        response = response.replace('</div></body></html>', '');

        // Cleans previous results
        //loadContentE.find('ul').remove();
        loadContentE.empty();

        // Put the isolated items on the wrapper
        loadContentE.append(response);

        options.shelfCallback();
        // shelf.slideDown(600, function() {
        animatingFilter = false;
        // });
        ajaxCallbackObj.isEmpty = false;
      } else {
        ajaxCallbackObj.isEmpty = true;

        loadContentE.empty();
        loadContentE.append(options.emptySearchElem);
        options.emptySearchElem.addClass('loaded');

        options.emptySearchCallback(ajaxCallbackObj);
      }

    },
    adjustText: function (input) {
      var label = input.parent(),
        text = label.text();
      qtt = "";

      // Removes Product Quantity from the Name
      // text = fns.removeCounter(text);

      label.text(text).prepend(input);
    },
    removeCounter: function (text) {
      return text.replace(/\([0-9]+\)/ig, function (a) {
        qtt = a.replace(/\(|\)/, "");
        return "";
      });
    },
    setFilterMenu: function () {
      if (filtersMenuE.length > 0) {
        linksMenuE.hide();
        filtersMenuE.show();
      }
    }
  };

  fns.exec();
  fn.infinitScroll();
  options.callback();  
};
