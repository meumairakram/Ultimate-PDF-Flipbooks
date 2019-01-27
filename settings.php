<div id="poststuff" class="flip-container" >
    <div id="postbox-container-2" class="postbox-container rt-tab-container">
        <h2 class="heading">
            <span>Short Code Generator</span>
        </h2>

        <div class="postbox rt-after-title" style="margin-bottom: 0;">
                <div class="inside">
                    <!-- <p>
                        <input type="text" onfocus="this.select();" readonly="readonly" value="[the-post id=&quot;18&quot; title=&quot;Love is life&quot;]" class="large-text code rt-code-sc">
                    </p> -->

                    <p id="allshortcode" class="shortcode" onclick="selectText('allshortcode')" >
                        [title="Flip PDF" ThePostid="<span id="pdfId" >XXX</span>" Zoom="<span id="zoomId" >yes</span>" Thumbnails="<span id="thumbnailsid" >yes</span>" Classes="<span id="classesid"></span>" SlideShow="<span id="slideid">yes</span>"   EnableFlippingSound="<span id="flippingid">yes</span>" ]
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
                        <option value="11111">First</option>
                        <option value="22222" >2nd to check</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="field">
            <div class="field-holder ">
                <div class="field-label">
                    <label>Show Zoom</label>
                </div>
                <div class="field">
                    <select id="zoom_pdf" class="inner-filed" >
                        <option value="yes">Yes</option>
                        <option value="no" >No</option>
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
                        <option value="yes">Yes</option>
                        <option value="no" >No</option>
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
                                    <option value="yes">Yes</option>
                                    <option value="no" >No</option>
                            </select>
                    </div>
                </div>
        </div>


        <div class="field">
                <div class="field-holder ">
                    <div class="field-label">
                        <label>Enable Flipping Sound</label>
                    </div>
                    <div class="field">
                            <select id="flipping_pdf" class="inner-filed" >
                                    <option value="yes">Yes</option>
                                    <option value="no" >No</option>
                            </select>
                    </div>
                </div>
        </div>

       
</div>