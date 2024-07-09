# Development Notes

A lot of things changed in version 5/6 

# Prior to version 6


- Retrieved post-event variables to Event properties

showendtime: post.custom_field_values["event-hide-end-time"],
allDay: post.custom_field_values["event-all-day"],
location: post.custom_field_values["event-location"],
link: post.custom_field_values["event-link"],
linktext: post.custom_field_values["event-link-label"],
linktarget: post.custom_field_values["event-link-target"],
linktitle: post.custom_field_values["event-link-title"],
linkimg: post.custom_field_values["event-link-image"],
imgthumbid: post.custom_field_values["_thumbnail_id"], */

- Tested code to keep a cursor follow box in frame bounderies
- 

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
    //$('.floatbox.display').css('top', (e.clientY+20)+'px'); // e.pageY
    //$('.floatbox.display').css('left', (e.clientX+20)+'px'); // epageX
    });
    
    /* pop place on cursor event */
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
    
    /* hack script into head (for testing only, not working in protected site) */
    var insertScriptTag = function (scripturl, pos = false) {
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = scripturl;
    if( pos == 'body'){
    $("body").append(s);
    }else{
    $("head").append(s);
    }
    console.log('Fullcalendar script loaded');
    }
    
    /* Fullcalendar prior to version 6 */
    var stampToGMTdateString = function (timestamp) {
    let vardate = new Date(timestamp * 1000);
    return vardate.toGMTString();
    }
    
    // version 6 uses iso ISO 8601 https://stackoverflow.com/a/903206/662581
    // https://stackoverflow.com/questions/12868176/how-do-i-convert-a-unix-timestamp-to-iso-8601-in-javascript
    // timestamp = post.custom_field_values['event-start-date']
    // new Date(timestamp* 1000).toISOString();
    

This file was made with https://stackedit.io/app#
