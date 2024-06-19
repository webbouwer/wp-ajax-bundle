# wp-ajax-bundle
WP plugin for frontend development with ajax

### Info

Use a shortcode in a page like:

[wpajaxposts posttype='post' display="excerpt"  tax1="category" terms1="blog,updates" tax2="" terms2="" ppp="2" button="hidden"]Ajax load test[/wpajaxposts]


Then dynamically a list of posts  is displayed 

(from above shortcode; posts (posttype post) from category 'blog' or 'updates', load 2 more automatically on scroll down (hide the load more button)

posttype: postype(s) separated by comma ('post,event' )

display: 'excerpt'(default) or 'full'

tax1,terms1,tax2,terms2: filters for 2 different taxonomies (multiple categories and tags)

ppp: amount of post to load on scroll or click load more button (Post Per 'Page')

button: use load more button, 'hidden': hide button and automatically load more posts 


### Status
- [x] setup with ajax nonce in wordpress plugin
retrieve posts from category (taxonomy category slug) including with tags (taxonomy post_tag slug)

- [x] shortcode for test button with console log output

- [x] setup basic result view

- [ ] in progress: Use display and posttype variables for output (theme) options (ie. calendar display)

- [ ] in progress: Fullcalendar display with popup on click (post type event from VS Eventlist)

### Next
- [ ] dynamically change categories and tags and parse new requests
Includes category/tag select menu's from shortcode settings
