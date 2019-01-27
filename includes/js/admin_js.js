jQuery(document).ready(function(){

  jQuery('#posts_pdf').on('change', function() {
    //alert( this.value );
    jQuery('#pdfId').html(this.value);
  });

  jQuery('#zoom_pdf').on('change', function() {
    //alert( this.value );
    jQuery('#zoomId').html(this.value);
  });
  

  jQuery('#thumbnails_pdf').on('change', function() {
    //alert( this.value );
    jQuery('#thumbnailsid').html(this.value);
  });

  jQuery('#classes_pdf').on('keyup', function() {
    //alert( this.value );
    jQuery('#classesid').html(this.value);
  });

  jQuery('#slide_pdf').on('change', function() {
    //alert( this.value );
    jQuery('#slideid').html(this.value);
  });


  jQuery('#flipping_pdf').on('change', function() {
    //alert( this.value );
    jQuery('#flippingid').html(this.value);
  });
  
});

function selectText(containerid) {
  if (document.selection) { // IE
      var range = document.body.createTextRange();
      range.moveToElementText(document.getElementById(containerid));
      range.select();
  } else if (window.getSelection) {
      var range = document.createRange();
      range.selectNode(document.getElementById(containerid));
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
  }
  console.log('Shortcode is selected');
}