
# wp-ajax-bundle

WordPress plugin for loading content with ajax initiated from shortcode

## Usage
Use a shortcode in a page like:

[wpajaxposts posttype='post' display="excerpt" tax1="category" terms1="blog,updates" tax2="" terms2="" ppp="2" button="hidden"]Ajax load test[/wpajaxposts]

will display posts (posttype post) from category 'blog' or 'updates' and load 2 more automatically on scroll down (hide the load more button)

or 

[wpajaxposts posttype="event" tax1="" terms1="" tax2="" terms2="" ppp="25" load="all" display="" button="hidden"]Ajax load test[/wpajaxposts]

will display the Fullcalendar with the events, tested withpostevents from  [Very Simple Event List](https://nl.wordpress.org/plugins/very-simple-event-list/) 

### Shortcode Properties
- **posttype**: postype(s) separated by comma ('post,event' )

Regular posttype properties
- **display**: 'excerpt'(default) or 'full'
- **tax1,terms1,tax2,terms2**: filters for 2 different taxonomies (multiple categories and tags)
- **ppp**: amount of post to load on scroll or click load more button (Post Per 'Page')
- **button**: use load more button, 'hidden': hide button and automatically load more posts

### Development

- [x] Setup with ajax nonce in wordpress plugin
- [x] Retrieve posts from category (taxonomy category slug) including with tags (taxonomy post_tag slug)
- [x] Shortcode for test button with console log output
- [x] Setup basic result view
- [x] Event posttype Fullcalendar display including popup event info
- [x] Adjusted to Fullcalendar version 6!
- [x]  Assign style and interaction

### On the road [not mapped]
- [ ]  Mobile (touch/smallscreen) tuning
- [ ]  Plugin settings/options screen
- [ ]  Dynamically change categories and tags and parse new requests 
- [ ]  Testing: Floating popup

[Development notes](https://github.com/webbouwer/wp-ajax-bundle/blob/development/notes.md)
DevOp @ [webdesigndenhaag.net/lab/wordpress/develop](https://webdesigndenhaag.net/lab/wordpress/develop/hello-events-test/)

MD doc made with https://stackedit.io/app#