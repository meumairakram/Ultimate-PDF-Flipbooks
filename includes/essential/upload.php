<?php


function MoveFile($file, $target, $type)
{
    $path_dir = dirname($target);
    if(!file_exists($path_dir))
    {
        if(mkdir($path_dir, 0755, true) == false)
            return false;
    }
    
    if(file_exists($path_dir) && is_dir($path_dir))
    {
        if($type == "base64")
        {            
            $handle = fopen($target, "w");
            if($handle != false)
            {
                if(fwrite($handle, $file) != false)
                {
                    fflush($handle);
                    fclose($handle);
                    return true;
                }
            }
        }
        else if($type == "put")
        {
            $temp_path = $file["tmp_name"];
            if(move_uploaded_file($temp_path, $target))
            {
                return true;
            }
        }
        else if($type == "move")
        {
            return rename($file, $target);
        }
    }
    
    return false;
}

function EndsWith($needle, $haystack)
{
    return $needle === "" || substr($haystack, -strlen($needle)) === $needle;
}

function FindPdf()
{
    $folder = __DIR__;
    $files = scandir($folder);
    for($i = 0; $i < count($files); $i++)
    {
        $filename_lower = strtolower($files[$i]);
        if(EndsWith(".pdf", $filename_lower))
        {
            return $files[$i];
        }
    }

    return null;
}

$cmd = isset($_POST["cmd"]) ? $_POST["cmd"] : (isset($_GET["cmd"]) ? $_GET["cmd"] : null);
switch($cmd)
{
    case "ping":
        echo "pong";
        break;

    case "prepare":
        $pdfFile = FindPdf();
        if($pdfFile === null)
        {
            echo "nopdf";
        }
        else
        {
            $source_path_bits = [__DIR__, $pdfFile];
            $target_path_bits = [__DIR__, "full.pdf"];

            echo MoveFile(implode(DIRECTORY_SEPARATOR, $source_path_bits), implode(DIRECTORY_SEPARATOR, $target_path_bits), "move") == true ? "ok" : "fail";            
        }
        break;

    case "cleanup":
        $source_path_bits = [__DIR__, "full.pdf"];
        $target_path_bits = [__DIR__, "pdf", "full.pdf"];

        echo MoveFile(implode(DIRECTORY_SEPARATOR, $source_path_bits), implode(DIRECTORY_SEPARATOR, $target_path_bits), "move") == true ? "ok" : "fail";
        unlink(__FILE__);
        break;

    case "upload":
        if(isset($_POST["type"]) && isset($_POST["transfer"]))
        {
            $FILE = null;
            if($_POST["transfer"] == "put")
            {
                $FILE = $_FILES["file"];
            }
            else if($_POST["transfer"] == "base64")
            {
                $filedata = $_POST["file"];
                $datastart_index = stripos($filedata, ",");
                $filedata = substr($filedata, $datastart_index);
                $FILE = base64_decode($filedata);  
            }                
            
            if($FILE != null)
            {
                $target_path = null;
                $target_path_bits = [__DIR__];
                
                switch($_POST["type"])
                {
                    case "pdf":
                        $target_path_bits[] = "pdf";
                        $target_path_bits[] = "full.pdf";
                        break;
                    case "thumb":
                        if(isset($_POST["page"]))
                        {
                            $target_path_bits[] = "thumbs";
                            $target_path_bits[] = $_POST["page"] . ".jpg";
                        }
                        else
                        {
                            echo "missing_param";
                        }
                        break;
                    case "page":
                        if(isset($_POST["page"]))
                        {
                            $target_path_bits[] = "images";
                            $target_path_bits[] = $_POST["page"] . ".jpg";
                        }
                        else
                        {
                            echo "missing_param";
                        }
                        break;
                    case "json":
                        $target_path_bits[] = "data.json";
                        break;
                    
                    case "cover_small":
                        $target_path_bits[] = "cover_small.jpg";
                        break;
                    case "cover_medium":
                        $target_path_bits[] = "cover_medium.jpg";
                        break;
                    case "cover_big":
                        $target_path_bits[] = "cover_big.jpg";
                        break;
                    case "cover_retina":
                        $target_path_bits[] = "cover_retina.jpg";
                        break;
                    
                    default:
                        echo "invalid_type";
                        break;
                }
                
                if(count($target_path_bits) > 1)
                {
                    $target_path = implode(DIRECTORY_SEPARATOR, $target_path_bits);
                    $success = MoveFile($FILE, $target_path, $_POST["transfer"]);
                    if($success == false)
                        echo "upload_error ON " . $target_path;
                    else
                        echo "ok";
                }
            }
            else
            {
                echo "invalid transfer";
            }
        }
        else
        {
            echo "missing_param";
        }
        break;

    default:
        echo "nocmd";
        break;
}