jQuery(function($) {

  // prepare data
  let pullpage = 0; // starts onload
  let pullflag = true;

  function getPostData() {

    if (pullflag) {

        pullflag = false;
        pullpage++;

        let type = 'post';
        let tax =  'category'; // $('#loopcontainer').data('taxname');
        let terms = { 0 : 'blog', 1 : 'nieuws' }; // cat or sub cat
        let tags = { 0 : 'planet', 1 : 'world'};
        let orderby = 'post_date';//$('#loopcontainer').attr('data-orderby');
        let order = 'DESC'; //$('#loopcontainer').attr('data-order');
        let amount = 1;// $('#loopcontainer').data('ppp');

        if( $('body .wpajaxbundle.button').parent().find('.container').data('taxterms').length > 0 ){
          let txt = $('body .wpajaxbundle.button').parent().find('.container').data('taxterms').split(',');
          terms = txt;
        }
        if( $('body .wpajaxbundle.button').parent().find('.container').data('tags').length > 0 ){
          let tgs = $('body .wpajaxbundle.button').parent().find('.container').data('tags').split(',');
          tags = tgs;
        }

        jQuery.ajax({
          type: "POST",
          url: ajax.url,
          data: {
            nonce: ajax.nonce,
            action: 'getPostDataWP',
            dataType: 'json', // Choosing a JSON datatype
            data: {
                'posttype': type,
                'taxname': tax,
                'termlist': terms,
                'taglist': tags,
                'orderby': orderby,
                'order': order,
                'ppp': amount,
                'page': pullpage
            }
          },

          success: function(response) {
            console.log(response ); // JSON.stringify(response)
          },
          error: function(XMLHttpRequest, textStatus, errorThrown) {
            //Error
          },
          timeout: 60000
        });
        return false;
    }

  }

  $('body').on( 'click', '.wpajaxbundle.button', function(){
    getPostData();
  });


});
