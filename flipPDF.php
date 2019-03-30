<?php

/****
* Plugin Name:  Ultimate PDF Flipbooks | Flip Books Made Easy! 
* Plugin URI:   https://github.com/meumairakram/flipPDF
* Description:  Create beautiful and Responsive Flipbooks from your PDF's with page turn animations and many options and directly Embed them into your post and pages using our powerful shortcode generator.
* Version:      1.1
* Author:       Umair Akram & Hasnain Khalid
* Author URI:   #
* License:      GPL 2
****/


 define('UPLOAD_FOLDER_NAME','flipbooks');
 define('UPFB_UPLOAD_PATH',wp_upload_dir()['basedir'].'/'.UPLOAD_FOLDER_NAME);

 // creating flipbooks folder if donot exist in the wp-content/uploads
 if(!function_exists('upfb_check_uploading_directory')) {
    function upfb_check_uploading_directory() {
        if(!file_exists(UPFB_UPLOAD_PATH)) {
            mkdir(UPFB_UPLOAD_PATH);
        }
    }
}
register_activation_hook(__FILE__,'upfb_check_uploading_directory');


function upfb_enqueue_styles() {
    wp_enqueue_style( 'flippdf_css', plugins_url().'/flipPDF/includes/css/upfb_style.min.css');
    wp_enqueue_style( 'maglone_font', 'https://fonts.googleapis.com/icon?family=Material+Icons');
    wp_enqueue_script('flippdf_js', plugins_url().'/flipPDF/includes/js/magalone.min.js');
}
function upfb_admin_enqueue_styles() {
    wp_enqueue_style( 'custom_css', plugins_url() . '/flipPDF/includes/css/custom_style.css');
    wp_enqueue_script( 'custom_js_admin', plugins_url() . '/flipPDF/includes/js/admin_js.js');
}
add_action( 'wp_enqueue_scripts', 'upfb_enqueue_styles' );
add_action( 'admin_enqueue_scripts', 'upfb_admin_enqueue_styles' );
function upfb_generate_flip_book($atts) {
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
add_shortcode('flippdf','upfb_generate_flip_book');
function upfb_register_post_type() {
    

	$args = array('label' => 'FlipPDF Books',
                    'labels' => array('name' => 'Flip Books',
                                    'singular_name' => 'FlipBook',
									'add_new' => 'Add new Book',
									'add_new_item' => 'Add new Book',
									'edit_item' => _x('Edit Book','flipbook label'),
									''),
					'public' => true,
                    'supports' => array('title','editor','revisions'),
                'show_in_nav_menus' => false,
                'publicly_queryable' => false);
	register_post_type('flipbook',$args);
}

add_action('init','upfb_register_post_type');


add_action('admin_menu', 'upfb_my_admin_menu'); 
function upfb_my_admin_menu() {  

        add_submenu_page('edit.php?post_type=flipbook', 
        'Settings', 
        'Settings', 
        8, 
        'settings-page', 
        'upfb_settings_show');
}

function upfb_settings_show(){
    // Get all output for settings page
    require('settings.php');
}


function upfb_new_book_cover_meta() {
	    add_meta_box('postimagediv', __('Book Cover Image'), 'post_thumbnail_meta_box', 'flipbook', 'side', 'low');
}
add_action('admin_head','upfb_new_book_cover_meta');

/// Adding custom PDF book attachment with post feature
function upfb_add_custom_meta_boxes() {  
    add_meta_box('wp_custom_attachment', 'Upload Book (PDF)', 'upfb_wp_custom_attachment', 'flipbook', 'side', 'low');  
}
add_action('add_meta_boxes', 'upfb_add_custom_meta_boxes');  
function upfb_wp_custom_attachment() {  

    $post_id = get_the_ID();
    $post_meta =  get_post_meta($post_id,'upfb_book_foldername',true);
    $html = wp_nonce_field('2635','pdf_upload_nonce',true,false);

    if(!empty($post_meta)) {
        $html .= '<strong class="already_attached">Already have a book Attached, reuploading will override it.</strong>';
    }
    

    $html .= '<p class="description">';
    $html .= 'Upload your PDF Book here.';
    $html .= '</p>';
    $html .= '<input type="file" id="upfb_book_attachment" accept="application/pdf" name="upfb_book_attachment" value="" size="25">';
    echo $html;
}



function upfb_update_edit_form() {
    echo ' enctype="multipart/form-data"';
}
add_action('post_edit_form_tag', 'upfb_update_edit_form');

if( !function_exists('upfb_custom_books_template') ):
 function upfb_custom_books_template($single_template) {
    global $wp_query, $post;
    if ($post->post_type == 'flipbook'){
        $single_template = plugin_dir_path(__FILE__) . 'fpdf_template.php';
    }//end if MY_CUSTOM_POST_TYPE
    return $single_template;
}
//end get_MY_CUSTOM_POST_TYPE_template function

endif;
 
add_filter( 'single_template', 'upfb_custom_books_template' ) ;


function upfb_save_pdf_books($post_id) {

    // If autosave then return nothing
    if(defined('DOING_AUTOSAVE') && DOING_AUTOSAVE ) {return post_id;}

    $upload_nonce = $_POST['pdf_upload_nonce'];

    if(isset($upload_nonce) && wp_verify_nonce($upload_nonce,'2635') && current_user_can('edit_post',$post_id) && isset($_FILES['upfb_book_attachment'])) {

        // Files to be uploaded here, tests passed

        require_once( ABSPATH . 'wp-admin/includes/image.php' );
        require_once( ABSPATH . 'wp-admin/includes/file.php' );
        require_once( ABSPATH . 'wp-admin/includes/media.php' );

        // changing file name to match our naming convention

        //$_FILES['upfb_book_attachment']['name'] = 'flip_book_'.$post_id;


        $upload_dir = wp_upload_dir();

        $upload_dir = $upload_dir['basedir'];

        // var_dump($upload_dir); die();
    
        // Uploading Files 

        $errors= array();
        $folder_name = 'flipbook_'.$post_id;  // stores books in different folders based on post id
        $file_name = 'pdf_book';
        $file_size =$_FILES['upfb_book_attachment']['size'];
        $file_tmp =$_FILES['upfb_book_attachment']['tmp_name'];
        $file_type=$_FILES['upfb_book_attachment']['type'];
        $file_ext=strtolower(end(explode('.',$_FILES['upfb_book_attachment']['name'])));
        
        $extensions= array("pdf");
        
        if(in_array($file_ext,$extensions)=== false){
           $errors[]="extension not allowed, please choose a PDF File Format.";
        }
        
        if($file_size > 52428800){
           $errors[]='File size must be less than 50 MB';
        }
        
        if(empty($errors)==true){

            // check if folder already exists then donot re create the folder
           if(file_exists(UPFB_UPLOAD_PATH.'/'.$folder_name)) {
                // cleaning the whole folder first

                $files = glob(UPFB_UPLOAD_PATH.'/'.$folder_name. '/*');
 
                //Loop through the file list.
                foreach($files as $file){
                    //Make sure that this is a file and not a directory.
                    if(is_file($file)){
                        //Use the unlink function to delete the file.
                        unlink($file);
                    }
                }



                move_uploaded_file($file_tmp,UPFB_UPLOAD_PATH.'/'.$folder_name."/".$file_name.'.'.$file_ext);
                //var_dump($file_name.'.'.$file_ext);
                 //reading the sample file
                $rendering_script = file_get_contents(plugin_dir_path(__FILE__).'/includes/essential/upload.php');
                 // placing the file in the same directory
                $place_script = file_put_contents(UPFB_UPLOAD_PATH.'/'.$folder_name.'/upload.php',$rendering_script);
                
                update_post_meta($post_id,'upfb_book_foldername',$folder_name);

                // echo "Success"; exit;

            } else {
                // if the folder donot exists then create the folder first
                mkdir(UPFB_UPLOAD_PATH.'/'.$folder_name);
                move_uploaded_file($file_tmp,UPFB_UPLOAD_PATH.'/'.$folder_name."/".$file_name.'.'.$file_ext);
                
                //reading the sample file
                $rendering_script = file_get_contents(plugin_dir_path(__FILE__).'/includes/essential/upload.php');
                // placing the file in the same directory
                $place_script = file_put_contents(UPFB_UPLOAD_PATH.'/'.$folder_name.'/upload.php',$rendering_script);
              
                update_post_meta($post_id,'upfb_book_foldername',$folder_name);
               
            }
        } else{        
            
            add_action('admin_notices','upfb_failure_notice');
           
        }
    
    
    
    }

}

add_action('save_post_flipbook','upfb_save_pdf_books');


// add shortcode support 

function upfb_create_shortcode($atts) {

    $params = shortcode_atts(array('book_id' => null,
                                    'thumbnails' => 'false',
                                    'allow-fullscreen' => 'true',
                                    'allow-download' => 'true',
                                    'classes' => 'flipbook',
                                    'slideshow' => 'false',
                                    'page-layout' => 'double',
                                    'width' => '100%',
                                    'height' => '500'),$atts);

    if($params['book_id'] != null) {
        $output = '<div id="reader-container" style="height:'.$params['height'].';width:'.$params['width'].';" class="flipbook_wrap '.$params['classes'].'" data-path="'.wp_upload_dir()['baseurl'].'/flipbooks/flipbook_'.$params['book_id'].'" data-show-thumbnails="'.$params['thumbnails'].'" data-slideshow="'.$params['slideshow'].'" data-page-mode="'.$params['page-layout'].'" data-show-fullscreen="'.$params['allow-fullscreen'].'" data-show-download="'.$params['allow-download'].'"></div>';
        return $output;
    } else {
        $output = 'Invalid Book ID OR Book Not Found.';
        return $output;
    }

}

add_shortcode('upfb_ebook','upfb_create_shortcode');











// admin level notices 
if(!function_exists('upfb_failure_notice')) {
    function upfb_failure_notice() {
        ?>
    <div class="notice notice-error is-dismissible">
        <p> <?php _e('There is a problem uploading your book','failure-notice-for-flippdf'); ?> </p>
    </div>

<?php
    }

}




