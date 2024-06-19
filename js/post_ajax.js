jQuery(function ($) {



  let pullpage = 0; // starts onload
  let pullflag = true;
  let pullend = false;
  let reqvars;

  // prepare an object with default request variables
  let data_args_default = {
    'posttype': 'post',
    'display': '',
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

  // create fullcalendar for events https://jsfiddle.net/webbouwer/nq03sr8x/18/


  function doRequestData() {


    if ($('#wpajaxbundle').length > 0) {

      // request arguments
      var data = $('#wpajaxbundle').data();

      //console.log(data);
      reqvars = {
        'posttype': 'post',
        'display': '',
        'tax1': '', // category
        'terms1': '', // uncategorized { 0: 'blog', 1: 'nieuws'},
        'tax2': '', //'post_tag',
        'terms2': '', //{ 0: 'planet', 1: 'universe'},
        'relation': '', // AND
        'orderby': 'post_date',
        'order': 'ASC',
        'ppp': 2
      };

      if (data.posttype != '') {
        // reqvars.posttype = data.posttype; 
        // replaced with object request for multiple posttype 
        let posttypevars = {};
        if (/[,]/.test(data.posttype)) {
          let arr = data.posttype.split(',');
          $.each(arr, function (r, v) {
            posttypevars[r] = v;
          });
          reqvars.posttype = posttypevars;
        } else {
          posttypevars = { "0": data.posttype };
          reqvars.posttype = posttypevars;
        }
      }

      if (data.tax1 != '') {
        reqvars.tax1 = data.tax1;
      }
      if (data.terms1 != '') {
        let obj = {};
        if (/[,]/.test(data.terms1)) {
          let arr = data.terms1.split(',');
          $.each(arr, function (r, v) {
            obj[r] = v;
          });
          reqvars.terms1 = obj;
        } else {
          obj = { "0": data.terms1 };
          reqvars.terms1 = obj;
        }
      }
      if (data.tax2 != '') {
        reqvars.tax2 = data.tax2;
      }
      if (data.terms2 != '') {
        let obj = {};
        if (/[,]/.test(data.terms2)) {
          let arr = data.terms2.split(',');
          $.each(arr, function (r, v) {
            obj[r] = v;
          });
          reqvars.terms2 = obj;
        } else {
          obj = { "0": data.terms2 };
          reqvars.terms2 = obj;
        }
      }
      if (data.relation != '') {
        reqvars.relation = data.relation;
      }
      if (data.orderby != '') {
        reqvars.orderby = data.orderby;
      }
      if (data.order != '') {
        reqvars.order = data.order;
      }
      if (data.ppp != '') {
        reqvars.ppp = data.ppp;
      }

      if (data.display != '') {
        reqvars.display = data.display;
      }

      //alert(JSON.stringify(reqvars));
      getPostData(reqvars);

    }

  }

  // prepare data pull
  function getPostData(args = false) {
    let reqdata = data_args_default; // set default variables
    if (pullflag) { // if no requests active
      pullflag = false;
      pullpage++;
      reqdata['page'] = pullpage; // set query pagenumber
      if (args) { // args from the trigger function (load/button/scroll)
        for (const key in data_args_default) {
          if (args[key]) {
            reqdata[key] = args[key]; // replace default variables
          }
        }
      }
      getPosts(reqdata);  //console.log( reqdata );
    }
  }
  // pull data
  function getPosts(args) {

    jQuery.ajax({
      type: "POST",
      url: ajax.url,
      data: {
        nonce: ajax.nonce,
        action: 'getWPPostData',
        dataType: 'json', // Choosing a JSON datatype
        data: args
      },
      success: function (response) {
        //console.log( JSON.stringify(args) );
        setPostsHTML(response); // JSON.stringify(response)
        if ($('.wpajaxbundle.loader').length > 0) {
          $('.wpajaxbundle.loader').fadeOut();
        }

        if (response.length >= args.ppp) {
          pullflag = true; // if ppp count result wait for pull again
        } else {
          pullend = true; // if all results no pull again
        }
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        console.log(textStatus); //Error
      },
      timeout: 6000
    });
    return false;
  }

  // response to html
  function setPostsHTML(result) {

    // eventlist holder
    var calEvents = []; // if event-type create list for calendar view

    $.each(result, function (idx, post) { //console.log(JSON.stringify(post));

      // add event to eventlist 
      if (post.type == 'event' && post.custom_field_values['event-start-date'].length > 0) {
        //https://fullcalendar.io/docs/event-object
        //https://fullcalendar.io/docs/eventDisplay
        // build event object 
        var event = {
          id: post.id,
          title: post.title,
          'event-summary': post.excerpt,
          content: post.content,
          imgurl: post.imgurl,
          showendtime: post.custom_field_values["event-hide-end-time"],
          allDay: post.custom_field_values["event-all-day"],
          location: post.custom_field_values["event-location"],
          link: post.custom_field_values["event-link"],
          linktext: post.custom_field_values["event-link-label"],
          linktarget: post.custom_field_values["event-link-target"],
          linktitle: post.custom_field_values["event-link-title"],
          linkimg: post.custom_field_values["event-link-image"],
          imgthumbid: post.custom_field_values["_thumbnail_id"],
          //backgroundColor: 'green',
        };
        // add filtered/retrieved variables
        event['start']  = stampToGMTdateString(post.custom_field_values['event-start-date']);
        //'2024-06-19T10:30:00', //end: end_gmt, //'2024-06-20T12:30:00' 
        if (post.custom_field_values['event-date'] != '') {
          event['end']  = stampToGMTdateString(post.custom_field_values['event-date']);
        }
        event['url'] = post.link;
        calEvents[idx] = event;

      } else { // post list

        let t = 0; // timer for smooth slowed-down slide-in
        let objfilterclasses = 'item';
        let obj = $('<div id="post-' + post.id + '"></div>');
        obj.attr('data-tags', post.tags.toString());
        obj.attr('data-cats', post.cats.toString());

        $(post.tags).each(function (x, tag) {
          objfilterclasses += ' ' + tag;
        });
        obj.attr('class', objfilterclasses);

        let title = $('<h2><a href="' + post.link + '">' + post.title + '</a></h2>');
        obj.append(title);
        let content = $('<div class="content">' + post.excerpt + '</div>');
        if (post.display != 'excerpt') {
          content = $('<div class="excerpt">' + post.content + '</div>');
        }
        obj.append(content);
        let cats = $('<div class="cats" />');
        for (c = 0; c < post.cats.length; c++) {
          cats.append('<span>' + post.cats[c]) + '</span>';
        }
        obj.append(cats);
        let tags = $('<div class="tags" />');
        for (s = 0; s < post.tags.length; s++) {
          tags.append('<span>' + post.tags[s]) + '</span>';
        }
        obj.append(tags);
        obj.hide(); // slowed-down slide-in
        $('body').find('.wpajaxbundle .itemcontainer').append(obj);

        // slowed-down slide-in
        setTimeout(function () {
          obj.slideDown(300);
        }, t);
        t = (t + 50);

        if ($('#wpajaxbundle').data('load') == 'all') {
          /* repeat ppp load automaticaly untill all is loaded  */
          setTimeout(function () {
            doRequestData();
          }, 100);
        }
      } // end regular post

    });

    // create fullcalendar for events 
    if (calEvents.length > 0) {
      setCalendar(calEvents);
    }

    // hide button if less data then page amount found
    if (result.length < reqvars.ppp && $('.wpajaxbundle.button').length > 0) {
      $('.wpajaxbundle.button').hide();
    }
    // trigger after (ie. isotope display)
  }


  var setCalendar = function (eventlist) {

    insertHeadScriptTag('https://cdn.jsdelivr.net/npm/fullcalendar@6.1.14/index.global.min.js');
    /* test 3
    var fullcalcss = $('<style id="fullcalcss" rel="stylesheet" type="text/css" />');
    let popcss = ".popbox{position:absolute; z-index:999999;display:none; width:300px; min-height:120px; max-height:380px; left:30%; top:38%;overflow:auto; background-color:green; border-radius:8px;}";
    fullcalcss.append(popcss);
    $('head').append(fullcalcss);
*/
    $('#wpajaxbundle').prepend('<div id="calendar" style="position:relative;"></div>');
     /*     showendtime: post.custom_field_values["event-hide-end-time"],
          allDay: post.custom_field_values["event-all-day"],
          location: post.custom_field_values["event-location"],
          link: post.custom_field_values["event-link"],
          linktext: post.custom_field_values["event-link-label"],
          linktarget: post.custom_field_values["event-link-target"],
          linktitle: post.custom_field_values["event-link-title"],
          linkimg: post.custom_field_values["event-link-image"],
          imgthumbid: post.custom_field_values["_thumbnail_id"],*/
          
    /* test 3
    let pophtml = '<div id="fullCalModal" style="display:none;">'
    +'<div>ID: <span id="modalID"></span></div>'
    +'<div>Title: <span id="modalTitle"></span></div>'
    +'<div>Start Date: <span id="modalStartDate"></span></div>'
    +'<div>End Date: <span id="modalEndDate"></span></div>'
    +'</div>';
    $('#wpajaxbundle').prepend( pophtml );
    */


    //var popstyle = 'position:absolute; z-index:999999;display:none; width:300px; min-height:120px; max-height:380px; left:30%; top:38%;overflow:auto; background-color:green; border-radius:8px;';
    $('#calendar').prepend('<div class="popbox"><div class="close"><span>×</span></div></div>');

    var calendarEl = $('body').find('#calendar');

    $('#calendar .popbox .close').click(function (event) {
      $('#calendar .popbox').removeClass('active').fadeOut();

    });

    $('#calendar .popbox').on('mouseleave', function (event) {

      $('#calendar .popbox').removeClass('active');
      setTimeout(function () {
        if (!$('#calendar .popbox').hasClass('active')) {
          $('#calendar .popbox').fadeOut();
        }
      }, 900);

    });

    $('#calendar .popbox').on('mouseenter', function (event) {
      if (!$('#calendar .popbox').hasClass('active')) {
        $('#calendar .popbox').addClass('active').show();
      }
    });


    /* test cursor follow / reposition box on outside view
    $(document).on('mousemove', function(e){
      if( e.clientX > ( $(window).width() - $('.popbox').width() )){
        //$('.floatbox.display').addClass('left');
        $('.popbox').css('left', (e.clientX - ($('.popbox').width() + 20 ) )+'px'); // epageX
      }else{
        $('.popbox').css('left', (e.clientX+20)+'px');
      }
      if( e.clientY > ( $(window).height() - $('.popbox').height() )){
        $('.popbox').css('top', (e.clientY - ( $('.popbox').height() - 20 ) )+'px');
      }else{
        $('.popbox').css('top',  (e.clientY+20)+'px');
      }
      //$('.floatbox.display').css('top',  (e.clientY+20)+'px'); // e.pageY
      //$('.floatbox.display').css('left', (e.clientX+20)+'px'); // epageX
    });
    */

    var calendar = new FullCalendar.Calendar(calendarEl, {
      header: {
        left: 'title',
        right: 'today', // 'month,agendaWeek,agendaDay',
        center: 'prev,next',
      },
      theme: 'standard',
      timeZone: 'UTC',
      firstDay: '1',
      initialView: 'multiMonthYear', //dayGridMonth
      multiMonthMaxColumns: 2,
      events: eventlist,
      /* test 3
      eventClick: function(eventObj, jsEvent, view) {
        
        
        $('#modalID').html(eventObj.id);
        $('#modalTitle').html(eventObj.title);
        //$('#modalLocation').html(eventObj.extendedProps.location);
        $('#modalStartDate').html(eventObj.start);
        if(eventObj.end != ''){
          $('#modalEndDate').html(eventObj.end);
        }
        $('#fullCalModal').insertBefore(jsEvent.currentTarget).fadeIn(); //changed just for demo purposes
  
        return false;
      },
      */
      // test 2
      eventClick: function (eventObj, jsEvent, view) {
        if (eventObj.url) {

          console.log(jsEvent);
          // set popbox
          //let boxLeft =  jsEvent.clientX+ "px";//jsEvent.clientX - jsEvent.offsetLeft + "px";//(jsEvent.clientY-80)+'px';
          //let boxTop = jsEvent.clientY+ "px";//jsEvent.clientY - jsEvent.offsetTop + "px";//(jsEvent.clientX-180)+'px';
          // set content
          $('#wpajaxbundle .popbox').find('.innerwrap').remove();
          let img = '';
          if (eventObj.imgurl) {
            img = '<img src="' + eventObj.imgurl + '" />';
          }
          let eventinfo = $('<div class="innerwrap"><h3>' + eventObj.title + '</h3><div>' + img + '' + eventObj.content + '</div><div>');
          $('#wpajaxbundle .popbox').append(eventinfo).fadeIn(); //.insertBefore(jsEvent.currentTarget)



          return false; //no link follow .. window.open(eventObj.url); 

        } else {
          alert('Clicked ' + eventObj.title);
        }
      },

      /* test 1
      eventClick: function(calEvent, jsEvent, view) {
        // call your javascript function to open modal or popup here
        alert('Event: ' + calEvent.title);
        alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
        alert('View: ' + view.name);
        
        // change the border color just for fun
        $(this).css('border-color', 'red');
        
         },
      */
      /*
          fetch(eventObj.url)
            .then(function (response) {
                response.text().then(function (responseText) {
                    console.log(responseText);
                    alert('Clicked ' + eventObj.title);
                });
            });
      */
    });
    calendar.render();
    //var event = { id: 1, title: 'New event', start: new Date() };
    //calendar.addEvent( event );
  }

  var insertHeadScriptTag = function (scripturl) {
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = scripturl;
    $("head").append(s);
    console.log('Fullcalendar script loaded');
  }

  var stampToGMTdateString = function (timestamp) {
    let vardate = new Date(timestamp * 1000);
    return vardate.toGMTString();
  }

  $('body').on('click', '.wpajaxbundle.button', function () {
    doRequestData();
  });

  // onscroll load more
  $(document).on('scroll', function () {
    if ($('#wpajaxbundle').length > 0 && pullend != true) {
      var container = $('#wpajaxbundle');
      var scrollHeight = $(document).height();
      var scrollPosition = $(window).height() + $(window).scrollTop();
      //if ((scrollHeight - scrollPosition) / scrollHeight <= 0.01 ) { // for full page end
      if (scrollPosition > (container.offset().top + container.height())) { // on container end
        if (!pullend) {
          if ($('.wpajaxbundle.loader').length > 0) {
            $('.wpajaxbundle.loader').fadeIn();
          }
          doRequestData();
        }
      }

    }

  });

  $(document).ready(function () {
    doRequestData();
  });

});
