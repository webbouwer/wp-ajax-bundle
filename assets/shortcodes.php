<?php
// Shortcode class
class WPAjaxBundleShortcodes{

  public function __construct() {

    add_shortcode('wpajaxposts', array( $this, 'wpajax_shortcode') );

  }

  // Shortcode example
  public function wpajax_shortcode($atts, $content = null) {

    $default = array(
        'tax1' => '', // {0: 'category'}
        'terms1' => '', // { 0: 'blog'}
        'tax2' => '', // { 0: 'planet',1: 'earth'}
        'terms2' => '', // { 0: 'planet',1: 'earth'}
    );
    $att = shortcode_atts($default, $atts);
    $content = do_shortcode($content);

    $button = '';
    if($att['button'] != 'hidden'){
      $button = '<div class="wpajaxbundle button">'.$content.'</div>'; 
    }

    return '<div class="section-inner"><div class="post-meta-wrapper"><div class="container" data-taxterms="'.$att['taxterms'].'" data-tags="'.$att['tags'].'"></div>'.$button.'</div></div>';

  }

}
new WPAjaxBundleShortcodes();
