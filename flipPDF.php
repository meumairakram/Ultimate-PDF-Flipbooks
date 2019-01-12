<?php

/****

* Plugin Name:  FlipPDF | Ultimate Flip Books Made Easy! 

* Plugin URI:   #

* Description:  WP E-Books Representation Plugin developed with the Co-Work of Umair Akram & Hasnain Khalid 

* Version:      1.0

* Author:       Umair Akram & M Hasnain Khalid

* Author URI:   #

* License:      GPL 2



****/



//define(MH_PATH, plugins_url());



function fpdf_enqueue_styles() {

    wp_enqueue_style( 'flippdf_css', plugins_url().'/flipPDF/includes/css/magalone.min.css');

    wp_enqueue_style( 'maglone_font', 'https://fonts.googleapis.com/icon?family=Material+Icons');

    wp_enqueue_script('flippdf_js', plugins_url().'/flipPDF/includes/js/magalone.min.js');

}

add_action( 'wp_enqueue_scripts', 'fpdf_enqueue_styles' );


function fpdf_generate_flip_book($atts) {

 $atts = shortcode_atts(array(
 						'class' => '',
 						'file-url' => 'none',
 						'enable-thumbnails' => 'false',
 						'thumb-overlay' => 'false',
 						'enable-zoom' => 'false'

 						),$atts,'flippdf');

$output = '';

if($atts['class'] != 'none') {

	$output .= '<div class="'.$atts['class'].'">';
} 


$output .= '<div id="reader-container"';

if($atts['file-url'] != 'none') {

 $output .= ' data-path="'.$atts['file-url'].'"';
}

if($atts['enable-thumbnails'] != 'false') {

 $output .= ' data-show-thumbnails="'.$atts['enable-thumbnails'].'"';
}

if($atts['thumb-overlay'] != 'false') {

 $output .= ' data‑thumbnails‑overlay="'.$atts['thumb-overlay'].'"';
}

if($atts['enable-zoom'] != 'false' && $atts['enable-zoom'] == 'true') {

 $output .= ' data-show-zoom="'.$atts['enable-zoom'].'"';
}

$output .= '> </div>';



if($atts['class'] != 'none') {

	$output .= '</div>';
} 


echo $output;

}

add_shortcode('flippdf','fpdf_generate_flip_book');

function fpdf_register_post_type() {

	$args = array('label' => 'FlipPDF Books',
					'labels' => array('name' => 'Flip Books',
									'singular_name' => 'FlipBook',
									'add_new' => 'Add new Book',
									'add_new_item' => 'Add new Book',
									'edit_item' => _x('Edit Book','flipbook label'),
									''),
					'public' => true,
					'supports' => array('title','editor','revisions'));

	register_post_type('flipbook',$args);
}

add_action('init','fpdf_register_post_type');


function fpdf_new_book_cover_meta() {
	    add_meta_box('postimagediv', __('Book Cover Image'), 'post_thumbnail_meta_box', 'flipbook', 'side', 'low');

}

add_action('admin_head','fpdf_new_book_cover_meta');



/// Adding custom PDF book attachment with post feature


function fpdf_add_custom_meta_boxes() {  
    add_meta_box('wp_custom_attachment', 'Upload Book (PDF)', 'fpdf_wp_custom_attachment', 'flipbook', 'side', 'low');  
}
add_action('add_meta_boxes', 'fpdf_add_custom_meta_boxes');  

function fpdf_wp_custom_attachment() {  
    wp_nonce_field(plugin_basename(__FILE__), 'wp_custom_attachment_nonce');
    $html = '<p class="description">';
    $html .= 'Upload your PDF Book here.';
    $html .= '</p>';
    $html .= '<input type="file" id="fpdf_book_attachment" name="fpdf_book_attachment" value="" size="25">';
    echo $html;
}

add_action('save_post_flipbook', 'fpdf_save_custom_meta_data');


function fpdf_save_custom_meta_data($id) {
    if(!empty($_FILES['wp_custom_attachment']['name'])) {
        $supported_types = array('application/pdf');
        $arr_file_type = wp_check_filetype(basename($_FILES['wp_custom_attachment']['name']));
        $uploaded_type = $arr_file_type['type'];

        if(in_array($uploaded_type, $supported_types)) {
            $upload = wp_upload_bits($_FILES['wp_custom_attachment']['name'], null, file_get_contents($_FILES['wp_custom_attachment']['tmp_name']));
            if(isset($upload['error']) && $upload['error'] != 0) {
                wp_die('There was an error uploading your file. The error is: ' . $upload['error']);
            } else {
                update_post_meta($id, 'fpdf_book_attachment', $upload);
            }
        }
        else {
            wp_die("The file type that you've uploaded is not a PDF.");
        }
    }
}

function fpdf_update_edit_form() {
    echo ' enctype="multipart/form-data"';
}
add_action('post_edit_form_tag', 'fpdf_update_edit_form');





if( !function_exists('fpdf_custom_books_template') ):
 function fpdf_custom_books_template($single_template) {
    global $wp_query, $post;
    if ($post->post_type == 'flipbook'){
        $single_template = plugin_dir_path(__FILE__) . 'fpdf_template.php';
    }//end if MY_CUSTOM_POST_TYPE
    return $single_template;
}//end get_MY_CUSTOM_POST_TYPE_template function
endif;
 
add_filter( 'single_template', 'fpdf_custom_books_template' ) ;


// Read more at https://www.adviceinteractivegroup.com/blog/using-wordpress-custom-post-type-templates-in-a-plugin/#dTlVjE9vQpyEUKul.99