jQuery(function($) {

  let pullpage = 0; // starts onload
  let pullflag = true;

  // prepare an object with default request variables
  let data_args_default = {
      'posttype': 'post',
      'postid': false, // for direct post requests
      'tax1': 'category', // main taxonomy (custom), default category
      'terms1': {}, // slugs
      'relation': 'AND',
      'tax2': 'post_tag', // default post_tag
      'terms2': {}, //slugs
      'orderby': 'post_date',
      'order': 'DESC',
      'ppp': 1,
      'page': pullpage
  };

  function getPostData( args = false ) {

    let reqdata = data_args_default; // set default variables

    if (pullflag) { // if no requests active
        pullflag = false;
        pullpage++;

        reqdata['page'] = pullpage;

        if(args){ // args from the trigger function (load/button/scroll)
          for (const key in data_args_default) {
              if( args[key] ) {
                reqdata[key] = args[key]; // replace default variables
              }
          }
        }

        getPosts( reqdata );
        console.log( reqdata );

    }

  }

  function getPosts( args ){

    jQuery.ajax({
      type: "POST",
      url: ajax.url,
      data: {
        nonce: ajax.nonce,
        action: 'getWPPostData',
        dataType: 'json', // Choosing a JSON datatype
        data: args
      },
      success: function(response) {
        setPostsHTML( response ); // JSON.stringify(response)
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        //Error
      },
      timeout: 60000
    });
    pullflag = true;
    return false;

  }

  function setPostsHTML( result ){
    console.log( result );
    $.each( result, function( idx, post){
      let html = '<div id="post-'+post.id+'">'+post.title+'</div>';
      $('body').find('.wpajaxbundle.button').parent().find('.container').append(html);
    });
  }


  var reqvars;

  function collectRequestData(){

    // request arguments
    reqvars = {
      //'tax1': 'category',
      //'terms1': { 0: 'blog', 1: 'nieuws'},
      //'tax2': 'post_tag',
      'terms2': { 0: 'planet', 1: 'universe'},
      'ppp': 2
    };

  }

  $('body').on( 'click', '.wpajaxbundle.button', function(){
      collectRequestData();
      getPostData(reqvars);
  });

  // onscroll load more
  $(document).on('scroll', function() {
    var scrollHeight = $(document).height();
    var scrollPosition = $(window).height() + $(window).scrollTop();

    if ((scrollHeight - scrollPosition) / scrollHeight <= 0.01 ) {
      if( $('body').find('.wpajaxbundle.button').length > 0 ){
        collectRequestData();
        getPostData(reqvars);
      }
    }

  });

});
