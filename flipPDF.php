<?php

/****

* Plugin Name:  FlipPDF | Ultimate Flip Books Made Easy! 

* Plugin URI:   #

* Description:  WP E-Books Representation Plugin developed with the Co-Work of Umair Akram & Hasnain Khalid 

* Version:      1.0

* Author:       Umair Akram & Hasnain Khalid

* Author URI:   #

* License:      GPL 2



****/



define(MH_PATH, plugins_url());



function fp_enqueue_styles() {

    wp_enqueue_style( 'flippdf_css', MH_PATH.'/flipPDF/includes/css/magalone.min.css');

    wp_enqueue_style( 'maglone_font', 'https://fonts.googleapis.com/icon?family=Material+Icons');

    wp_enqueue_script('flippdf_js', MH_PATH.'/flipPDF/includes/js/magalone.min.js');

}

add_action( 'wp_enqueue_scripts', 'fp_enqueue_styles' );


function fp_generate_flip_book($atts) {

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

add_shortcode('flippdf','fp_generate_flip_book');