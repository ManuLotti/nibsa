
// Funcion para crear un Contacto
function ContactCreateContact() {
  //var storeName   = "lasmargaritas";
  var dataEntity    = "NP";

  var np_nombreapellido   = jQuery("#fancyhome #nombreApellido").val();
  var np_email    = jQuery("#fancyhome #email").val();
  
  var np_json = { 
    "nombreApellido": np_nombreapellido, 
    "email": np_email,
  };

  var urlNP = "/api/dataentities/" + dataEntity + "/documents/";

  $.ajax({
    headers: {
      "Accept": "application/vnd.vtex.ds.v10+json",
      "Content-Type": "application/json"
    },
    data: JSON.stringify(np_json),
    type: 'PATCH',
    url: urlNP,
    success: function(data, textStatus, xhr){
      console.log(data);
      if(xhr.status == "200" || xhr.status == "201"){
        //El Contacto se creo satisfactoriamente
        ResetMessages()
        jQuery("#fancyhome #np_message_success").show();
        jQuery("#fancyhome #nombreApellido").val("");
        jQuery("#fancyhome #email").val("");
      }else if(xhr.status == "304"){
        //Error 304
      }else{
        ResetMessages()
        jQuery("#fancyhome #np_message_error").show();
      }
    },
    error: function (data) {
      console.log(data);
      ResetMessages()
      jQuery("#fancyhome #np_message_error").show();
    }
  });
}

function ResetMessages() {
  jQuery("#fancyhome #np_message_loading").hide();
  jQuery("#fancyhome #np_message_validate").hide();
  jQuery("#fancyhome #np_message_success").hide();
  jQuery("#fancyhome #np_message_error").hide();
}

function FormValidateContact() {
  var isFormValidate = true;

  if(jQuery("#fancyhome #nombreApellido").val() == ""){
    isFormValidate = false;
    jQuery("#fancyhome #nombreApellido").focus();
  }

  if((isFormValidate) && (jQuery("#fancyhome #email").val() == "")){
    isFormValidate = false;
    jQuery("#fancyhome #email").focus();
  }
  
  if(isFormValidate){
    ResetMessages()
    jQuery("#fancyhome #co_message_loading").show();
    ContactCreateContact();
  }else{
    ResetMessages()
    jQuery("#fancyhome #co_message_validate").show();
  }

  return false;
}
