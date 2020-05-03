
init();

function init() {
    // var divTarget = document.createElement("img");
    // divTarget.src="image/GraphicPhurba.png";
    // divTarget.id = "img_robot";
    // divTarget.style.width = "250px";
    // divTarget.style.height = "300px";
    // divTarget.style.position = "absolute";
    // divTarget.style.top = "0";
    // divTarget.style.left = "0";
    // divTarget.style.right = "0";
    // divTarget.style.bottom = "0";
    // divTarget.style.margin = "0";
    // divTarget.style.padding = "0";
    // divTarget.style.zIndex= "99";
    // let container = document.getElementById('container');
    // container.appendChild(divTarget);

    creatediv();
    

    creativediv_shoulder("Upper_shoulder_left_div");
    creativediv_shoulder("Upper_shoulder_right_div");
    creativediv_shoulder("body_div");
    creativediv_shoulder("Lower_shoulder_left_div");
    creativediv_shoulder("Lower_shoulder_right_div");
 
    loadimg("Upper_shoulder", 240, 240, "relative", "Upper_shoulder_left_div");
    loadimg("Upper_shoulder_reverse", 240, 240, "relative", "Upper_shoulder_right_div");

    loadimg("wrist_hand_green", 48, 108, "relative", "Upper_shoulder_left_div");
    loadimg("wrist_hand_green_reverse", 48, 108, "relative", "Upper_shoulder_right_div");

    loadimg("finger_yellow", 54, 216, "relative", "Upper_shoulder_left_div");
    loadimg("finger_yellow_reverse", 54, 216, "relative", "Upper_shoulder_right_div");

    loadimg("Lower_shoulder", 312, 114, "relative", "Lower_shoulder_left_div");
    loadimg("Lower_shoulder_reverse", 312, 114, "relative", "Lower_shoulder_right_div");

    loadimg("wrist_hand_yellow", 144, 78,"relative", "Lower_shoulder_left_div");
    loadimg("wrist_hand_yellow_reverse", 144, 78, "relative", "Lower_shoulder_right_div");

    loadimg("finger_green", 234, 78, "relative", "Lower_shoulder_left_div");
    loadimg("finger_green_reverse", 234, 78, "relative", "Lower_shoulder_right_div");

    loadimg("triangle_body", 300, 300, "relative", "body_div");
    loadimg("eye_red", 62, 70, "relative", "body_div");
    loadimg("eye_lightgreen", 70, 70, "relative", "body_div");
    loadimg("faces_on_triangle", 145, 130, "relative", "body_div");
    loadimg("eye_green", 67, 74, "relative", "body_div");
    loadimg("eye_pink", 67, 79, "relative", "body_div");
    loadimg("eye", 20, 42, "relative", "body_div");
    loadimg("eye_reverse", 20, 40, "relative", "body_div");
    loadimg("eye_close", 20, 42, "relative", "body_div");
    loadimg("eye_close_reverse", 20, 40, "relative", "body_div");     

    document.getElementById("eye_close").style.visibility = 'hidden';
    document.getElementById("eye_close_reverse").style.visibility = 'hidden';

    document.getElementById("container").style.zoom = '100%';
}

function creatediv() {
    var imagediv = document.createElement("div");
    imagediv.id = "images";
    imagediv.style.width = "10px";
    imagediv.style.height = "10px";
    imagediv.style.position = "absolute";
    imagediv.style.top = "0";
    imagediv.style.left = "0";
    imagediv.style.right = "0";
    imagediv.style.bottom = "0";
    imagediv.style.margin = "0";
    imagediv.style.padding = "0";
    imagediv.style.zIndex= "0";
    imagediv.style.zoom = "100%";
    imagediv.style.overflow = "visible";
    let container = document.getElementById('container');
    container.appendChild(imagediv);
}



function creativediv_shoulder(pos) {
    var imagediv = document.createElement("div");
    imagediv.id = pos;
    imagediv.style.width = "20px";
    imagediv.style.height = "20px";
    imagediv.style.position = "absolute";
    imagediv.style.top = "0";
    imagediv.style.left = "0";
    imagediv.style.right = "0";
    imagediv.style.bottom = "0";
    imagediv.style.margin = "0";
    imagediv.style.padding = "0";
    imagediv.style.display = "inline-block;"
    imagediv.style.zIndex= "0";
    imagediv.style.zoom = "80%";
    let container = document.getElementById('images');
    container.appendChild(imagediv);
}

function loadimg(imgname, height, width, pos, divname) {
    var imagefile = document.createElement("img");
    imagefile.src = "image/component/" + imgname + ".png";
    imagefile.id = imgname;
    imagefile.style.width = width + "px";
    imagefile.style.height = height + "px";
    imagefile.style.margin = "0";
    imagefile.style.padding = "0";
    imagefile.style.position = pos;
    let container = document.getElementById(divname);
    container.appendChild(imagefile);
}

var mousemovekey;

// $( document ).ready(function() {
//     $('#container').mousemove(function(event){
//         $('#images').css({"left": event.pageX, "top": event.pageY});
//         mousemovekey = 1;
//         localStorage.setItem("mousemovekey", mousemovekey);
//         setTimeout(function(){
//             mousemovekey = 0;
//             localStorage.setItem("mousemovekey", mousemovekey);
//         }, 2000);
//     });
// });