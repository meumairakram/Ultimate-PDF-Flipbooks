/// <reference path="_references.js" />



(function InitProcessor(window)

{

    if (window['exHelp'] == void 0 || window['exHelpExtend'] == void 0 || window['exHelp']['e'] == void 0)

    {

        return setTimeout(InitProcessor, 100, window);

    }



    // Create shorthand

    var p = exHelp;



    var processor =

        {

            processing:

                {

                    progress_max: -1,

                    progress_now: 0,

                    progress_page: 0,

                    progress_mode: "render",

                    path: null,

                    canvas: null,

                    preview_image: null,



                    current_script: null,

                    elements: [

                        {

                            selector: ".generator",

                            options: { "class": "generator" },



                            children:

                                [

                                    {

                                        selector: ".title",

                                        options: { "class": "title", "html": "__LOCALE__:PROCESSING_TITLE" }

                                    },

                                    {

                                        selector: ".text",

                                        options: { "class": "text", "html": "__LOCALE__:PROCESSING_TEXT" }

                                    },

                                    {

                                        selector: ".progress",

                                        options: { "class": "progress indeterminate" },

                                        children:

                                            [

                                                {

                                                    selector: ".bar",

                                                    options: { "class": "bar" }

                                                }

                                            ]

                                    },

                                    {

                                        selector: ".info",

                                        options: { "class": "info", html: "__LOCALE__:PROCESSING_INIT" }

                                    }

                                ]

                        }

                    ],



                    pdf_exists: false,

                    pdf_checked: false,

                    pdf_checking: false,

                    pdf_enabled: false,

                    pdf_preparing: false,

                    pdf_loaded: false,

                    pdf_loaded_load: false,

                    pdf_loaded_progess: false,



                    data: {

                        cover_small: null,

                        cover_medium: null,

                        cover_big: null,

                        cover_retina: null,

                        json: null,

                        pages: null,

                    },



                    working: false,



                    init: function (path)

                    {

                        console.log(path);

                        this.path = path;

                        this.preparePdf();

                        p.e(".status").addClass("gone");

                        this.prepareElements();

                    },



                    prepareElements: function ()

                    {

                        var $this = p.processing;

                        for (var key in $this.elements)

                        {

                            p.reader._prepareElement($this.elements[key], p.reader.container);

                        }



                        var content_container = p.e(".content .pages");

                        content_container.addClass("single");

                        var render_page = p.e("<div>", { "class": "page", "style": "width: 100%; height: 100%;" });

                        var wrapper = p.e("<div>", { "class": "wrapper" }).appendTo(render_page);



                        $this.preview_image = p.e("<img>").appendTo(wrapper);



                        $this.canvas = p.e("<canvas>");

                        $this.canvas.appendTo(render_page);



                        render_page.appendTo(content_container);

                    },

                    setProgress: function (perc, text)

                    {

                        var progress = p.e(".generator .progress");

                        var bar = p.e(".generator .progress .bar");

                        var info = p.e(".generator .info");



                        if (p.is.number(perc))

                        {

                            if (parseInt(perc) >= 0)

                            {

                                bar.setStyle("width", perc + "%");

                                progress.removeClass("indeterminate");

                            }

                            else

                            {

                                bar.setStyle("width", "");

                                progress.addClass("indeterminate");

                            }



                            if (text)

                            {

                                info.setHtml(text);

                            }

                        }

                        else

                        {

                            if (p.is.string(perc))

                                info.setHtml(perc);

                        }

                    },





                    start_processing: function ()

                    {

                        var $this = p.processing;

                        if (!$this.working)

                        {

                            $this.working = true;

                            //console.log("Work start");

                            $this.setProgress(-1, p.locale.getString("PROCESSING_PREPARING").format(p.PDFManager.document.numPages)); //"Vorbereiten von " + p.PDFManager.document.numPages + " Seiten...");



                            var doThumb = 1,

                                doPage = 1,

                                doParse = 1,

                                doCoverSmall = 1,

                                doCoverMedium = 1,

                                doCoverRetina = 1,

                                doCoverBig = 1,

                                doUpload = 1;

                            $this.progress_max = (p.PDFManager.document.numPages * (2 + doThumb + doPage + doParse + doUpload)) + ((doCoverSmall + doCoverMedium + doCoverRetina + doCoverBig) * (1 + doUpload));

                            $this.progress_now = 0;

                            $this.progress_page = 0;

                            $this.progress_mode = "render";

                            p.PDFManager.scale = 2.0;



                            $this.data = {

                                cover_small: null,

                                cover_medium: null,

                                cover_big: null,

                                cover_retina: null,

                                json: {},

                                pages: {},

                            };



                            //console.log("Starting work with " + $this.progress_max + " steps");



                            $this.processing_step();



                        }

                    },



                    downScaleImage: function downScaleImage(img, scale)

                    {

                        var imgCV = document.createElement('canvas');

                        imgCV.width = img.width;

                        imgCV.height = img.height;

                        var imgCtx = imgCV.getContext('2d');

                        imgCtx.drawImage(img, 0, 0);

                        return this.downScaleCanvas(imgCV, scale);

                    },



                    downScaleCanvas: function downScaleCanvas(cv, scale)

                    {

                        if (!(scale < 1) || !(scale > 0)) throw ('scale must be a positive number <1 ');

                        var sqScale = scale * scale; // square scale = area of source pixel within target

                        var sw = cv.width; // source image width

                        var sh = cv.height; // source image height

                        var tw = Math.floor(sw * scale); // target image width

                        var th = Math.floor(sh * scale); // target image height

                        var sx = 0, sy = 0, sIndex = 0; // source x,y, index within source array

                        var tx = 0, ty = 0, yIndex = 0, tIndex = 0; // target x,y, x,y index within target array

                        var tX = 0, tY = 0; // rounded tx, ty

                        var w = 0, nw = 0, wx = 0, nwx = 0, wy = 0, nwy = 0; // weight / next weight x / y

                        // weight is weight of current source point within target.

                        // next weight is weight of current source point within next target's point.

                        var crossX = false; // does scaled px cross its current px right border ?

                        var crossY = false; // does scaled px cross its current px bottom border ?

                        var sBuffer = cv.getContext('2d').

                        getImageData(0, 0, sw, sh).data; // source buffer 8 bit rgba

                        var tBuffer = new Float32Array(3 * tw * th); // target buffer Float32 rgb

                        var sR = 0, sG = 0, sB = 0; // source's current point r,g,b

                        /* untested !

                        var sA = 0;  //source alpha  */



                        for (sy = 0; sy < sh; sy++)

                        {

                            ty = sy * scale; // y src position within target

                            tY = 0 | ty;     // rounded : target pixel's y

                            yIndex = 3 * tY * tw;  // line index within target array

                            crossY = (tY != (0 | ty + scale));

                            if (crossY)

                            { // if pixel is crossing botton target pixel

                                wy = (tY + 1 - ty); // weight of point within target pixel

                                nwy = (ty + scale - tY - 1); // ... within y+1 target pixel

                            }

                            for (sx = 0; sx < sw; sx++, sIndex += 4)

                            {

                                tx = sx * scale; // x src position within target

                                tX = 0 | tx;    // rounded : target pixel's x

                                tIndex = yIndex + tX * 3; // target pixel index within target array

                                crossX = (tX != (0 | tx + scale));

                                if (crossX)

                                { // if pixel is crossing target pixel's right

                                    wx = (tX + 1 - tx); // weight of point within target pixel

                                    nwx = (tx + scale - tX - 1); // ... within x+1 target pixel

                                }

                                sR = sBuffer[sIndex];   // retrieving r,g,b for curr src px.

                                sG = sBuffer[sIndex + 1];

                                sB = sBuffer[sIndex + 2];



                                /* !! untested : handling alpha !!

                                   sA = sBuffer[sIndex + 3];

                                   if (!sA) continue;

                                   if (sA != 0xFF) {

                                       sR = (sR * sA) >> 8;  // or use /256 instead ??

                                       sG = (sG * sA) >> 8;

                                       sB = (sB * sA) >> 8;

                                   }

                                */

                                if (!crossX && !crossY)

                                { // pixel does not cross

                                    // just add components weighted by squared scale.

                                    tBuffer[tIndex] += sR * sqScale;

                                    tBuffer[tIndex + 1] += sG * sqScale;

                                    tBuffer[tIndex + 2] += sB * sqScale;

                                } else if (crossX && !crossY)

                                { // cross on X only

                                    w = wx * scale;

                                    // add weighted component for current px

                                    tBuffer[tIndex] += sR * w;

                                    tBuffer[tIndex + 1] += sG * w;

                                    tBuffer[tIndex + 2] += sB * w;

                                    // add weighted component for next (tX+1) px                

                                    nw = nwx * scale

                                    tBuffer[tIndex + 3] += sR * nw;

                                    tBuffer[tIndex + 4] += sG * nw;

                                    tBuffer[tIndex + 5] += sB * nw;

                                } else if (crossY && !crossX)

                                { // cross on Y only

                                    w = wy * scale;

                                    // add weighted component for current px

                                    tBuffer[tIndex] += sR * w;

                                    tBuffer[tIndex + 1] += sG * w;

                                    tBuffer[tIndex + 2] += sB * w;

                                    // add weighted component for next (tY+1) px                

                                    nw = nwy * scale

                                    tBuffer[tIndex + 3 * tw] += sR * nw;

                                    tBuffer[tIndex + 3 * tw + 1] += sG * nw;

                                    tBuffer[tIndex + 3 * tw + 2] += sB * nw;

                                } else

                                { // crosses both x and y : four target points involved

                                    // add weighted component for current px

                                    w = wx * wy;

                                    tBuffer[tIndex] += sR * w;

                                    tBuffer[tIndex + 1] += sG * w;

                                    tBuffer[tIndex + 2] += sB * w;

                                    // for tX + 1; tY px

                                    nw = nwx * wy;

                                    tBuffer[tIndex + 3] += sR * nw;

                                    tBuffer[tIndex + 4] += sG * nw;

                                    tBuffer[tIndex + 5] += sB * nw;

                                    // for tX ; tY + 1 px

                                    nw = wx * nwy;

                                    tBuffer[tIndex + 3 * tw] += sR * nw;

                                    tBuffer[tIndex + 3 * tw + 1] += sG * nw;

                                    tBuffer[tIndex + 3 * tw + 2] += sB * nw;

                                    // for tX + 1 ; tY +1 px

                                    nw = nwx * nwy;

                                    tBuffer[tIndex + 3 * tw + 3] += sR * nw;

                                    tBuffer[tIndex + 3 * tw + 4] += sG * nw;

                                    tBuffer[tIndex + 3 * tw + 5] += sB * nw;

                                }

                            } // end for sx 

                        } // end for sy



                        // create result canvas

                        var resCV = document.createElement('canvas');

                        resCV.width = tw;

                        resCV.height = th;

                        var resCtx = resCV.getContext('2d');

                        var imgRes = resCtx.getImageData(0, 0, tw, th);

                        var tByteBuffer = imgRes.data;

                        // convert float32 array into a UInt8Clamped Array

                        var pxIndex = 0; //  

                        for (sIndex = 0, tIndex = 0; pxIndex < tw * th; sIndex += 3, tIndex += 4, pxIndex++)

                        {

                            tByteBuffer[tIndex] = Math.ceil(tBuffer[sIndex]);

                            tByteBuffer[tIndex + 1] = Math.ceil(tBuffer[sIndex + 1]);

                            tByteBuffer[tIndex + 2] = Math.ceil(tBuffer[sIndex + 2]);

                            tByteBuffer[tIndex + 3] = 255;

                        }

                        // writing result to canvas.

                        resCtx.putImageData(imgRes, 0, 0);

                        return resCV;

                    },



                    resize: function (image, size)

                    {

                        var ratio = size.width / image.naturalWidth;

                        return this.downScaleImage(image, ratio);

                    },



                    processing_step: function ()

                    {

                        var $this = p.processing;

                        console.log("Processing Step");

                        if ($this.working)

                        {

                            if ($this.progress_mode == "render")

                            {

                                if ($this.progress_page < p.PDFManager.document.numPages)

                                {

                                    $this.progress_magalone

                                    $this.processing_increment_progress();



                                    p.PDFManager.renderPageOn($this.progress_page, $this.canvas, function ()

                                    {

                                        var image = new Image();

                                        image.src = $this.canvas[0].toDataURL();

                                        image.onload = function ()

                                        {

                                            $this.data.pages[$this.progress_page] =

                                                {

                                                    full: $this.canvas[0].toDataURL("image/jpeg", 0.85),

                                                    thumb: null

                                                };



                                            $this.processing_increment_progress();



                                            var ratio = image.naturalHeight / image.naturalWidth;

                                            var size_small = { width: 100, height: 100 * ratio };



                                            // Make cover images from first page

                                            if ($this.progress_page == 1)

                                            {

                                                // Big

                                                $this.data.cover_big = $this.canvas[0].toDataURL("image/jpeg", 0.85);

                                                $this.processing_increment_progress();



                                                var size_medium = { width: size_small.width * 2, height: size_small.height * 2 };

                                                var size_retina = { width: size_small.width * 3, height: size_small.height * 3 };



                                                // Retina

                                                $this.data.cover_retina = $this.resize(image, size_retina).toDataURL("image/jpeg", 0.85);

                                                $this.processing_increment_progress();



                                                // Medium

                                                $this.data.cover_medium = $this.resize(image, size_medium).toDataURL("image/jpeg", 0.85);

                                                $this.processing_increment_progress();



                                                // Small

                                                $this.data.cover_small = $this.resize(image, size_small).toDataURL("image/jpeg", 0.85);

                                                $this.processing_increment_progress();

                                            }



                                            $this.data.pages[$this.progress_page].thumb = $this.resize(image, size_small).toDataURL("image/jpeg", 0.85);

                                            $this.processing_increment_progress();



                                            p.PDFManager.getPage($this.progress_page, function (page)

                                            {

                                                page.getTextContent().then(function (textContent)

                                                {

                                                    var pageTextArr = [];



                                                    for (var x = 0; x < textContent.items.length; x++)

                                                    {

                                                        var str = "" + textContent.items[x].str.trim();

                                                        if (str.length > 0)

                                                        {

                                                            pageTextArr.push(str);

                                                        }

                                                    }



                                                    $this.data.json[$this.progress_page] = {

                                                        page_content: p.utf8_encode(pageTextArr.join(" ")),

                                                        ref_size: { width: image.naturalWidth, height: image.naturalHeight }

                                                    };

                                                    $this.processing_increment_progress();



                                                    $this.processing_step();

                                                });

                                            });

                                        };



                                    }, true);

                                }

                                else

                                {

                                    $this.progress_mode = "upload";

                                    $this.progress_page = 0;

                                    $this.processing_step();

                                }

                            }

                            else if ($this.progress_mode == "upload")

                            {

                                if ($this.progress_page < p.PDFManager.document.numPages)

                                {

                                    $this.progress_page++;

                                    $this.processing_increment_progress_upload();



                                    if ($this.progress_page == 1)

                                    {

                                        p.net.request($this.path + "/upload.php",

                                            {

                                                method: "POST",

                                                data:

                                                    {

                                                        cmd: "upload",

                                                        type: "page",

                                                        transfer: "base64",

                                                        file: $this.data.pages[$this.progress_page].full,

                                                        page: $this.progress_page

                                                    },

                                                finished: function (success, data)

                                                {

                                                    $this.processing_increment_progress_upload();

                                                    p.net.request($this.path + "/upload.php",

                                                        {

                                                            method: "POST",

                                                            data:

                                                                {

                                                                    cmd: "upload",

                                                                    type: "thumb",

                                                                    transfer: "base64",

                                                                    file: $this.data.pages[$this.progress_page].thumb,

                                                                    page: $this.progress_page

                                                                },

                                                            finished: function (success, data)

                                                            {

                                                                $this.processing_increment_progress_upload();

                                                                p.net.request($this.path + "/upload.php",

                                                                    {

                                                                        method: "POST",

                                                                        data:

                                                                            {

                                                                                cmd: "upload",

                                                                                type: "cover_small",

                                                                                transfer: "base64",

                                                                                file: $this.data.cover_small,

                                                                            },

                                                                        finished: function (success, data)

                                                                        {

                                                                            $this.processing_increment_progress_upload();

                                                                            p.net.request($this.path + "/upload.php",

                                                                                {

                                                                                    method: "POST",

                                                                                    data:

                                                                                        {

                                                                                            cmd: "upload",

                                                                                            type: "cover_medium",

                                                                                            transfer: "base64",

                                                                                            file: $this.data.cover_medium,

                                                                                        },

                                                                                    finished: function (success, data)

                                                                                    {

                                                                                        $this.processing_increment_progress_upload();

                                                                                        p.net.request($this.path + "/upload.php",

                                                                                            {

                                                                                                method: "POST",

                                                                                                data:

                                                                                                    {

                                                                                                        cmd: "upload",

                                                                                                        type: "cover_retina",

                                                                                                        transfer: "base64",

                                                                                                        file: $this.data.cover_retina,

                                                                                                    },

                                                                                                finished: function (success, data)

                                                                                                {

                                                                                                    $this.processing_increment_progress_upload();

                                                                                                    p.net.request($this.path + "/upload.php",

                                                                                                        {

                                                                                                            method: "POST",

                                                                                                            data:

                                                                                                                {

                                                                                                                    cmd: "upload",

                                                                                                                    type: "cover_big",

                                                                                                                    transfer: "base64",

                                                                                                                    file: $this.data.cover_big,

                                                                                                                },

                                                                                                            finished: function (success, data)

                                                                                                            {

                                                                                                                $this.processing_step();

                                                                                                            }

                                                                                                        });

                                                                                                }

                                                                                            });

                                                                                    }

                                                                                });

                                                                        }

                                                                    });

                                                            }

                                                        });

                                                }

                                            });

                                    }

                                    else

                                    {

                                        p.net.request($this.path + "/upload.php",

                                            {

                                                method: "POST",

                                                data:

                                                    {

                                                        cmd: "upload",

                                                        type: "page",

                                                        transfer: "base64",

                                                        file: $this.data.pages[$this.progress_page].full,

                                                        page: $this.progress_page

                                                    },

                                                finished: function (success, data)

                                                {

                                                    $this.processing_increment_progress_upload();

                                                    p.net.request($this.path + "/upload.php",

                                                        {

                                                            method: "POST",

                                                            data:

                                                                {

                                                                    cmd: "upload",

                                                                    type: "thumb",

                                                                    transfer: "base64",

                                                                    file: $this.data.pages[$this.progress_page].thumb,

                                                                    page: $this.progress_page

                                                                },

                                                            finished: function (success, data)

                                                            {

                                                                $this.processing_step();

                                                            }

                                                        });

                                                }

                                            });

                                    }

                                }

                                else

                                {

                                    // Upload JSON

                                    /*

                                     var json = p.jsonStringify(obj);

                                        var json64 = "data:application/json;base64," + btoa(json);

                                    */

                                    p.net.request($this.path + "/upload.php",

                                        {

                                            method: "POST",

                                            data:

                                                {

                                                    cmd: "upload",

                                                    type: "json",

                                                    transfer: "base64",

                                                    file: "data:application/json;base64," + btoa(p.jsonStringify($this.data.json))

                                                },

                                            finished: function (success, data)

                                            {

                                                $this.processing_increment_progress_upload();

                                                $this.setProgress(-1, "Aufräumen...");



                                                p.net.request($this.path + "/upload.php",

                                                    {

                                                        method: "POST",

                                                        data:

                                                            {

                                                                cmd: "cleanup"

                                                            },

                                                        finished: function (success, data)

                                                        {

                                                            $this.setProgress(100, p.locale.getString("PROCESSING_FINISHED"));

                                                            window.location.reload();

                                                        }

                                                    });

                                            }

                                        });

                                }

                            }

                        }

                    },

                    processing_increment_progress: function ()

                    {

                        var $this = p.processing;

                        $this.setProgress(

                            p.math.Percentage.XofY($this.progress_now++, $this.progress_max),

                            p.locale.getString("PROCESSING_WORKING").format($this.progress_page, p.PDFManager.document.numPages)

                            );

                    },

                    processing_increment_progress_upload: function ()

                    {

                        var $this = p.processing;

                        $this.setProgress(

                            p.math.Percentage.XofY($this.progress_now++, $this.progress_max),

                            p.locale.getString("PROCESSING_UPLOADING").format($this.progress_page, p.PDFManager.document.numPages)

                            );

                    },



                    preparePdf: function ()

                    {

                        var $this = p.processing;



                        $this.setProgress(-1, p.locale.getString("PROCESSING_PREP"));



                        if (!$this.pdf_checked && !$this.pdf_checking)

                        {

                            $this.pdf_checking = true;

                            p.net.request($this.path + "/upload.php",

                                                    {

                                                        method: "POST",

                                                        data:

                                                            {

                                                                cmd: "prepare"

                                                            },

                                                        finished: function (success, data)

                                                        {

                                                            if (success)

                                                            {

                                                                if (data.trim() == "ok")

                                                                {

                                                                    p.net.request($this.path + "/full.pdf",

                                                                        {

                                                                            method: "HEAD",

                                                                            finished: function (success, data)

                                                                            {

                                                                                $this.pdf_exists = success;

                                                                                $this.pdf_checked = true;

                                                                                $this.pdf_checking = false;



                                                                                if (success)

                                                                                {

                                                                                    $this.pdf_preparing = true;

                                                                                    $this.preparePdfJs();

                                                                                }

                                                                            }

                                                                        });

                                                                }

                                                                else if (data.trim() == "nopdf")

                                                                {

                                                                    p.reader.makeMessage(p.locale.getString("ERROR_TITLE"), p.locale.getString("ERROR_NO_PDF")).appendTo($this.container);

                                                                }

                                                                else

                                                                {

                                                                    p.reader.makeMessage(p.locale.getString("ERROR_TITLE"), p.locale.getString("ERROR_UPLOAD_PHP")).appendTo($this.container);

                                                                }

                                                            }

                                                            else

                                                            {

                                                                p.reader.makeMessage(p.locale.getString("ERROR_TITLE"), p.locale.getString("ERROR_UPLOAD_PHP")).appendTo($this.container);

                                                            }

                                                        }

                                                    });

                        }

                    },

                    preparePdfJs: function ()

                    {

                        var $this = p.processing;

                        var scriptTags = p.e("script");

                        var currentScript = null;

                        scriptTags.each(function ()

                        {

                            if (this.src.contains("magalone."))

                            {

                                currentScript = this.src;

                                return false;

                            }

                        });



                        if (currentScript != null)

                        {

                            $this.current_script = currentScript;



                            $this.loadPdfJsCompat(function ()

                            {

                                $this.loadPdfJsMain(function ()

                                {

                                    $this.pdf_preparing = false;

                                    $this.pdf_enabled = true;

                                    p.PDFManager.setOnDocumentLoadHandler($this.pdfJsOnLoad);

                                    p.PDFManager.setOnDocumentProgressHandler($this.pdfJsOnProgress);

                                    p.PDFManager.setOnPageLoadHandler($this.pdfJsOnPage);

                                    p.PDFManager.setOnPageRenderHandler($this.pdfJsOnRender);

                                    p.PDFManager.loadFile($this.path + "/full.pdf");

                                });

                            });

                        }

                    },

                    loadPdfJsCompat: function (callback)

                    {

                        var $this = p.processing;

                        var currentPath = $this.current_script.substr(0, $this.current_script.lastIndexOf("/"));

                        var pdfJsPath = currentPath + "/pdfjs/compatibility" + ($this.current_script.contains(".min") ? ".min" : "") + ".js";



                        var pdfJsScriptElement = document.createElement("script");

                        var pdfJsLoaded = false;

                        pdfJsScriptElement.onload = function ()

                        {

                            if (!pdfJsLoaded)

                            {

                                callback();

                            }



                            pdfJsLoaded = true;

                        };

                        pdfJsScriptElement.setAttribute("src", pdfJsPath);

                        document.getElementsByTagName('head')[0].appendChild(pdfJsScriptElement);

                    },

                    loadPdfJsMain: function (callback)

                    {

                        var $this = p.processing;

                        var currentPath = $this.current_script.substr(0, $this.current_script.lastIndexOf("/"));

                        var pdfJsPath = currentPath + "/pdfjs/pdf" + ($this.current_script.contains(".min") ? ".min" : "") + ".js";



                        var pdfJsScriptElement = document.createElement("script");

                        var pdfJsLoaded = false;

                        pdfJsScriptElement.onload = function ()

                        {

                            if (!pdfJsLoaded)

                            {

                                callback();

                            }



                            pdfJsLoaded = true;

                        };

                        pdfJsScriptElement.setAttribute("src", pdfJsPath);

                        document.getElementsByTagName('head')[0].appendChild(pdfJsScriptElement);

                    },



                    pdfJsOnLoad: function (e)

                    {

                        var $this = p.processing;

                        $this.pdf_loaded_load = true;



                        $this.pdf_loaded = $this.pdf_loaded_load && $this.pdf_loaded_progess;

                        if ($this.pdf_loaded)

                        {

                            $this.start_processing();

                        }

                    },

                    pdfJsOnProgress: function (e)

                    {

                        var $this = p.processing;



                        var perc = p.math.Percentage.XofY(e.loaded, e.total);

                        //p.reader.setProgress(perc);

                        if (!$this.pdf_loaded)

                            $this.setProgress(perc,

                                p.locale.getString("PROCESSING_PDF").format(perc.toFixed(0)));



                        if (perc >= 100)

                        {

                            $this.pdf_loaded_progess = true;



                            $this.pdf_loaded = $this.pdf_loaded_load && $this.pdf_loaded_progess;

                            if ($this.pdf_loaded)

                            {

                                $this.start_processing();

                            }

                        }

                    },

                    pdfJsOnPage: function (e)

                    {

                        //console.log(e);

                    },

                    pdfJsOnRender: function (e)

                    {

                        //console.log(e);

                    }

                }

        };



    exHelp.extend(processor);

})(window);