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
 define('UPLOAD_FOLDER_NAME','flipbooks');
 define('FPDF_UPLOAD_PATH',wp_upload_dir()['basedir'].'/'.UPLOAD_FOLDER_NAME);

 // creating flipbooks folder if donot exist in the wp-content/uploads
 if(!function_exists('fpdf_check_uploading_directory')) {
    function fpdf_check_uploading_directory() {
        if(!file_exists(FPDF_UPLOAD_PATH)) {
            mkdir(FPDF_UPLOAD_PATH);
        }
    }
}
register_activation_hook(__FILE__,'fpdf_check_uploading_directory');


function fpdf_enqueue_styles() {
    wp_enqueue_style( 'flippdf_css', plugins_url().'/flipPDF/includes/css/magalone.min.css');
    wp_enqueue_style( 'maglone_font', 'https://fonts.googleapis.com/icon?family=Material+Icons');
    wp_enqueue_script('flippdf_js', plugins_url().'/flipPDF/includes/js/magalone.min.js');
}
function fpdf_admin_enqueue_styles() {
    wp_enqueue_style( 'custom_css', plugins_url() . '/flipPDF/includes/css/custom_style.css');
    wp_enqueue_script( 'custom_js_admin', plugins_url() . '/flipPDF/includes/js/admin_js.js');
}
add_action( 'wp_enqueue_scripts', 'fpdf_enqueue_styles' );
add_action( 'admin_enqueue_scripts', 'fpdf_admin_enqueue_styles' );
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


add_action('admin_menu', 'fpdf_my_admin_menu'); 
function fpdf_my_admin_menu() {  

    // var_dump(plugin_dir_path(__FILE__)); die();
        add_submenu_page('edit.php?post_type=flipbook', 
        'Settings', 
        'Settings', 
        8, 
        'settings-page', 
        'fpdf_settings_show');
}

function fpdf_settings_show(){
    // Get all output for settings page
    require('settings.php');
}


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

    $post_id = get_the_ID();
    $post_meta =  get_post_meta($post_id,'fpdf_book_foldername',true);
    $html = wp_nonce_field('2635','pdf_upload_nonce',true,false);

    if(!empty($post_meta)) {
        $html .= '<strong class="already_attached">Already have a book Attached, reuploading will override it.</strong>';
    }
    

    $html .= '<p class="description">';
    $html .= 'Upload your PDF Book here.';
    $html .= '</p>';
    $html .= '<input type="file" id="fpdf_book_attachment" name="fpdf_book_attachment" value="" size="25">';
    echo $html;
}



//saving uploaded files Ghost code

// add_action('save_post_flipbook', 'fpdf_save_custom_meta_data');
// function fpdf_save_custom_meta_data($id) {
//     if(!empty($_FILES['wp_custom_attachment']['name'])) {
//         $supported_types = array('application/pdf');
//         $arr_file_type = wp_check_filetype(basename($_FILES['wp_custom_attachment']['name']));
//         $uploaded_type = $arr_file_type['type'];
//         if(in_array($uploaded_type, $supported_types)) {
//             $upload = wp_upload_bits($_FILES['wp_custom_attachment']['name'], null, file_get_contents($_FILES['wp_custom_attachment']['tmp_name']));
//             if(isset($upload['error']) && $upload['error'] != 0) {
//                 wp_die('There was an error uploading your file. The error is: ' . $upload['error']);
//             } else {
//                 update_post_meta($id, 'fpdf_book_attachment', $upload);
//             }
//         }
//         else {
//             wp_die("The file type that you've uploaded is not a PDF.");
//         }
//     }
// }




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


function fpdf_save_pdf_books($post_id) {

    // If autosave then return nothing
    if(defined('DOING_AUTOSAVE') && DOING_AUTOSAVE ) {return post_id;}

    $upload_nonce = $_POST['pdf_upload_nonce'];

    if(isset($upload_nonce) && wp_verify_nonce($upload_nonce,'2635') && current_user_can('edit_post',$post_id) && isset($_FILES['fpdf_book_attachment'])) {

        // Files to be uploaded here, tests passed

        require_once( ABSPATH . 'wp-admin/includes/image.php' );
        require_once( ABSPATH . 'wp-admin/includes/file.php' );
        require_once( ABSPATH . 'wp-admin/includes/media.php' );

        // changing file name to match our naming convention

        //$_FILES['fpdf_book_attachment']['name'] = 'flip_book_'.$post_id;


        $upload_dir = wp_upload_dir();

        $upload_dir = $upload_dir['basedir'];

        // var_dump($upload_dir); die();
    
        // Uploading Files 

        $errors= array();
        $folder_name = 'flipbook_'.$post_id;  // stores books in different folders based on post id
        $file_name = 'pdf_book';
        $file_size =$_FILES['fpdf_book_attachment']['size'];
        $file_tmp =$_FILES['fpdf_book_attachment']['tmp_name'];
        $file_type=$_FILES['fpdf_book_attachment']['type'];
        $file_ext=strtolower(end(explode('.',$_FILES['fpdf_book_attachment']['name'])));
        
        $extensions= array("pdf");
        
        if(in_array($file_ext,$extensions)=== false){
           $errors[]="extension not allowed, please choose a PDF File Format.";
        }
        
        if($file_size > 52428800){
           $errors[]='File size must be less than 50 MB';
        }
        
        if(empty($errors)==true){

            // check if folder already exists then donot re create the folder
           if(file_exists(FPDF_UPLOAD_PATH.'/'.$folder_name)) {
                // cleaning the whole folder first

                $files = glob(FPDF_UPLOAD_PATH.'/'.$folder_name. '/*');
 
                //Loop through the file list.
                foreach($files as $file){
                    //Make sure that this is a file and not a directory.
                    if(is_file($file)){
                        //Use the unlink function to delete the file.
                        unlink($file);
                    }
                }



                move_uploaded_file($file_tmp,FPDF_UPLOAD_PATH.'/'.$folder_name."/".$file_name.'.'.$file_ext);
                //var_dump($file_name.'.'.$file_ext);
                 //reading the sample file
                $rendering_script = file_get_contents(plugin_dir_path(__FILE__).'/includes/documents/doc1/upload.php');
                 // placing the file in the same directory
                $place_script = file_put_contents(FPDF_UPLOAD_PATH.'/'.$folder_name.'/upload.php',$rendering_script);
                
                update_post_meta($post_id,'fpdf_book_foldername',$folder_name);

                // echo "Success"; exit;

            } else {
                // if the folder donot exists then create the folder first
                mkdir(FPDF_UPLOAD_PATH.'/'.$folder_name);
                move_uploaded_file($file_tmp,FPDF_UPLOAD_PATH.'/'.$folder_name."/".$file_name.'.'.$file_ext);
                
                //reading the sample file
                $rendering_script = file_get_contents(plugin_dir_path(__FILE__).'/includes/documents/doc1/upload.php');
                // placing the file in the same directory
                $place_script = file_put_contents(FPDF_UPLOAD_PATH.'/'.$folder_name.'/upload.php',$rendering_script);
              
                update_post_meta($post_id,'fpdf_book_foldername',$folder_name);
               
            }
        } else{        
            
            add_action('admin_notices','fpdf_failure_notice');
           
        }
    
    
    
    }

}

add_action('save_post_flipbook','fpdf_save_pdf_books');


// add shortcode support 

function fpdf_create_shortcode($atts) {

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

add_shortcode('fpdf_ebook','fpdf_create_shortcode');











// admin level notices 
if(!function_exists('fpdf_failure_notice')) {
    function fpdf_failure_notice() {
        ?>
    <div class="notice notice-error is-dismissible">
        <p> <?php _e('There is a problem uploading your book','failure-notice-for-flippdf'); ?> </p>
    </div>

<?php
    }

}




