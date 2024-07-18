WP AJAX Plugin

Dev Notes & Sources

### wp-ajax-bundle.php:

## wp post tag counts
https://wordpress.stackexchange.com/questions/173949/order-posts-by-tags-count
https://wordpress.stackexchange.com/questions/326497/how-to-display-related-posts-based-on-number-of-taxonomy-terms-matched


## fullcalendar loading with script tags
https://github.com/fullcalendar/fullcalendar
https://fullcalendar.io/docs/upgrading-from-v5 
https://www.jsdelivr.com/package/npm/fullcalendar
https://cdn.jsdelivr.net/npm/fullcalendar@6.1.14/index.global.min.js
https://fullcalendar.io/docs/event-object
https://fullcalendar.io/docs/eventDisplay

## load languages
https://www.jsdelivr.com/package/npm/@fullcalendar/core?tab=files&path=locales

## Javascript date
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getDate
https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_tolocalestring_date_all

## WP PHP nesed tags 
https://wordpress.stackexchange.com/questions/313622/nested-tax-query-that-allows-specified-categories-or-tags-but-not-other-categor

## PHP AJAX help function

        /*  libxml_use_internal_errors(true); // use this to prevent warning messages from displaying because of the bad HTML
            $doc = new DOMDocument();
            $doc->loadHTML(mb_convert_encoding($fulltext, 'HTML-ENTITIES', 'UTF-8'), LIBXML_HTML_NODEFDTD);
            //$doc->loadHTML( utf8_decode( $fulltext ) );
            $doc->encoding = 'utf-8';
            $doc->normalizeDocument();
            $content = $doc->saveHTML();
			*/

### post_ajax.js

## date & time
new Date('2011-08-31T20:01:32.000Z'); // to unixstamp  Date.parse(info.event.start)
console.log(mydate.toLocaleDateString('nl-NL').slice(0, 10) );  
console.log(mydate.toLocaleTimeString('nl-NL', { hour: 'numeric', minute: 'numeric', hour12: true }));
new Date('2011-08-31T20:01:32.000Z'); // to unixstamp  Date.parse(info.event.start)
end.toLocaleTimeString('nl-NL', { hour: 'numeric', minute: 'numeric', hour12: true });  
let mydate = new Date(info.event.extendedProps.startstamp * 1000); //console.log(mydate.toGMTString()+"<br>"+mydate.toLocaleString() );
console.log(mydate.toLocaleDateString('nl-NL').slice(0, 10) );  
console.log(mydate.toLocaleTimeString('nl-NL', { hour: 'numeric', minute: 'numeric', hour12: true }));


