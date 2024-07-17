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
        event['start'] = new Date(post.custom_field_values['event-start-date'] * 1000).toISOString();//stampToGMTdateString(post.custom_field_values['event-start-date']);
        event['startstamp'] = post.custom_field_values['event-start-date'];
        //'2024-06-19T10:30:00', //end: end_gmt, //'2024-06-20T12:30:00' 
        console.log(post.custom_field_values['event-start-date'])
        if (post.custom_field_values['event-date'] != '') {
          event['end'] = new Date(post.custom_field_values['event-date'] * 1000).toISOString();//stampToGMTdateString(post.custom_field_values['event-date']);
          event['endstamp'] = post.custom_field_values['event-date'];
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

    // create fullcalendar for events https://jsfiddle.net/webbouwer/nq03sr8x/18/
    if (calEvents.length > 0) {
      setCalendar(JSON.parse(JSON.stringify(calEvents)));
    }

    // hide button if less data then page amount found
    if (result.length < reqvars.ppp && $('.wpajaxbundle.button').length > 0) {
      $('.wpajaxbundle.button').hide();
    }
    // trigger after (ie. isotope display)
  }

  var formatAMPM = function(date) {
    var hours = date.getUTCHours();
    var minutes = date.getUTCMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm; 
    return strTime;
  }

  var setCalendar = function (eventlist) {

    $('body').find('#wpajaxbundle').prepend('<div id="calendar" style="position:relative;"></div><div class="popbox"><div class="close"><span>×</span></div></div>');
    var calendarEl = $('body').find('#calendar');
    console.log(eventlist);
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
      headerToolbar: {
        start: 'prev,next today', //'prevYear,prev,next,nextYear today',
        center: 'title',
        end: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      footerToolbar: {
        start: '', //'custom1,custom2',
        center: '',
        end: 'prev,next'
      },
      /*
      customButtons: {
        custom1: {
          text: 'custom 1',
          click: function() {
            alert('clicked custom button 1!'); 
          }
        },
        custom2: {
          text: 'custom 2',
          click: function() {
            alert('clicked custom button 2!');
          }
        }
      },
      */
      timeZone: 'UTC', // timeZone: 'local', // default
      initialView: 'dayGridMonth',
      events: eventlist,
      eventClick: function (info) { // https://fullcalendar.io/docs/eventClick
        info.jsEvent.preventDefault();
        
        if (info) {
          //console.log(info.event.title); 
          $('#wpajaxbundle .popbox').find('.innerwrap').remove();
          
          let linktarget = '_self';
          if( info.event.extendedProps.linktarget == 'yes'){
            linktarget = '_blank';
          }
          let title = info.event.title;
          if( info.event.extendedProps.linktitle == 'yes'){
            title = '<a href="'+info.event.extendedProps.link+'" target="' + linktarget + '">'+info.event.title+'</a>';
          }
          let img = '';
          if (info.event.extendedProps.imgurl) {
            img = '<img class="eventcover" src="' + info.event.extendedProps.imgurl + '" />';
            if( info.event.extendedProps.linkimg == 'yes'){
              img = '<a href="'+info.event.extendedProps.link+'" target="' + linktarget + '"><img class="eventcover" src="' + info.event.extendedProps.imgurl + '" /></a>';
            }
          }
          

          //let mydate = new Date(info.event.extendedProps.startstamp * 1000); //console.log(mydate.toGMTString()+"<br>"+mydate.toLocaleString() );
          //console.log(mydate.toLocaleDateString('nl-NL').slice(0, 10) );  
          //console.log(mydate.toLocaleTimeString('nl-NL', { hour: 'numeric', minute: 'numeric', hour12: true }));
          let days = ['Zo','Ma','Di','Wo','Do','Vr','Za'];
          let months = ['Jan','Feb','Maa','Apr','Mei','Jun','Jul','Aug','Sept','Okt','Nov','Dec'];
          let monthsfull = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December'];

          let eventinfo = $('<div class="innerwrap"></div>');
          let ehtml = '<div class="column1"><div class="introbar"><div class="image">' + img + '</div>';
          ehtml += '<div class="titlebar"><h3>' + title + '</h3></div></div>';
          ehtml += '<div class="contentbar">' + info.event.extendedProps.content + '</div></div>';
          
          ehtml += '<div class="column2"><div class="details"><h5>Details</h5>';
          var start = new Date( info.event.extendedProps.startstamp * 1000 );//new Date('2011-08-31T20:01:32.000Z'); // to unixstamp  Date.parse(info.event.start)
          //console.log(mydate.toLocaleDateString('nl-NL').slice(0, 10) );  
          //console.log(mydate.toLocaleTimeString('nl-NL', { hour: 'numeric', minute: 'numeric', hour12: true }));
          let startdate = start.toLocaleDateString('nl-NL').slice(0, 10);
          let startdatetext = days[start.getDay()] + ' ' + start.getDate() +' '+ monthsfull[start.getMonth()]+' '+ start.getFullYear();
          let starttime = formatAMPM(start); //start.toLocaleTimeString('nl-NL', { hour: 'numeric', minute: 'numeric', hour12: true });   
          //console.log(start.toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3")); 
          ehtml += '<div class="eventstart"><div class="titledate">'+startdatetext+'</div>'+ startdate + ' - '+starttime+'</div>'; 

          if( info.event.extendedProps.allDay ){
            ehtml += '<div class="allday">Gehele dag</div>';
          }
          if( info.event.end != null && info.event.extendedProps.showendtime != 'yes'){
            var end = new Date( info.event.extendedProps.endstamp * 1000 ); //new Date('2011-08-31T20:01:32.000Z'); // to unixstamp  Date.parse(info.event.start)
            let enddate = end.toLocaleDateString('nl-NL').slice(0, 10);
            let enddatetext = days[end.getDay()] + ' ' + end.getDate() +' '+ monthsfull[end.getMonth()] +' '+ end.getFullYear();
            let endtime = formatAMPM(end);//end.toLocaleTimeString('nl-NL', { hour: 'numeric', minute: 'numeric', hour12: true });   
            ehtml += '<div class="eventend"><div class="titledate">'+enddatetext+'</div>' + enddate + ' - '+endtime+'</div>';
          }
          ehtml += '</div>';
          ehtml += '<div class="location"><h5>Locatie</h5>' + info.event.extendedProps.location + '</div>';
          ehtml += '<div class="moreinfo"><span class="infobutton"><a href="' + info.event.extendedProps.link + '" target="' + linktarget + '">' + info.event.extendedProps.linktext + '</a></span></div>';
          ehtml += '</div></div>';

          eventinfo.append(ehtml);
          $('#wpajaxbundle .popbox').append(eventinfo).fadeIn(300); //.insertBefore(jsEvent.currentTarget)
        } else {
          alert('Clicked ');
        }

        return false; // or jsEvent.preventDefault(); no link follow .. window.open(eventObj.url); 
      },
    });
    calendar.setOption('locale', 'nl');
    calendar.render();

    $('#wpajaxbundle .popbox .close').click(function (event) {
      $('#wpajaxbundle .popbox').removeClass('active').fadeOut(300);
    });

  }



  // load more button 
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

  $(document).ready(function () { // $(window).on('load', function(){ // 
    doRequestData();
  });

});



/*

          let eventinfo = $('<div class="innerwrap"></div>');
          let ehtml = '<div class="column1"><div class="introbar"><div class="image">' + img + '</div>';
          ehtml += '<div class="titlebar"><h3>' + title + '</h3></div></div>';
          ehtml += '<div class="contentbar">' + info.event.extendedProps.content + '</div></div>';
          
          ehtml += '<div class="column2"><div class="details"><h5>Details</h5>';
          var start = new Date( info.event.start );//new Date('2011-08-31T20:01:32.000Z'); // to unixstamp  Date.parse(info.event.start)
          let startdate = start.getUTCDay() +'/'+start.getUTCMonth() +'/'+start.getUTCFullYear();
          let starttime = info.event.start;  
          //start.toLocaleTimeString('nl-NL', { hour: 'numeric', minute: 'numeric', hour12: true }); //formatAMPM(start); 
          console.log(new Date(info.event.start).toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3")); 
          ehtml += '<div class="eventstart">' + startdate + ' - '+starttime+'</div>'; 
          if( info.event.allDay ){
            ehtml += '<div class="allday">Gehele dag</div>';
          }
          if( info.event.end != null && info.event.extendedProps.showendtime != 'no'){
            var end = new Date( info.event.end );//new Date('2011-08-31T20:01:32.000Z'); // to unixstamp  Date.parse(info.event.start)
            let enddate = end.getUTCDay() +'/'+end.getUTCMonth() +'/'+end.getUTCFullYear();
            ehtml += '<div class="eventend">' + enddate + ' - '+endtime+'</div>';
          }
          ehtml += '</div>';
          ehtml += '<div class="location"><h5>Locatie</h5>' + info.event.extendedProps.location + '</div>';
          ehtml += '<div class="moreinfo"><span class="infobutton"><a href="' + info.event.extendedProps.link + '" target="' + linktarget + '">' + info.event.extendedProps.linktext + '</a></span></div>';
          ehtml += '</div></div>';

*/

   /*
   
  var setCalendar = function (eventlist) {

    insertHeadScriptTag('https://cdn.jsdelivr.net/npm/fullcalendar@6.1.14/index.global.min.js');

    //insertHeadScriptTag('https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.5.0/fullcalendar.min.js');
    //insertHeadScriptTag('https://cdn.jsdelivr.net/npm/fullcalendar@6.1.14/index.global.min.js');

    $('#wpajaxbundle').prepend('<div id="calendar" style="position:relative;"></div>');

    $('#calendar').prepend('<div class="popbox"><div class="close"><span>×</span></div></div>');

    var calendarEl = $('body').find('#calendar');


    $('#calendar .popbox .close').click(function (event) {
      $('#calendar .popbox').removeClass('active').fadeOut(300);
    });
  
    $('#calendar .popbox').on('mouseleave', function (event) {

      $('#calendar .popbox').removeClass('active');
      setTimeout(function () {
        if (!$('#calendar .popbox').hasClass('active')) {
          $('#calendar .popbox').fadeOut(300);
          $('.fc-event').removeClass('active');
        }
      }, 300);

    });
    $('#calendar .popbox').on('mouseenter', function (event) {
      if (!$('#calendar .popbox').hasClass('active')) {
        $('#calendar .popbox').addClass('active').show();
      }
    });
  

    var calendar = new FullCalendar.Calendar(calendarEl, { 
       
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay', 
      },
      //theme: 'standard',
      views: {
        month: { // name of view
          titleFormat: 'YYYY, MM, DD'
          // other view-specific options here
        }
      },
      timeZone: 'UTC',
      firstDay: '1',
      allDaySlot: true,
      initialView: 'dayGridMonth', //  'multiMonthYear', // 
      //multiMonthMaxColumns: 2,
      events: eventlist,
    
      eventClick: function (eventObj, jsEvent, view) {
        if (eventObj.url) {
          //console.log(jsEvent); 
          $('#wpajaxbundle .popbox').find('.innerwrap').remove();
          let img = '';
          if (eventObj.imgurl) {
            img = '<img src="' + eventObj.imgurl + '" />';
          }

          /* showendtime: post.custom_field_values["event-hide-end-time"],
          allDay: post.custom_field_values["event-all-day"],
          location: post.custom_field_values["event-location"],
          link: post.custom_field_values["event-link"],
          linktext: post.custom_field_values["event-link-label"],
          linktarget: post.custom_field_values["event-link-target"],
          linktitle: post.custom_field_values["event-link-title"],
          linkimg: post.custom_field_values["event-link-image"],
          imgthumbid: post.custom_field_values["_thumbnail_id"], */
      /*
          let eventinfo = $('<div class="innerwrap"><h3>' + eventObj.title + '</h3><div>' + img + '' + eventObj.content + '</div><div>');
          $('#wpajaxbundle .popbox').append(eventinfo).fadeIn(300); //.insertBefore(jsEvent.currentTarget)
          return false; // or jsEvent.preventDefault(); no link follow .. window.open(eventObj.url); 
        } else {
          alert('Clicked ' + eventObj.title);
        }
      }
      
    });
    calendar.render();
    //var event = { id: 1, title: 'New event', start: new Date() };
    //calendar.addEvent( event );
  }*/

  /* 
    box.addEventListener('mouseover', () => {
    if (box.querySelector('.floatbox').innerHTML == smallload) {
      setFloatInfo(box);
    }
    box.querySelector('.floatbox').classList.add("display");
  });
  */
  // keep inside frame 

  /*
  $("body").on('mouseover', ".fc-event", function(e){
    if(!$(this).hasClass('active')){
      $(this).addClass('active').trigger('click');
    }
      if( e.clientX > ( $(window).width() - $('#wpajaxbundle .popbox').width() )){
        //$('.floatbox.display').addClass('left');
        $('#wpajaxbundle .popbox').css('left', (e.clientX - ($('#wpajaxbundle .popbox').width() -30 ) )+'px'); // epageX
      }else{
        $('#wpajaxbundle .popbox').css('left', (e.clientX-50)+'px');
      }
      if( e.clientY > ( $(window).height() - $('#wpajaxbundle .popbox').height() )){
        $('#wpajaxbundle .popbox').css('top', (e.clientY - ( $('#wpajaxbundle .popbox').height() -30 ) )+'px');
      }else{
        $('#wpajaxbundle .popbox').css('top', (e.clientY - 50)+'px');
      }
    	//$('.floatbox.display').css('top',  (e.clientY+20)+'px'); // e.pageY 
    	//$('.floatbox.display').css('left', (e.clientX+20)+'px'); // epageX
		});
  */ 


 /*
    $(document).ready(function () {
      doRequestData();
     
      var mouseX;
      var mouseY;
      $(document).mousemove( function(e) {
        mouseX = e.pageX; 
        mouseY = e.pageY;
      });  
      $("body").on('mouseover', ".fc-event", function(){
        $('#calendar .popbox').css({'top':(mouseY-20)+'px','left':(mouseX-20)+'px'});
      });  
     
    });
 */ 