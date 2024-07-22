<?php

/**
 * Plugin Name: WP-ajax-bundle
 * Plugin URI: https://github.com/webbouwer/wp-ajax-bundle
 * Description:  WP plugin for frontend development with ajax
 * Author: webbouwer
 * Version: 0.0.1
 * Author URI: https://webbouwer.org
 * License: GNU General Public License v2 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: wpab
 */

if (!defined('ABSPATH')) exit;

require_once(plugin_dir_path(__FILE__) . 'assets/shortcodes.php');

// main class
class WPAjaxBundle
{
  var $query;
  public function __construct()
  {
    // Enqueue the wp ajax php scripts
    add_action('wp_enqueue_scripts', array($this, 'getPostData_localize_ajax'));
    add_action('wp_enqueue_scripts', array($this, 'getPostData_ajax_script'));
    add_action('wp_enqueue_scripts', array($this, 'wpajaxbundle_theme_css'));

    // Enqueue the wp ajax script on the back end (wp-admin)
    add_action('admin_enqueue_scripts', array($this, 'getPostData_ajax_script'));
    // assign php function for ajax request (bind the nonce)
    add_action('wp_ajax_getWPPostData', array($this, 'getWPPostData'));
    add_action('wp_ajax_nopriv_getWPPostData', array($this, 'getWPPostData'));
  }

  public function getPostData_localize_ajax()
  {
    // secure with unique id (nonce)
    wp_localize_script('jquery', 'ajax', array(
      'url' => admin_url('admin-ajax.php'),
      'nonce' => wp_create_nonce('getPostData_nonce'),
    ));
  }

  public function getPostData_ajax_script()
  {
    // secure with local script file assigned
    wp_enqueue_script('ajax-script', plugins_url('js/post_ajax.js', __FILE__), array('jquery'), null, true);
    wp_localize_script('ajax-script', 'ajax_data', array(
      'ajaxurl' => admin_url('admin-ajax.php'),
    ));

   //wp_enqueue_script('tooltip-script', 'https://unpkg.com/tooltip.js/dist/umd/tooltip.min.js', array('jquery'), '1.3.3',);
    wp_enqueue_script('fullcalendar-script', 'https://cdn.jsdelivr.net/npm/fullcalendar/index.global.min.js', array('jquery'), '6.1.14',);
    wp_enqueue_script('fullcalendar-language', 'https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.15/locales/nl.global.min.js', array('jquery'), '6.1.15',);
    
    
  }

  public function wpajaxbundle_theme_css()
  {
    wp_enqueue_style('wpajaxbundle-css', plugins_url('css/wpajaxbundle.css', __FILE__), array(), '0.1',);
    wp_enqueue_style('wpajaxbundle-loader', plugins_url('css/wpajaxloader.css', __FILE__), array(), '0.1',); 
    wp_enqueue_style('wpajaxbundle-popbox', plugins_url('css/wpajaxpopbox.css', __FILE__), array(), '0.1',); 
    wp_enqueue_style('wpajaxbundle-fullcalendar', plugins_url('css/wpajaxfullcalendar.css', __FILE__), array(), '0.1',);
    wp_enqueue_style('wpajaxbundle-fullcalendar-css', 'https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.5.0/fullcalendar.min.css', array(), '3.5.0',);
  }

  public function getWPPostData()
  {

    // verify nonce
    if (!wp_verify_nonce($_POST['nonce'], 'getPostData_nonce')) {
      die('Permission Denied.');
    }

    $data = $_POST['data'];

    // collect data from post request
    $paged  = $data['page'];
    $posttype  = $data['posttype'];
    $display = $data['display'];
    $relation = $data['relation'];
    $tax1 = $data['tax1'];          // category array..
    $terms1  = $data['terms1'];     // slugs array..
    $tax2 = $data['tax2'];          // category array..
    $terms2  = $data['terms2'];      //$_POST['data']['slug']; // slugs array..
    $orderby  = $data['orderby'];
    $order = $data['order'];
    $amount  = $data['ppp'];
    $paged = (isset($paged) || !(empty($paged))) ? $paged : 1;

    $tax_query = array('relation' => $relation);
    if (isset($tax1) && isset($terms1) && $terms1 != '' && count($terms1) > 0) {
      $tax_query[] =  array(
        'taxonomy' => $tax1,
        'field' => 'slug',
        'terms' => $terms1
      );
    }
    if (isset($tax2) && isset($terms2) && $terms2 != '' && count($terms2) > 0) {
      $tax_query[] =  array(
        'taxonomy' => $tax2,
        'field' => 'slug',
        'terms' => $terms2
      );
    }

    // complete query args bundle
    $get_post_args = array(
      'post_type'        => $posttype,   // post type
      'status'           => 'published', // only published visible
      'posts_per_page'   => $amount,     // amount of post each request(page)
      'orderby'          => $orderby,    // 'menu_order', // date
      'order'            => $order,      //'ASC', // desc
      'suppress_filters' => false,        // remove plugin ordenings (?)
      'paged'            => $paged,      // loaded requests (pages)
      'tax_query'        => $tax_query   // taxonomy request variables array
    );

    $query = $get_post_args;

    // run query with requested args
    $postdata = new WP_Query($query);
    $result = [];

    // check and bundle needed postdata returned
    if ($postdata->have_posts()) :
      while ($postdata->have_posts()) : $postdata->the_post();

        $post = get_post(get_the_ID());
        $htmlbody = $post->post_content;
        $fulltext = $post->post_content; 
        $content = apply_filters('the_content', $fulltext);
        $result[] = array(
          'id' => get_the_ID(),
          'type' => $post->post_type,
          'link' => get_the_permalink(),
          'display' => $data['display'],
          'title' => get_the_title(),
          'slug' => $post->post_name,

          'image' => get_the_post_thumbnail($post->id, 'large'),
          'imgurl' => wp_get_attachment_url(get_post_thumbnail_id($post->id, 'large')),
          'imgorient' => check_image_orientation($post->id),
          'excerpt' => get_the_excerpt(),
          'content' => $content,
          'htmlbody' => $htmlbody,
          'cats' => wp_get_post_terms(get_the_ID(), 'category', array("fields" => "slugs")),
          'tags' => wp_get_post_terms(get_the_ID(), 'post_tag', array("fields" => "slugs")),
          'date' => get_the_date(),
          'timestamp' => strtotime(get_the_date()),
          'author' => get_the_author(),
          //'custom_field_keys' => get_post_custom_keys(),
          'custom_field_values' => get_post_custom(get_the_ID()),
        );
      endwhile;
    endif;

    header('Content-Type: application/json');
    print json_encode($result);

    wp_reset_query();
    wp_die();
  }
}
new WPAjaxBundle();

// image orient
function check_image_orientation($pid)
{
  $orient = 'landscape';
  $image = wp_get_attachment_image_src(get_post_thumbnail_id($pid), '');
  if ($image) {
    $image_w = $image[1];
    $image_h = $image[2];
    if ($image_w > $image_h) {
      $orient = 'landscape';
    } elseif ($image_w == $image_h) {
      $orient = 'square';
    } else {
      $orient = 'portrait';
    }
  }
  return $orient;
}