<div id="poststuff" class="flip-container" >
    <div id="postbox-container-2" class="postbox-container rt-tab-container">
        <h2 class="heading">
            <span>FlipPDF | Shortcode Generator</span>
        </h2>

        <div class="postbox rt-after-title" style="margin-bottom: 0;">
                <div class="inside">
                    <!-- <p>
                        <input type="text" onfocus="this.select();" readonly="readonly" value="[the-post id=&quot;18&quot; title=&quot;Love is life&quot;]" class="large-text code rt-code-sc">
                    </p> -->

                    <p id="allshortcode" class="shortcode" onclick="selectText('allshortcode')" >
                        [upfb_ebook book_id="<span id="pdfId" >XXX</span>" allow-download="<span id="allow_download" >false</span>" thumbnails="<span id="thumbnailsid" >false</span>" classes="<span id="classesid"></span>" slideshow="<span id="slideid">yes</span>"   allow-fullscreen="<span id="flippingid">yes</span>" page-layout="<span id="page_layoutid">auto</span>" width="<span id="cont_widthid">100%</span>" height="<span id="cont_heightid">500px</span>"]
                    </p>

                </div>
            </div>

        <div class="field">
            <div class="field-holder ">
                <div class="field-label">
                    <label>Select PDF</label>
                </div>
                <div class="field">
                    <select id="posts_pdf" class="inner-filed pdf-check" >
                        <option value="" selected>Select a Book</option>
                        <?php
                            $query = new WP_Query( array('post_type' => 'flipbook') );
                            if( $query->have_posts() ): $query->the_posts(); 
                                while ( $query->have_posts() ) : $query->the_post(); ?>
                                <option value="<?php echo get_the_id();?>">
                                    <?php sanitize_text_field(the_title());?>
                                </option>
                                <?php endwhile; wp_reset_postdata(); ?>
                            <?php endif; ?>
                        
                        <!-- <option value="11111">First</option>
                        <option value="22222" >2nd to check</option> -->
                    </select>
                </div>
            </div>
        </div>

        <div class="field">
            <div class="field-holder ">
                <div class="field-label">
                    <label>Allow download</label>
                </div>
                <div class="field">
                    <select id="allow_download_selector" class="inner-filed" >
                        <option value="true">Yes</option>
                        <option value="false" selected>No</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="field">
            <div class="field-holder ">
                <div class="field-label">
                    <label>Show Thumbnails</label>
                </div>
                <div class="field">
                    <select id="thumbnails_pdf" class="inner-filed" >
                        <option value="true">Yes</option>
                        <option value="false" selected>No</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="field">
            <div class="field-holder ">
                <div class="field-label">
                    <label>Extra Classes</label>
                </div>
                <div class="field">
                    <input class="inner-filed" type="text" placeholder="Write space separated classes here" id="classes_pdf">
                </div>
            </div>
        </div>

        <div class="field">
                <div class="field-holder ">
                    <div class="field-label">
                        <label>Slide Show</label>
                    </div>
                    <div class="field">
                            <select id="slide_pdf" class="inner-filed" >
                                    <option value="true">Yes</option>
                                    <option value="no" >No</option>
                            </select>
                    </div>
                </div>
        </div>


        <div class="field">
                <div class="field-holder ">
                    <div class="field-label">
                        <label>Allow Fullscreen</label>
                    </div>
                    <div class="field">
                            <select id="flipping_pdf" class="inner-filed" >
                                    <option value="true">Yes</option>
                                    <option value="false" >No</option>
                            </select>
                    </div>
                </div>
        </div>


        <div class="field">
                <div class="field-holder ">
                    <div class="field-label">
                        <label>Page Layout</label>
                    </div>
                    <div class="field">
                            <select id="page_layout" class="inner-filed" >
                                    <option value="auto" selected>Auto</option>
                                    <option value="double" >Double</option>
                                    <option value="single" >Single</option>
                            </select>
                    </div>
                </div>
        </div>

    <!-- // Page width -->
        <div class="field">
            <div class="field-holder ">
                <div class="field-label">
                    <label>Container Width</label>
                </div>
                <div class="field">
                    <input class="inner-filed" type="text" placeholder="In percentage or px (eg : 100% OR 400px)" value="100%" id="container_width">
                </div>
            </div>
        </div>


        <!-- Page height  -->

        <div class="field">
            <div class="field-holder ">
                <div class="field-label">
                    <label>Container Height</label>
                </div>
                <div class="field">
                    <input class="inner-filed" type="text" placeholder="In pixels (eg: 600px)" value="500px" id="container_height">
                </div>
            </div>
        </div>

       
</div>