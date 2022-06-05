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

 if ( !defined( 'ABSPATH' ) ) exit;

 require_once(plugin_dir_path(__FILE__) . 'assets/shortcodes.php');

 // main class
 class WPAjaxBundle{

    var $query;

    public function __construct() {

       // add if statements accoording to view types (if is_single etc.)
       // Enqueue the wp ajax php scripts
       add_action('wp_enqueue_scripts', array( $this, 'getPostData_localize_ajax') );
       add_action( 'wp_enqueue_scripts', array( $this, 'getPostData_ajax_script' ) );
       // Enqueue the wp ajax script on the back end (wp-admin)
       add_action( 'admin_enqueue_scripts', array( $this, 'getPostData_ajax_script' ) );
       // assign php function for ajax request (bind the nonce)
       add_action('wp_ajax_getWPPostData', array( $this, 'getWPPostData') );
       add_action('wp_ajax_nopriv_getWPPostData', array( $this, 'getWPPostData') );

     }

     public function getPostData_localize_ajax(){
       // secure with unique id (nonce)
       wp_localize_script('jquery', 'ajax', array(
       'url' => admin_url('admin-ajax.php'),
       'nonce' => wp_create_nonce('getPostData_nonce'),
       ));
     }
     public function getPostData_ajax_script(){
       // secure with local script file assigned
       wp_enqueue_script( 'ajax-script', plugins_url( 'js/post_ajax.js', __FILE__ ), array( 'jquery' ), null, true );
       wp_localize_script( 'ajax-script', 'ajax_data', array(
       'ajaxurl' => admin_url( 'admin-ajax.php' ),
       ) );
     }

     public function getWPPostData(){

       // verify nonce
       if( !wp_verify_nonce($_POST['nonce'], 'getPostData_nonce') ){
          die('Permission Denied.');
       }

       $data = $_POST['data'];

       // collect data from post request
       $paged  = $data['page'];
       $posttype  = $data['posttype'];
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
       if (isset($tax1) && isset($terms1) && $terms1 != '' && count($terms1) > 0){
         $tax_query[] =  array(
         'taxonomy' => $tax1,
         'field' => 'slug',
         'terms' => $terms1
         );
       }
       if(isset($tax2) && isset($terms2) && $terms2 != '' && count($terms2) > 0){
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
         'suppress_filters' => true,        // remove plugin ordenings (?)
         'paged'            => $paged,      // loaded requests (pages)
         'tax_query'        => $tax_query   // taxonomy request variables array
       );

       $query = $get_post_args;

       // run query with requested args
       $postdata = new WP_Query($get_post_args);

       $result = [];

       // check and bundle needed postdata returned
       if($postdata->have_posts()) :
         while($postdata->have_posts()) : $postdata->the_post();
            $post = [];
            $post['id'] = get_the_ID();
            $post['title'] = get_the_title();
            $post['excerpt'] = get_the_excerpt();
            $result[] = $post;
         endwhile;
       endif;

       header('Content-Type: application/json');
       print json_encode($result);

       wp_reset_query();
       wp_die();

     }

 }
 new WPAjaxBundle();

/*
// main class
class WPAjaxBundle{

  public function __construct() {

    // Enqueue the wp ajax php scripts
    add_action('wp_enqueue_scripts', array( $this, 'getPostData_localize_ajax') );
    add_action( 'wp_enqueue_scripts', array( $this, 'getPostData_ajax_script' ) );
    // Enqueue the wp ajax script on the back end (wp-admin)
    add_action( 'admin_enqueue_scripts', array( $this, 'getPostData_ajax_script' ) );
    // assign php function for ajax request (bind the nonce)
    add_action('wp_ajax_getPostDataWP', array( $this, 'getPostDataWP') );
    add_action('wp_ajax_nopriv_getPostDataWP', array( $this, 'getPostDataWP') );

  }

  public function getPostData_localize_ajax(){
    // secure with unique id (nonce)
    wp_localize_script('jquery', 'ajax', array(
    'url' => admin_url('admin-ajax.php'),
    'nonce' => wp_create_nonce('getPostData_my_ajax_nonce'),
    ));
  }
  public function getPostData_ajax_script(){
    // secure with local script file assigned
    wp_enqueue_script( 'ajax-script', plugins_url( 'js/post_ajax.js', __FILE__ ), array( 'jquery' ), null, true );
    wp_localize_script( 'ajax-script', 'ajax_data', array(
    'ajaxurl' => admin_url( 'admin-ajax.php' ),
    ) );
  }

  public function getPostDataWP(){
    // verify nonce
    if( !wp_verify_nonce($_POST['nonce'], 'getPostData_my_ajax_nonce') ){
       die('Permission Denied.');
    }
    // collect data from post request
    $paged  = $_POST['data']['page'];
    $posttype  = $_POST['data']['posttype'];
    $taxname = $_POST['data']['taxname']; // category array..
    $terms  = $_POST['data']['termlist']; // slugs array..
    $tags  = $_POST['data']['taglist']; //$_POST['data']['slug']; // slugs array..
    $orderby  = $_POST['data']['orderby'];
    $order = $_POST['data']['order'];
    $amount  = $_POST['data']['ppp'];
    $paged = (isset($paged) || !(empty($paged))) ? $paged : 1;

    // define the taxonomy args outside of the WP_Query instantiation
    // https://wordpress.stackexchange.com/questions/55831/conditional-arguments-for-wp-query-and-tax-query-depending-on-if-somevar-has-a
    $tax_query = array('relation' => 'AND');
    if (isset($taxname) && isset($terms) && count($terms) > 0){
      $tax_query[] =  array(
      'taxonomy' => $taxname,
      'field' => 'slug',
      'terms' => $terms
      );
    }
    if (isset($tags) && $tags != '' && count($tags) > 0){
      $tax_query[] =  array(
        'taxonomy' => 'post_tag',
        'field' => 'slug',
        'terms' => $tags
      );
    }

    // complete query args bundle
    $get_post_args = array(
      'post_type'        => $posttype,   // post type
    	'status'           => 'published', // only published visible
      'posts_per_page'   => $amount,     // amount of post each request(page)
      'orderby'          => $orderby,    // 'menu_order', // date
    	'order'            => $order,      //'ASC', // desc
    	'suppress_filters' => true,        // remove plugin ordenings (?)
    	'paged'            => $paged,      // loaded requests (pages)
      'tax_query'        => $tax_query   // taxonomy request variables array
    );

    // run query with requested args
    $postdata = new WP_Query($get_post_args);

    // check postdata returned
    if($postdata->have_posts()) :

        header('Content-Type: application/json');
        print json_encode($postdata);

    endif;

    wp_reset_query();
    wp_die();
  }

}
new WPAjaxBundle();


*/
