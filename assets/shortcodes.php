<?php
// Shortcode class
class WPAjaxBundleShortcodes{

  private $nr = 0;

  public function __construct() {

    add_shortcode('wpajaxposts', array( $this, 'wpajax_shortcode') );

  }

  // Shortcode function
  public function wpajax_shortcode($atts, $content = null) {

    // [wpajaxposts tax1="category" terms1="blog" tax2="post_tag" terms2="planet,earth" ppp="2" button="hidden"]Ajax load test[/wpajaxposts]
    $default = array(
        'button' => '',
        'tax1' => '', // {0: 'category'}
        'terms1' => '', // { 0: 'blog'}
        'tax2' => '', // { 0: 'planet',1: 'earth'}
        'terms2' => '', // { 0: 'planet',1: 'earth'}
        'orderby' => '',
        'order' => '',
        'ppp' => '',
    );
    $att = shortcode_atts($default, $atts);
    $content = do_shortcode($content);

    $button = '';
    if($att['button'] != 'hidden'){
      $button = '<div class="wpajaxbundle button">'.$content.'</div>';
    }
    $this->nr++; // id_'.$this->nr.'
    $html = '<div id="wpajaxbundle" class="wpajaxbundle section-inner" data-ppp="'.$att['ppp'].'" data-tax1="'.$att['tax1'].'" data-terms1="'.$att['terms1'].'" data-tax2="'.$att['tax2'].'" data-terms2="'.$att['terms2'].'">
    <div class="container"></div>'.$button.'</div>';
    //print_r($att);
    return $html;

  }

}
new WPAjaxBundleShortcodes();
