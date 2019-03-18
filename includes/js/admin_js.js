jQuery(document).ready(function(){

  let elements = ['#posts_pdf','#allow_download','#thumbnails_pdf','#classes_pdf','#slide_pdf','#flipping_pdf'];

  jQuery('#posts_pdf').on('change', function() {
    //alert( this.value );
    jQuery('#pdfId').html(this.value);
  });

  jQuery('#allow_download_selector').on('change', function() {
    //alert( this.value );
    jQuery('#allow_download').html(this.value);
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

  jQuery('#page_layout').on('change', function() {
    //alert( this.value );
    jQuery('#page_layoutid').html(this.value);
  });


  jQuery('#flipping_pdf').on('change', function() {
    //alert( this.value );
    jQuery('#flippingid').html(this.value);
  });

  
  jQuery('#container_height').on('change', function() {
    //alert( this.value );
    jQuery('#cont_heightid').html(this.value);
  });

  jQuery('#container_width').on('change', function() {
    //alert( this.value );
    jQuery('#cont_widthid').html(this.value);
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

