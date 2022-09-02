jQuery(function($) {



  let pullpage = 0; // starts onload
  let pullflag = true;
  let pullend = false;
  let reqvars;

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
      'order': 'ASC',
      'ppp': 1,
      'page': pullpage
  };

  function doRequestData(){


    // request arguments
    var data = $('#wpajaxbundle').data();

    reqvars = {
      'posttype' : 'post',
      'tax1': 'category', //
      'terms1': 'uncategorized', //{ 0: 'blog', 1: 'nieuws'},
      'tax2': '', //'post_tag',
      'terms2': '', //{ 0: 'planet', 1: 'universe'},
      'relation' : 'AND',
      'orderby' : 'post_date',
      'order' : 'ASC',
      'ppp': 2
    };

    if( data.posttype != '' ){
      reqvars.posttype = data.posttype;
    }

    if( data.tax1 != '' ){
      reqvars.tax1 = data.tax1;
    }
    if( data.terms1 != '' ){
      let obj = {};
      if(/[,]/.test(data.terms1)){
        let arr = data.terms1.split(',');
        $.each(arr, function( r, v){
          obj[r] = v;
        });
        reqvars.terms1 = obj;
      }else{
        obj = { "0" : data.terms1 };
        reqvars.terms1 = obj;
      }
    }
    if( data.tax2!= '' ){
      reqvars.tax2 = data.tax2;
    }
    if( data.terms2 != '' ){
      let obj = {};
      if(/[,]/.test(data.terms2)){
        let arr = data.terms2.split(',');
        $.each(arr, function( r, v){
          obj[r] = v;
        });
        reqvars.terms2 = obj;
      }else{
        obj = { "0" : data.terms2 };
        reqvars.terms2 = obj;
      }
    }
    if( data.relation != '' ){
      reqvars.relation = data.relation;
    }
    if( data.orderby != '' ){
      reqvars.orderby = data.orderby;
    }
    if( data.order != '' ){
      reqvars.order = data.order;
    }
    if( data.ppp != '' ){
      reqvars.ppp = data.ppp;
    }

    //alert(JSON.stringify(reqvars));
    getPostData(reqvars);

  }



  function getPostData( args = false ) {


    let reqdata = data_args_default; // set default variables

    if (pullflag) { // if no requests active
        pullflag = false;
        pullpage++;

        reqdata['page'] = pullpage; // set query pagenumber
        if(args){ // args from the trigger function (load/button/scroll)
          for (const key in data_args_default) {
              if( args[key] ) {
                reqdata[key] = args[key]; // replace default variables
              }
          }
        }
        getPosts( reqdata );
        //console.log( reqdata );
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

        //alert( JSON.stringify(args) );
        setPostsHTML( response ); // JSON.stringify(response)
        if (response.length >= args.ppp) {
          pullflag = true; // if ppp count result wait for pull again
        }else{
          pullend = true; // if all results no pull again
        }
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        //Error
      },
      timeout: 6000
    });
    return false;

  }

  function setPostsHTML( result ){

    //console.log( result );
    //let t = 0; // timer for smooth slowed-down slide-in

    $.each( result, function( idx, post){

      let objfilterclasses = 'item';
      let obj = $('<div id="post-'+post.id+'"></div>');

      obj.attr('data-tags', post.tags.toString() );
      obj.attr('data-cats', post.cats.toString() );

      $(post.tags).each(function( x , tag ){
        objfilterclasses += ' '+tag;
      });

      obj.attr('class', objfilterclasses );

      let title = $('<h2><a href="'+post.link+'">'+post.title+'</a></h2>');
      obj.append(title);
      let excerpt = $('<div class="excerpt">'+post.excerpt+'</div>');
      obj.append(excerpt);

      let cats = $('<div class="cats" />');
      for(c=0;c<post.cats.length;c++){
        cats.append('<span>'+post.cats[c])+'</span>';
      }
      obj.append(cats);

      let tags = $('<div class="tags" />');
      for(s=0;s<post.tags.length;s++){
        tags.append('<span>'+post.tags[s])+'</span>';
      }
      obj.append(tags);

      $('body').find('.wpajaxbundle .container').append(obj);

      /*let obj = $('<div id="post-'+post.id+'">'+post.title+'</div>').hide();//.slideUp(300);
      $('body').find('.wpajaxbundle.button').parent().find('.container').append(obj);
      // slowed-down slide-in
      setTimeout(function(){
        obj.slideDown(300);
      },t);
      t=(t+50);*/
      if( $('#wpajaxbundle').data('load') == 'all'){
        /* repeat ppp load automaticaly untill all is loaded  */
        setTimeout(function(){
          doRequestData();
        }, 100);
      }

    });

    // hide button if less data then page amount found
    if( result.length < reqvars.ppp && $('.wpajaxbundle.button').length > 0){
      $('.wpajaxbundle.button').hide();
    }

    // trigger isotope
  }




  $('body').on( 'click', '.wpajaxbundle.button', function(){
      doRequestData();
  });

  // onscroll load more
  $(document).on('scroll', function() {
    var scrollHeight = $(document).height();
    var scrollPosition = $(window).height() + $(window).scrollTop();

    if ((scrollHeight - scrollPosition) / scrollHeight <= 0.01 ) {
      if( !pullend ){
        doRequestData();
      }
    }

  });

  $(document).ready(function(){

    doRequestData();
  });

});
