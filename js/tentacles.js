
/**
 * Copyright (C) 2012 by Justin Windle
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var settings = {
  interactive: false,
  darkTheme: false,
  headRadius: 0,
  thickness: 18,
  tentacles: 40,
  friction: 0.02,
  gravity: 0.1,
  colour: { h:165, s:0.9, v:0.7 },
  length: 70,
  pulse: true,
  wind: -0.5
};

var imgWidth = $('#images').width()/2;
var imgHeight = $('#images').height()/2;
// console.log(imgWidth, imgHeight);

var cx = $('#container').width()/2;
var cy = $('#container').height()/2;

var utils = {

  curveThroughPoints: function( points, ctx ) {

    var i, n, a, b, x, y;
    
    for ( i = 1, n = points.length - 2; i < n; i++ ) {

      a = points[i];
      b = points[i + 1];
      
      x = ( a.x + b.x ) * 0.5;
      y = ( a.y + b.y ) * 0.5;

      ctx.quadraticCurveTo( a.x, a.y, x, y );
    }

    a = points[i];
    b = points[i + 1];
    
    ctx.quadraticCurveTo( a.x, a.y, b.x, b.y );
  }
};

var Node = function( x, y ) {
  
  this.x = this.ox = x || 0.0;
  this.y = this.oy = y || 0.0;

  this.vx = 0.0;
  this.vy = 0.0;
};

var Tentacle = function( options ) {

  this.length = options.length || 10;
  this.radius = options.radius || 10;
  this.spacing = options.spacing || 20;
  this.friction = options.friction || 0.8;
  this.shade = random( 0.85, 1.1 );

  this.nodes = [];
  this.outer = [];
  this.inner = [];
  this.theta = [];

  for ( var i = 0; i < this.length; i++ ) {
    this.nodes.push( new Node() );
  }
};

Tentacle.prototype = {

  move: function( x, y, instant ) {
    
    this.nodes[0].x = x;
    this.nodes[0].y = y;

    if ( instant ) {

      var i, node;

      for ( i = 1; i < this.length; i++ ) {

        node = this.nodes[i];
        node.x = x;
        node.y = y;
      }
    }
  },

  update: function() {

    var i, n, s, c, dx, dy, da, px, py, node, prev = this.nodes[0];
    var radius = this.radius * settings.thickness;
    var step = radius / this.length;

    for ( i = 1, j = 0; i < this.length; i++, j++ ) {

      node = this.nodes[i];

      node.x += node.vx;
      node.y += node.vy;

      dx = prev.x - node.x;
      dy = prev.y - node.y;
      da = Math.atan2( dy, dx );

      px = node.x + cos( da ) * this.spacing * settings.length;
      py = node.y + sin( da ) * this.spacing * settings.length;

      node.x = prev.x - ( px - node.x );
      node.y = prev.y - ( py - node.y );

      node.vx = node.x - node.ox;
      node.vy = node.y - node.oy;

      node.vx *= this.friction * (1 - settings.friction);
      node.vy *= this.friction * (1 - settings.friction);

      node.vx += settings.wind;
      node.vy += settings.gravity;

      node.ox = node.x;
      node.oy = node.y;

      s = sin( da + HALF_PI );
      c = cos( da + HALF_PI );

      this.outer[j] = {
        x: prev.x + c * radius,
        y: prev.y + s * radius
      };

      this.inner[j] = {
        x: prev.x - c * radius,
        y: prev.y - s * radius
      };

      this.theta[j] = da;

      radius -= step;

      prev = node;
    }
  },

  draw: function( ctx ) {

    var h, s, v, e;

    s = this.outer[0];
    e = this.inner[0];

    ctx.beginPath();
    ctx.moveTo( s.x, s.y );
    utils.curveThroughPoints( this.outer, ctx );
    utils.curveThroughPoints( this.inner.reverse(), ctx );
    ctx.lineTo( e.x, e.y );
    ctx.closePath();

    h = settings.colour.h * this.shade;
    s = settings.colour.s * 100 * this.shade;
    v = settings.colour.v * 100 * this.shade;

    ctx.fillStyle = 'hsl(' + h + ',' + s + '%,' + v + '%)';
    ctx.fill();

    if ( settings.thickness > 2 ) {

      v += settings.darkTheme ? -10 : 10;

      ctx.strokeStyle = 'hsl(' + h + ',' + s + '%,' + v + '%)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
};

var demo = true;
var ease = 0.1;
var modified = false;
var radius = settings.headRadius;
var tentacles = [];
var center = { x:0, y:0 };
var scale = window.devicePixelRatio || 1;
var update_key = true;
var setting_key = 1;
var setting_down = 0;
var mousemovekey = 0;
var sketch = Sketch.create({

  retina: 'auto',

  container: document.getElementById( 'container' ),

  setup: function() {

    center.x = this.width / 2;
    center.y = this.height / 2;

    // center.x = Math.random() * this.width;
    // center.y = Math.random() * this.height;

    var tentacle;

    for ( var i = 0; i < 100; i++ ) {

      tentacle = new Tentacle({
        length: random( 10, 20 ),
        radius: random( 0.05, 1.0 ),
        spacing: random( 0.2, 1.0 ),
        friction: random( 0.7, 0.88 )
      });

      tentacle.move( center.x, center.y, true );
      tentacles.push( tentacle );
    }
  },

  update: function() {
    if (!mousemovekey) {
      var t, pulse;

      t = this.millis * 0.001;

      if ( settings.pulse ) {

        // pulse = pow( sin( t * PI ), 18 );
        // radius = settings.headRadius * 0.5 + settings.headRadius * 0.5 * pulse;
      }

      if ( settings.interactive ) {

        ease += ( 0.7 - ease ) * 0.05;

        center.x += ( this.mouse.x / scale - center.x ) * ease;
        center.y += ( this.mouse.y / scale - center.y ) * ease; 

        $('#images').removeClass('rotate');
        
        setTimeout(function(){
          settings.interactive = false;
        }, 2000);

      } else if (update_key) {

        sound_effect = true;
        // $('#images').addClass('rotate');        
        t = this.millis;
        cx = this.width * 0.5;
        cy = this.height * 0.5;        

        setTimeout(function(){
          if (followkey === 0) {
            center.x += (cx - center.x) * 0.1;
            center.y += (cy - center.y) * 0.1;
          } else {
            // center.x = cx + sin( t * 0.002 / 2 ) * cos( t * 0.00005 ) * cx * 0.5;
            // center.y = cy + sin( t * 0.003 / 2 ) * tan( sin( t * 0.0003 ) * 1.15 ) * cy * 0.4;        
            center.x += (cx + sin( t * 0.002 / 2 ) * cos( t * 0.00001 ) * cx * 0.5 - center.x) * 0.1;
            center.y += (cy + sin( t * 0.003 / 2 ) * tan( sin( t * 0.0001 ) * 1.15 ) * cy * 0.4 - center.y) * 0.1;        
          }
  
          if (cx - center.x < 0.5) {
            followkey = 1;
          }
        }, 0);
        
        setTimeout(function(){
          $('#finger_yellow-2').addClass('rotate_left');
          $('#Upper_shoulder_left_div-2_ballcontainer').addClass('rotate_left');
          $('#Upper_shoulder_left_div-2').addClass('rotate_shoulder_left');
        }, random(0, 1000));
        setTimeout(function(){
          $('#finger_yellow_reverse-2').addClass('rotate_right');
          $('#Upper_shoulder_right_div-2_ballcontainer').addClass('rotate_right');
          $('#Upper_shoulder_right_div-2').addClass('rotate_shoulder_right');
        }, random(500, 1500));
        setTimeout(function(){
          $('#finger_green3').addClass('rotate_right');
          $('#Lower_shoulder_left_div3_ballcontainer').addClass('rotate_right');
          $('#Lower_shoulder_left_div3').addClass('rotate_shoulder_left');
        }, random(1000, 2000));
        setTimeout(function(){
          $('#finger_green_reverse3').addClass('rotate_left');
          $('#Lower_shoulder_right_div3_ballcontainer').addClass('rotate_left');
          $('#Lower_shoulder_right_div3').addClass('rotate_shoulder_right');
        }, random(1500, 2500));
        setTimeout(function(){
          $('#finger_yellow-1').addClass('rotate_right');
          $('#Upper_shoulder_left_div-1_ballcontainer').addClass('rotate_right');
          $('#Upper_shoulder_left_div-1').addClass('rotate_shoulder_left');
        }, random(1500, 2500));
        setTimeout(function(){
          $('#finger_yellow_reverse-1').addClass('rotate_left');
          $('#Upper_shoulder_right_div-1_ballcontainer').addClass('rotate_left');
          $('#Upper_shoulder_right_div-1').addClass('rotate_shoulder_right');
        }, random(1000, 2000));
        setTimeout(function(){
          $('#finger_green1').addClass('rotate_left');
          $('#Lower_shoulder_left_div1_ballcontainer').addClass('rotate_left');
          $('#Lower_shoulder_left_div1').addClass('rotate_shoulder_left');
        }, random(500, 1500));
        setTimeout(function(){
          $('#finger_green_reverse1').addClass('rotate_right');
          $('#Lower_shoulder_right_div1_ballcontainer').addClass('rotate_right');
          $('#Lower_shoulder_right_div1').addClass('rotate_shoulder_right');
        }, random(0, 1000));
        setTimeout(function(){
          $('#finger_green2').addClass('rotate_right');
          $('#Lower_shoulder_left_div2_ballcontainer').addClass('rotate_right');
          $('#Lower_shoulder_left_div2').addClass('rotate_shoulder_right');
        }, random(500, 1500));
        setTimeout(function(){
          $('#finger_green_reverse2').addClass('rotate_left');
          $('#Lower_shoulder_right_div2_ballcontainer').addClass('rotate_left');
          $('#Lower_shoulder_right_div2').addClass('rotate_shoulder_left');
        }, random(0, 1000));

      } else {
        $('#images').removeClass('rotate');
        // $('#finger_yellow-2').removeClass('rotate_left');
        // $('#finger_yellow_reverse-2').removeClass('rotate_right');
        // $('#finger_green3').removeClass('rotate_right');
        // $('#finger_green_reverse3').removeClass('rotate_left');
        // $('#Upper_shoulder_left_div-2').removeClass('rotate_shoulder_left');
        // $('#Upper_shoulder_right_div-2').removeClass('rotate_shoulder_right');
        // $('#Lower_shoulder_left_div3').removeClass('rotate_shoulder_left');
        // $('#Lower_shoulder_right_div3').removeClass('rotate_shoulder_right'); 

        // $('#finger_yellow-1').removeClass('rotate_right');
        // $('#finger_yellow_reverse-1').removeClass('rotate_left');
        // $('#finger_green1').removeClass('rotate_left');
        // $('#finger_green_reverse1').removeClass('rotate_right');
        // $('#Upper_shoulder_left_div-1').removeClass('rotate_shoulder_left');
        // $('#Upper_shoulder_right_div-1').removeClass('rotate_shoulder_right');
        // $('#Lower_shoulder_left_div1').removeClass('rotate_shoulder_left');
        // $('#Lower_shoulder_right_div1').removeClass('rotate_shoulder_right'); 

        // $('#finger_green2').removeClass('rotate_right');
        // $('#finger_green_reverse2').removeClass('rotate_left');
        // $('#Lower_shoulder_left_div2').removeClass('rotate_shoulder_right');
        // $('#Lower_shoulder_right_div2').removeClass('rotate_shoulder_left'); 

        // $('#Lower_shoulder_right_div3_ballcontainer').removeClass('rotate_left');
        // $('#Lower_shoulder_left_div3_ballcontainer').removeClass('rotate_right');
        // $('#Lower_shoulder_right_div2_ballcontainer').removeClass('rotate_left');
        // $('#Lower_shoulder_left_div2_ballcontainer').removeClass('rotate_right');
        // $('#Lower_shoulder_right_div1_ballcontainer').removeClass('rotate_right');
        // $('#Lower_shoulder_left_div1_ballcontainer').removeClass('rotate_left');

        // $('#Upper_shoulder_right_div-1_ballcontainer').removeClass('rotate_left');
        // $('#Upper_shoulder_left_div-2_ballcontainer').removeClass('rotate_left');
        // $('#Upper_shoulder_right_div-2_ballcontainer').removeClass('rotate_right');
        // $('#Upper_shoulder_left_div-1_ballcontainer').removeClass('rotate_right');

        // center.x = this.width / 2;
        // center.y = this.height;
               
        setting_down = 0;
      }

      window.localStorage.setItem('rot_x', center.x);
      window.localStorage.setItem('rot_y', center.y);

      var left_move = $('#images').position().left * 0;
      var top_move = $('#images').position().top * 0;

      // $('#images').css({"left": center.x-imgWidth / 2 * 1 + left_move, "top": center.y-imgHeight / 2 * 1 + top_move});
      $('#images').css({"left": center.x-imgWidth, "top": center.y-imgHeight});

      var px, py, theta, tentacle;
      var step = TWO_PI / settings.tentacles;

      for ( var i = 0, n = settings.tentacles; i < n; i++ ) {

        tentacle = tentacles[i];

        theta = i * step;

        px = cos( theta ) * radius;
        py = sin( theta ) * radius;

        tentacle.move( center.x + px, center.y + py );
        tentacle.update();
      }
    } else {
      $('#images').removeClass('rotate');
      // $('#finger_yellow-2').removeClass('rotate_left');
      // $('#finger_yellow_reverse-2').removeClass('rotate_right');
      // $('#finger_green3').removeClass('rotate_right');
      // $('#finger_green_reverse3').removeClass('rotate_left');
      // $('#Upper_shoulder_left_div-2').removeClass('rotate_shoulder_left');
      // $('#Upper_shoulder_right_div-2').removeClass('rotate_shoulder_right');
      // $('#Lower_shoulder_left_div3').removeClass('rotate_shoulder_left');
      // $('#Lower_shoulder_right_div3').removeClass('rotate_shoulder_right'); 

      // $('#finger_yellow-1').removeClass('rotate_right');
      // $('#finger_yellow_reverse-1').removeClass('rotate_left');
      // $('#finger_green1').removeClass('rotate_left');
      // $('#finger_green_reverse1').removeClass('rotate_right');
      // $('#Upper_shoulder_left_div-1').removeClass('rotate_shoulder_left');
      // $('#Upper_shoulder_right_div-1').removeClass('rotate_shoulder_right');
      // $('#Lower_shoulder_left_div1').removeClass('rotate_shoulder_left');
      // $('#Lower_shoulder_right_div1').removeClass('rotate_shoulder_right'); 

      // $('#finger_green2').removeClass('rotate_right');
      // $('#finger_green_reverse2').removeClass('rotate_left');
      // $('#Lower_shoulder_left_div2').removeClass('rotate_shoulder_right');
      // $('#Lower_shoulder_right_div2').removeClass('rotate_shoulder_left'); 

      // $('#Lower_shoulder_right_div3_ballcontainer').removeClass('rotate_left');
      // $('#Lower_shoulder_left_div3_ballcontainer').removeClass('rotate_right');
      // $('#Lower_shoulder_right_div2_ballcontainer').removeClass('rotate_left');
      // $('#Lower_shoulder_left_div2_ballcontainer').removeClass('rotate_right');
      // $('#Lower_shoulder_right_div1_ballcontainer').removeClass('rotate_right');
      // $('#Lower_shoulder_left_div1_ballcontainer').removeClass('rotate_left');  
      
      // $('#Upper_shoulder_right_div-1_ballcontainer').removeClass('rotate_left');
      // $('#Upper_shoulder_left_div-2_ballcontainer').removeClass('rotate_left');
      // $('#Upper_shoulder_right_div-2_ballcontainer').removeClass('rotate_right');
      // $('#Upper_shoulder_left_div-1_ballcontainer').removeClass('rotate_right');

      var speed = 0.1;

      var t, cx, cy, pulse;

      t = this.millis * 0.001;

      ease += ( 0.7 - ease ) * 0.05;

      center.x += (evnX - center.x) * speed;
      center.y += (evnY - center.y) * speed;

      var left_move = $('#images').position().left * 0;
      var top_move = $('#images').position().top * 0;

      $('#images').css({"left": center.x-imgWidth / 2 * 1 + left_move, "top": center.y-imgHeight / 2 * 1 + top_move});

      var px, py, theta, tentacle;
      var step = TWO_PI / settings.tentacles;

      for ( var i = 0, n = settings.tentacles; i < n; i++ ) {

        tentacle = tentacles[i];

        theta = i * step;

        px = cos( theta ) * radius;
        py = sin( theta ) * radius;

        tentacle.move( center.x + px, center.y + py );
        tentacle.update();
      } 

      setTimeout(function(){
          mousemovekey = 0;
          // followkey = 0;
      }, 1000);
    }   
  },

  draw: function() {

    var h = settings.colour.h * 0.95;
    var s = settings.colour.s * 100 * 0.95;
    var v = settings.colour.v * 100 * 0.95;
    var w = v + ( settings.darkTheme ? -10 : 10 );

    this.beginPath();
    this.arc( center.x, center.y, radius + settings.thickness, 0, TWO_PI );
    this.lineWidth = settings.headRadius * 0.3;
    this.globalAlpha = 0.2;
    this.strokeStyle = 'hsl(' + h + ',' + s + '%,' + w + '%)';
    this.stroke();

    this.globalAlpha = 1.0;

    for ( var i = 0, n = settings.tentacles; i < n; i++ ) {
      tentacles[i].draw( this );
    }

    this.beginPath();
    this.arc( center.x, center.y, radius + settings.thickness, 0, TWO_PI );
    this.fillStyle = 'hsl(' + h + ',' + s + '%,' + v + '%)';
    this.fill();    
  },

  // mousedown: function() {    

  // },

  // mousemove: function() {
 
  // },

  export: function() {
    window.open( this.canvas.toDataURL(), 'tentacles', "top=20,left=20,width=" + this.width + ",height=" + this.height );
  }
});

function onSettingsChanged() {
  modified = true;
}

function onThemeChanged( dark ) {
  
  settings.colour.h = 165;
  settings.colour.s = 0.9;
  settings.colour.v = dark ? 0.7 : 0.7;

  // document.body.className = dark ? 'dark' : '';

  colourGUI.updateDisplay();
}

var followkey = 0;
var firstX = 0,firstY = 0;
var delta = 0;
var flag = 0;
var evnX, evnY;
$( document ).ready(function() {
  $('#container').mousemove(function(event){

      delta = 10;
      if(delta > 5) {

        mousemovekey = 1;

        evnX = event.pageX;
        evnY = event.pageY;

        // var speed = 0.1;

        // var t, cx, cy, pulse;

        // t = this.millis * 0.001;

        // ease += ( 0.7 - ease ) * 0.05;

        // center.x += (event.pageX - center.x) * speed;
        // center.y += (event.pageY - center.y) * speed;

        // var left_move = $('#images').position().left * 0;
        // var top_move = $('#images').position().top * 0;

        // $('#images').css({"left": center.x-imgWidth / 2 * 1 + left_move, "top": center.y-imgHeight / 2 * 1 + top_move});

        // var px, py, theta, tentacle;
        // var step = TWO_PI / settings.tentacles;

        // for ( var i = 0, n = settings.tentacles; i < n; i++ ) {

        //   tentacle = tentacles[i];

        //   theta = i * step;

        //   px = cos( theta ) * radius;
        //   py = sin( theta ) * radius;

        //   tentacle.move( center.x + px, center.y + py );
        //   tentacle.update();
        // } 

        // setTimeout(function(){
        //     mousemovekey = 0;
        //     followkey = 0;
        // }, 0);

      } 
      // else {
      //     setTimeout(function(){
      //       mousemovekey = 0;
      //   }, 1);
      // }
      //   firstX = event.pageX; firstY = event.pageY;

  });
});


var gui = new dat.GUI();
gui.add( settings, 'headRadius' ).min( 0.0 ).max( 100.0 ).onChange( onSettingsChanged );
gui.add( settings, 'tentacles' ).min( 1 ).max( 100 ).onChange( onSettingsChanged );
gui.add( settings, 'thickness' ).min( 1.0 ).max( 40.0 ).onChange( onSettingsChanged );
gui.add( settings, 'length' ).min( 10.0 ).max( 100.0 ).onChange( onSettingsChanged );
gui.add( settings, 'gravity' ).min( -3.0 ).max( 3.0 ).onChange( onSettingsChanged );
gui.add( settings, 'wind' ).min( -3.0 ).max( 3.0 ).onChange( onSettingsChanged );
gui.add( settings, 'friction' ).min( 0.0 ).max( 1.0 ).onChange( onSettingsChanged );

var colourGUI = gui.addColor( settings, 'colour' );
// gui.add( settings, 'darkTheme' ).onChange( onThemeChanged );
gui.add( settings, 'pulse' );

var interactiveGUI = gui.add( settings, 'interactive' );
gui.add( sketch, 'autoclear' );
gui.add( sketch, 'export' );
gui.close();

// onThemeChanged( true );

var sound_effect = true;

function audioplay_foot() {
  if(sound_effect) {
    sound_effect = false;
    var soundFile_foot = document.getElementById("foot7");
    soundFile_foot.play();

    setTimeout(function(){
      // var soundFile_something = document.getElementById("Something");
      // soundFile_something.play();
    }, 500);
    sound_effect = true;
  }  
}

setposition("images", 100, 100);
setposition("triangle_body", -120, -120);

setposition("Upper_shoulder_left_div", -15, 10);
setposition("Upper_shoulder", -97, -90);
setposition("wrist_hand_green", -65, -327);
setposition("finger_yellow", -72, -392);

setposition("Upper_shoulder_right_div", 225, 10);
setposition("Upper_shoulder_reverse", -125, -90);
setposition("wrist_hand_green_reverse", -25, -327);
setposition("finger_yellow_reverse", -125, -392);

setposition("body_div", 85, 100);

setposition("Lower_shoulder_left_div", 0, 20);
setposition("Lower_shoulder", -55, -125);
setposition("wrist_hand_yellow", -27, -205);
setposition("finger_green", 0, -330);

setposition("Lower_shoulder_right_div", 210, 20);
setposition("Lower_shoulder_reverse", -42, -125);
setposition("wrist_hand_yellow_reverse", -32, -205);
setposition("finger_green_reverse", -57, -330);

setposition("eye_lightgreen", 50, -485);
setposition("eye_red", -60, -405);

setposition("faces_on_triangle", -37, -520);

setposition("eye_green", -45, -725);
setposition("eye_pink", 30, -795);

setposition("eye", -45, -828);
setposition("eye_reverse", 69, -850);

setposition("eye_close", -47, -878);
setposition("eye_close_reverse", 68, -900);

setposition("body_div", -25, -10);

//setposition("eye_left_rotate", 60, -740);

function setposition(imageid, left, top) {
  var imageid = $('#' + imageid);
  imageid.css({"left": left, "top": top});
}

function rotate_imgcomponent(imageid) {
  var imageid = $('#' + imageid);
  imageid.addClass('rotate');
}

function creativediv_shoulder(pos, zindex) {
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
  imagediv.style.zIndex= zindex;
  imagediv.style.zoom = "80%";
  let container = document.getElementById('images');
  container.appendChild(imagediv);
}

function loadimg(imgname, height, width, pos, divname, zindex) {
  var imagefile = document.createElement("img");
  imagefile.src = "image/component/" + imgname + ".png";
  imagefile.id = imgname + zindex;
  imagefile.style.width = width + "px";
  imagefile.style.height = height + "px";
  imagefile.style.margin = "0";
  imagefile.style.padding = "0";
  imagefile.style.position = pos;
  imagefile.style.zIndex= zindex;
  let container = document.getElementById(divname);
  container.appendChild(imagefile);
}

creativediv_shoulder("Upper_shoulder_left_div-1", -1); 
setposition("Upper_shoulder_left_div-1", -100, -70);
loadimg("Upper_shoulder", 240, 240, "relative", "Upper_shoulder_left_div-1", -1);
setposition("Upper_shoulder-1", -120, -115);
loadimg("wrist_hand_green", 48, 108, "relative", "Upper_shoulder_left_div-1", -1);
setposition("wrist_hand_green-1", -87, -353);
loadimg("finger_yellow", 54, 216, "relative", "Upper_shoulder_left_div-1", -1);
setposition("finger_yellow-1", -91, -419);

creativediv_shoulder("Upper_shoulder_right_div-1", -1); 
setposition("Upper_shoulder_right_div-1", 90, -70);
loadimg("Upper_shoulder_reverse", 240, 240, "relative", "Upper_shoulder_right_div-1", -1);
setposition("Upper_shoulder_reverse-1", -100, -115);
loadimg("wrist_hand_green_reverse", 48, 108, "relative", "Upper_shoulder_right_div-1", -1);
setposition("wrist_hand_green_reverse-1", 0, -353);
loadimg("finger_yellow_reverse", 54, 216, "relative", "Upper_shoulder_right_div-1", -1);
setposition("finger_yellow_reverse-1", -105, -419);

creativediv_shoulder("Upper_shoulder_left_div-2", -2); 
setposition("Upper_shoulder_left_div-2", -100, -70);
loadimg("Upper_shoulder", 240, 240, "relative", "Upper_shoulder_left_div-2", -2);
setposition("Upper_shoulder-2", -120, -115);
loadimg("wrist_hand_green", 48, 108, "relative", "Upper_shoulder_left_div-2", -2);
setposition("wrist_hand_green-2", -87, -353);
loadimg("finger_yellow", 54, 216, "relative", "Upper_shoulder_left_div-2", -2);
setposition("finger_yellow-2", -91, -419);

creativediv_shoulder("Upper_shoulder_right_div-2", -2); 
setposition("Upper_shoulder_right_div-2", 90, -70);
loadimg("Upper_shoulder_reverse", 240, 240, "relative", "Upper_shoulder_right_div-2", -2);
setposition("Upper_shoulder_reverse-2", -100, -115);
loadimg("wrist_hand_green_reverse", 48, 108, "relative", "Upper_shoulder_right_div-2", -2);
setposition("wrist_hand_green_reverse-2", 0, -353);
loadimg("finger_yellow_reverse", 54, 216, "relative", "Upper_shoulder_right_div-2", -2);
setposition("finger_yellow_reverse-2", -105, -419);

creativediv_shoulder("Lower_shoulder_right_div1", 1); 
setposition("Lower_shoulder_right_div1", 90, -70);
loadimg("Lower_shoulder_reverse", 312, 114, "relative", "Lower_shoulder_right_div1", 1);
setposition("Lower_shoulder_reverse1", -45, -130);
loadimg("wrist_hand_yellow_reverse", 144, 78, "relative", "Lower_shoulder_right_div1", 1);
setposition("wrist_hand_yellow_reverse1", -38, -210);
loadimg("finger_green_reverse", 234, 78, "relative", "Lower_shoulder_right_div1", 1);
setposition("finger_green_reverse1", -65, -340);

creativediv_shoulder("Lower_shoulder_left_div1", 1); 
setposition("Lower_shoulder_left_div1", -100, -70);
loadimg("Lower_shoulder", 312, 114, "relative", "Lower_shoulder_left_div1", 1);
setposition("Lower_shoulder1", -50, -130);
loadimg("wrist_hand_yellow", 144, 78, "relative", "Lower_shoulder_left_div1", 1);
setposition("wrist_hand_yellow1", -20, -210);
loadimg("finger_green", 234, 78, "relative", "Lower_shoulder_left_div1", 1);
setposition("finger_green1", 5, -340);

creativediv_shoulder("Lower_shoulder_right_div2", 2); 
setposition("Lower_shoulder_right_div2", 90, -70);
loadimg("Lower_shoulder_reverse", 312, 114, "relative", "Lower_shoulder_right_div2", 2);
setposition("Lower_shoulder_reverse2", -45, -130);
loadimg("wrist_hand_yellow_reverse", 144, 78, "relative", "Lower_shoulder_right_div2", 2);
setposition("wrist_hand_yellow_reverse2", -38, -210);
loadimg("finger_green_reverse", 234, 78, "relative", "Lower_shoulder_right_div2", 2);
setposition("finger_green_reverse2", -65, -340);

creativediv_shoulder("Lower_shoulder_left_div2", 2); 
setposition("Lower_shoulder_left_div2", -100, -70);
loadimg("Lower_shoulder", 312, 114, "relative", "Lower_shoulder_left_div2", 2);
setposition("Lower_shoulder2", -50, -130);
loadimg("wrist_hand_yellow", 144, 78, "relative", "Lower_shoulder_left_div2", 2);
setposition("wrist_hand_yellow2", -20, -210);
loadimg("finger_green", 234, 78, "relative", "Lower_shoulder_left_div2", 2);
setposition("finger_green2", 5, -340);

creativediv_shoulder("Lower_shoulder_right_div3", 3); 
setposition("Lower_shoulder_right_div3", 90, -70);
loadimg("Lower_shoulder_reverse", 312, 114, "relative", "Lower_shoulder_right_div3", 3);
setposition("Lower_shoulder_reverse3", -45, -130);
loadimg("wrist_hand_yellow_reverse", 144, 78, "relative", "Lower_shoulder_right_div3", 3);
setposition("wrist_hand_yellow_reverse3", -38, -210);
loadimg("finger_green_reverse", 234, 78, "relative", "Lower_shoulder_right_div3", 3);
setposition("finger_green_reverse3", -65, -340);

creativediv_shoulder("Lower_shoulder_left_div3", 3); 
setposition("Lower_shoulder_left_div3", -100, -70);
loadimg("Lower_shoulder", 312, 114, "relative", "Lower_shoulder_left_div3", 3);
setposition("Lower_shoulder3", -50, -130);
loadimg("wrist_hand_yellow", 144, 78, "relative", "Lower_shoulder_left_div3", 3);
setposition("wrist_hand_yellow3", -20, -210);
loadimg("finger_green", 234, 78, "relative", "Lower_shoulder_left_div3", 3);
setposition("finger_green3", 5, -340);

createball("Lower_shoulder_left_div3", 35, 230, -25, 35, 4);
createball("Lower_shoulder_right_div3", -35, 230, -25, 35, 3);
createball("Lower_shoulder_left_div2", 35, 230, -25, 35, 4);
createball("Lower_shoulder_right_div2", -35, 230, -25, 35, 3);
createball("Lower_shoulder_left_div1", 35, 230, -25, 35, 4);
createball("Lower_shoulder_right_div1", -35, 230, -25, 35, 3);

createball("Upper_shoulder_left_div-2", 10, -105, 30, -25, 2);
createball("Upper_shoulder_right_div-2", -10, -105, -80, -25, 1);
createball("Upper_shoulder_left_div-1", 10, -105, 30, -25, 2);
createball("Upper_shoulder_right_div-1", -10, -105, -80, -25, 1);


document.getElementById("Upper_shoulder_right_div-1").style.visibility = 'hidden';
document.getElementById("Upper_shoulder_left_div-1").style.visibility = 'hidden';
document.getElementById("Lower_shoulder_right_div1").style.visibility = 'hidden';
document.getElementById("Lower_shoulder_left_div1").style.visibility = 'hidden';
document.getElementById("Lower_shoulder_right_div2").style.visibility = 'hidden';
document.getElementById("Lower_shoulder_left_div2").style.visibility = 'hidden';
document.getElementById("Upper_shoulder_right_div").style.visibility = 'hidden';
document.getElementById("Upper_shoulder_left_div").style.visibility = 'hidden';
document.getElementById("Lower_shoulder_right_div").style.visibility = 'hidden';
document.getElementById("Lower_shoulder_left_div").style.visibility = 'hidden';

document.getElementById("Upper_shoulder_right_div-1_ballcontainer").style.visibility = 'hidden';
document.getElementById("Upper_shoulder_left_div-1_ballcontainer").style.visibility = 'hidden';
document.getElementById("Upper_shoulder_right_div-2_ballcontainer").style.visibility = 'hidden';
document.getElementById("Upper_shoulder_left_div-2_ballcontainer").style.visibility = 'hidden';
document.getElementById("Lower_shoulder_right_div1_ballcontainer").style.visibility = 'hidden';
document.getElementById("Lower_shoulder_left_div1_ballcontainer").style.visibility = 'hidden';
document.getElementById("Lower_shoulder_right_div2_ballcontainer").style.visibility = 'hidden';
document.getElementById("Lower_shoulder_left_div2_ballcontainer").style.visibility = 'hidden';
document.getElementById("Lower_shoulder_right_div3_ballcontainer").style.visibility = 'hidden';
document.getElementById("Lower_shoulder_left_div3_ballcontainer").style.visibility = 'hidden';

var hiddendiv = [
  "Upper_shoulder_right_div-1",
  "Lower_shoulder_left_div1",
  "Upper_shoulder_left_div-1",
  "Lower_shoulder_right_div1",  
  "Lower_shoulder_right_div2",
  "Lower_shoulder_left_div2"
];

var hidnum = 0;

function loadimg_bloodandcircle(imgname, height, width, pos, divname, zindex) {
  var imagefile = document.createElement("img");
  imagefile.src = "./image/bloodandcircle/" + imgname + ".png";
  imagefile.id = imgname + zindex;
  imagefile.style.width = width + "px";
  imagefile.style.height = height + "px";
  imagefile.style.margin = "0";
  imagefile.style.padding = "0";
  imagefile.style.position = pos;
  imagefile.style.zIndex= zindex;
  imagefile.style.zoom= "150%";
  let container = document.getElementById(divname);
  container.appendChild(imagefile);
}

creativediv_shoulder("blood_div", 3); 
setposition("blood_div", 105, 265);
loadimg_bloodandcircle("blood", 70, 35, "relative", "blood_div", 0);
setposition("blood0", -85, -75);
document.getElementById("blood0").style.visibility = 'hidden';

var py0 = 11;

function createball(shoulderid, dx, dy, bx, by, circlenum) {

  creatediv_ball(shoulderid, dx, dy);
  
  var imgfile = document.createElement("img");
  imgfile.src = "./image/bloodandcircle/Circle" + circlenum + ".png";
  imgfile.id = shoulderid + "_ball";
  imgfile.style.width = "70px";
  imgfile.style.height = "70px";
  imgfile.style.margin = "0";
  imgfile.style.padding = "0";
  imgfile.style.position = "absolute";
  // $('#' + imgfile.id).css({"left": bx, "top": by});
  imgfile.style.zIndex= -10;
  let container = document.getElementById(shoulderid + "_ballcontainer");
  container.appendChild(imgfile);
  setposition(imgfile.id, bx, by);
}

function creatediv_ball(handid, left, top) {
  var imagediv = document.createElement("div");
  imagediv.id =handid +  "_ballcontainer";
  imagediv.style.width = "20px";
  imagediv.style.height = "20px";
  imagediv.style.position = "absolute";
  imagediv.style.margin = "0";
  imagediv.style.padding = "0";
  imagediv.style.zIndex= "-10";
  imagediv.style.overflow = "visible";
  let container = document.getElementById(handid);
  container.appendChild(imagediv);
  $('#' + imagediv.id).css({"left": left, "top": top});
}

var randball = [
  "Upper_shoulder_right_div-2",
  "Upper_shoulder_left_div-2",
  "Lower_shoulder_right_div3",
  "Lower_shoulder_left_div3"
];

var randCircle = [
  "Circle1.png",
  "Circle2.png",
  "Circle3.png",
  "Circle4.png"
];

var randballnum;
var stage = 1;
$('body').click(function(){
  stage += 1;
  console.log("stage = ",stage);
  switch (stage % 5) {
    case 1:
        $("#body").removeClass("dark");
        $("#body").addClass("dark1");
        break;
    case 2:
        $("#body").removeClass("dark1");
        $("#body").addClass("dark2");
        break;
    case 3:
        $("#body").removeClass("dark2");
        $("#body").addClass("dark3");
        break;
    case 4:
        $("#body").removeClass("dark3");
        $("#body").addClass("dark4");
        break;
    case 0:
        $("#body").removeClass("dark4");
        $("#body").addClass("dark");
        break;
  }
  // console.log('clicked');
  if ( demo ) {

    // demo = false;

    var cntx = center.x;

    if(hidnum < 6) {
      document.getElementById(hiddendiv[hidnum]).style.visibility = 'visible';        
      hidnum = hidnum + 1;                 
    }

    document.getElementById("Upper_shoulder_right_div-1_ballcontainer").style.visibility = 'hidden';
    document.getElementById("Upper_shoulder_left_div-1_ballcontainer").style.visibility = 'hidden';
    document.getElementById("Upper_shoulder_right_div-2_ballcontainer").style.visibility = 'hidden';
    document.getElementById("Upper_shoulder_left_div-2_ballcontainer").style.visibility = 'hidden';
    document.getElementById("Lower_shoulder_right_div1_ballcontainer").style.visibility = 'hidden';
    document.getElementById("Lower_shoulder_left_div1_ballcontainer").style.visibility = 'hidden';
    document.getElementById("Lower_shoulder_right_div2_ballcontainer").style.visibility = 'hidden';
    document.getElementById("Lower_shoulder_left_div2_ballcontainer").style.visibility = 'hidden';
    document.getElementById("Lower_shoulder_right_div3_ballcontainer").style.visibility = 'hidden';
    document.getElementById("Lower_shoulder_left_div3_ballcontainer").style.visibility = 'hidden';

    var falling = setInterval(function() {
      if($('#blood0').position().top > $('#container').height()) {
        // debugger;
        clearInterval(falling);
        setposition("blood0", -7, 11);
        document.getElementById("blood0").style.visibility = "hidden";
        py0 = -75;
        creatflw(cntx);
        return;   
      }
      document.getElementById("blood0").style.visibility = "visible";        
      py0 += 10;        
      setposition("blood0", -85, py0);                  
    }, 1000 / 50 );     

    audioplay_foot();
    setting_down = 1;
    settings.interactive = false;
    
    // $('#images').removeClass('rotate');
    $('#eye').css({"visibility": "hidden"});
    $('#eye_close').css({"visibility": "visible"});
    $('#eye_reverse').css({"visibility": "hidden"});
    $('#eye_close_reverse').css({"visibility": "visible"});

    update_key = false;      

    setTimeout(function(){

      update_key = true;
      settings.interactive = true;
      interactiveGUI.updateDisplay();
      $('#eye').css({"visibility": "visible"});
      $('#eye_close').css({"visibility": "hidden"});
      $('#eye_reverse').css({"visibility": "visible"});
      $('#eye_close_reverse').css({"visibility": "hidden"});

      document.getElementById("blood0").style.visibility = 'hidden'; 
      setposition("blood0", -117, -95);

      if ( !modified ) {
        settings.length = 60;
        settings.gravity = 0.1;
        settings.wind = 0.0;
      }

      randballnum = Math.round(Math.random() * 3);
      document.getElementById(randball[randballnum] + "_ballcontainer").style.visibility = 'visible';
      currentballid = randball[randballnum] + "_ballcontainer";      
      setTimeout(function(){
        document.getElementById(randball[randballnum] + "_ballcontainer").style.visibility = 'hidden';
        switch (randballnum) {
          case 0:
            cntballx = center.x + 20;
            cntbally = center.y - 150;
            break;
          case 1:
            cntballx = center.x - 20;
            cntbally = center.y - 150;
            break;
          case 2:
            cntballx = center.x + 50;
            cntbally = center.y + 150;
            break;
          case 3:
            cntballx = center.x - 50;
            cntbally = center.y + 150;
            break;
        }
        fallingball(currentballid, cntballindex, cntballx, cntbally);
        cntballindex += 1;
      }, 4000);      
      // console.log("cntballid = " + currentballid);
      // console.log("cntballx = " + cntballx + " , cntbally = " + cntbally);

    }, 2000);
    
  }
});

function audioplay_flower(indx) {
  var sound = document.getElementById("flowersound" + indx);
  sound.play();
}

var currentballid, cntballx, cntbally;
var cntballindex = 1;

function fallingball(cntballid, cntblindex, cntblx, cntbly) {
  var imagediv = document.createElement("div");
  imagediv.id =cntballid +  cntblindex;
  imagediv.style.width = "60px";
  imagediv.style.height = "60px";
  imagediv.style.position = "absolute";
  imagediv.style.margin = "0";
  imagediv.style.padding = "0";
  imagediv.style.zIndex= "10";
  imagediv.style.overflow = "visible";
  let container = document.getElementById("container");
  container.appendChild(imagediv);
  $('#' + imagediv.id).css({"left": cntblx, "top": cntbly});

  var imgfile = document.createElement("img");
  imgfile.src = "./image/bloodandcircle/" + randCircle[randballnum];
  imgfile.id = cntballid +  cntblindex + "_ball";
  imgfile.style.width = "60px";
  imgfile.style.height = "60px";
  imgfile.style.margin = "0";
  imgfile.style.padding = "0";
  imgfile.style.position = "absolute";
  imgfile.style.zIndex= 0;
  let container1 = document.getElementById(cntballid +  cntblindex);
  container1.appendChild(imgfile);

  var cntdx = (0.5 - Math.random()) * 5;
  var classindex = Math.round(Math.random() * 1);
  var falldown = setInterval(function() {
    if($('#' + cntballid +  cntblindex).position().top > $('#container').height() - 70) {
      // debugger;
      clearInterval(falldown);
      $('#' + cntballid +  cntblindex).removeClass(ballrotateclass[classindex]);
      // $('#' + cntballid +  cntblindex).addClass(ballrotateclass_land[classindex]);
      setInterval(function(){                
        if(classindex == 0 && cntblx > 5) {
          cntblx += -0.1 - 0.1 * Math.random();
          setposition(cntballid +  cntblindex, cntblx, cntbly);
          $('#' + cntballid +  cntblindex).removeClass(ballrotateclass_land[1]);
          $('#' + cntballid +  cntblindex).addClass(ballrotateclass_land[0]);
        } else if(classindex == 1 && cntblx < $('#container').width() - 60) {
          cntblx += 0.1 + 0.1 * Math.random();
          setposition(cntballid +  cntblindex, cntblx, cntbly);
          $('#' + cntballid +  cntblindex).removeClass(ballrotateclass_land[0]);
          $('#' + cntballid +  cntblindex).addClass(ballrotateclass_land[1]);
        } else if(classindex == 0) {
          $('#' + cntballid +  cntblindex).removeClass(ballrotateclass_land[0]);
          $('#' + cntballid +  cntblindex).addClass(ballrotateclass_land[1]);
          classindex = 1;
        } else {
          $('#' + cntballid +  cntblindex).removeClass(ballrotateclass_land[1]);
          $('#' + cntballid +  cntblindex).addClass(ballrotateclass_land[0]);
          classindex = 0;
        }
      }, 10);
      return;   
    }
    cntbly += 3;
    var direc = 1;
    if (direc == 1 && (cntblx < 5 && cntblx < 0)) {
      direc = 0;
      cntdx = -cntdx;
      cntblx += cntdx;
    } else if(direc == 1 && (cntblx > $('#container').width() - 60 && cntblx > 0)) {
      direc = 0;
      cntdx = -cntdx;
      cntblx += cntdx;
    } else {
      cntblx += cntdx;
    }
    setposition(cntballid +  cntblindex, cntblx, cntbly);  
    $('#' + cntballid +  cntblindex).addClass(ballrotateclass[classindex]);               
  }, 1000 / 100 ); 
}

var ballrotateclass = [
  "rotate_right",
  "rotate_left"
];

var ballrotateclass_land = [
  "rotate_right_ball",
  "rotate_left_ball"
];


// Create flower //

var flowerimg = [  
  "leaff",
  "stick",
  "flower"
];

var flwinx = 1;

function creatflw(cntx) {

  var indx = Math.round(Math.random() * 8) + 1;

  audioplay_flower(indx);

  var cntflwx = cntx * 10 / 20, cntflwy = $('#container').height() * 10 / 20;

  var imagediv = document.createElement("div");
  imagediv.id ="flower_div" +  flwinx;
  imagediv.style.position = "absolute";
  imagediv.style.margin = "0";
  imagediv.style.padding = "0";
  imagediv.style.zIndex= "10";
  imagediv.style.zoom= "200%";
  imagediv.style.overflow = "visible";
  let container = document.getElementById("container");
  container.appendChild(imagediv);
  $('#' + imagediv.id).css({"left": cntflwx, "top": cntflwy});

  for (var i = 0; i < flowerimg.length; i++) {
    var imagediv = document.createElement("div");
    imagediv.id ="flower_div" +  flwinx + "_" + flowerimg[i] + indx;
    imagediv.style.position = "absolute";
    imagediv.style.margin = "0";
    imagediv.style.padding = "0";
    imagediv.style.zIndex= "10";
    imagediv.style.zoom= "1%";
    switch (indx) {
      case 1:
        if(i == 0) {
          imagediv.style.width = "238px";
          imagediv.style.height = "374px";
        } else if(i == 1) {
          imagediv.style.width = "10px";
          imagediv.style.height = "10px";
        } else {
          imagediv.style.width = "318px";
          imagediv.style.height = "319px";
        }
        break;
      case 2:
        if(i == 0) {
          imagediv.style.width = "266px";
          imagediv.style.height = "374px";
        } else if(i == 1) {
          imagediv.style.width = "10px";
          imagediv.style.height = "10px";
        } else {
          imagediv.style.width = "298px";
          imagediv.style.height = "312px";
        }
        break;
      case 3:
        if(i == 0) {
          imagediv.style.width = "266px";
          imagediv.style.height = "374px";
        } else if(i == 1) {
          imagediv.style.width = "10px";
          imagediv.style.height = "10px";
        } else {
          imagediv.style.width = "304px";
          imagediv.style.height = "319px";
        }
        break;
      case 4:
        if(i == 0) {
          imagediv.style.width = "190px";
          imagediv.style.height = "110px";
        } else if(i == 1) {
          imagediv.style.width = "10px";
          imagediv.style.height = "10px";
        } else {
          imagediv.style.width = "304px";
          imagediv.style.height = "339px";
        }
        break;
      case 5:
        if(i == 0) {
          imagediv.style.width = "211px";
          imagediv.style.height = "366px";
        } else if(i == 1) {
          imagediv.style.width = "10px";
          imagediv.style.height = "10px";
        } else {
          imagediv.style.width = "290px";
          imagediv.style.height = "289px";
        }
        break;
      case 6:
        if(i == 0) {
          imagediv.style.width = "392px";
          imagediv.style.height = "220px";
        } else if(i == 1) {
          imagediv.style.width = "10px";
          imagediv.style.height = "10px";
        } else {
          imagediv.style.width = "311px";
          imagediv.style.height = "299px";
        }
        break;
      case 7:
        if(i == 0) {
          imagediv.style.width = "238px";
          imagediv.style.height = "374px";
        } else if(i == 1) {
          imagediv.style.width = "10px";
          imagediv.style.height = "10px";
        } else {
          imagediv.style.width = "307px";
          imagediv.style.height = "293px";
        }
        break;
      case 8:
        if(i == 0) {
          imagediv.style.width = "284px";
          imagediv.style.height = "338px";
        } else if(i == 1) {
          imagediv.style.width = "10px";
          imagediv.style.height = "10px";
        } else {
          imagediv.style.width = "344px";
          imagediv.style.height = "305px";
        }
        break;
      case 9:
        if(i == 0) {
          imagediv.style.width = "238px";
          imagediv.style.height = "374px";
        } else if(i == 1) {
          imagediv.style.width = "10px";
          imagediv.style.height = "10px";
        } else {
          imagediv.style.width = "304px";
          imagediv.style.height = "298px";
        }
        break;
    }
    imagediv.style.overflow = "visible";
    let container = document.getElementById("flower_div" +  flwinx);
    container.appendChild(imagediv);

    var imgfile = document.createElement("img");
    imgfile.style.margin = "0";
    imgfile.style.padding = "0";
    imgfile.style.position = "absolute";
    imgfile.style.zIndex= 0;
    imgfile.src = "./image/flower/" + flowerimg[i] + indx + ".png";
    imgfile.id = flowerimg[i] + indx + ".png";
    var container1 = document.getElementById("flower_div" +  flwinx + "_" + flowerimg[i] + indx);   
    container1.appendChild(imgfile);
  }

  switch (indx) {
    case 1:
      setposition("flower_div" +  flwinx + "_" + "leaff1", -110, -180);
      setposition("flower_div" +  flwinx + "_" + "stick1", -10, -520);
      setposition("flower_div" +  flwinx + "_" + "flower1", -170, -690);
      break;
    case 2:
      setposition("flower_div" +  flwinx + "_" + "leaff2", -125, -180);
      setposition("flower_div" +  flwinx + "_" + "stick2", -10, -520);
      setposition("flower_div" +  flwinx + "_" + "flower2", -150, -680);
      break;
    case 3:
      setposition("flower_div" +  flwinx + "_" + "leaff3", -135, -400);
      setposition("flower_div" +  flwinx + "_" + "stick3", -10, -520);
      setposition("flower_div" +  flwinx + "_" + "flower3", -150, -778);
      break;
    case 4:
      setposition("flower_div" +  flwinx + "_" + "leaff4", -135, -400);
      setposition("flower_div" +  flwinx + "_" + "stick4", -10, -520);
      setposition("flower_div" +  flwinx + "_" + "flower4", -150, -680);
      break;
    case 5:
      setposition("flower_div" +  flwinx + "_" + "leaff5", -10, -190);
      setposition("flower_div" +  flwinx + "_" + "stick5", -10, -520);
      setposition("flower_div" +  flwinx + "_" + "flower5", -50, -680);
      break;
    case 6:
      setposition("flower_div" +  flwinx + "_" + "leaff6", -180, -320);
      setposition("flower_div" +  flwinx + "_" + "stick6", -10, -520);
      setposition("flower_div" +  flwinx + "_" + "flower6", -137, -680);
      break;
    case 7:
      setposition("flower_div" +  flwinx + "_" + "leaff7", -110, -190);
      setposition("flower_div" +  flwinx + "_" + "stick7", -10, -520);
      setposition("flower_div" +  flwinx + "_" + "flower7", -160, -680);
      break;
    case 8:
      setposition("flower_div" +  flwinx + "_" + "leaff8", -100, -390);
      setposition("flower_div" +  flwinx + "_" + "stick8", -10, -520);
      setposition("flower_div" +  flwinx + "_" + "flower8", -170, -680);
      break;
    case 9:
      setposition("flower_div" +  flwinx + "_" + "leaff9", -75, -370);
      setposition("flower_div" +  flwinx + "_" + "stick9", -10, -520);
      setposition("flower_div" +  flwinx + "_" + "flower9", -170, -680);
      break;
  }

  $('#' + "flower_div" +  flwinx + "_" + "flower" + indx).addClass("rotate_flower");
  $('#' + "flower_div" +  flwinx + "_" + "leaff" + indx).addClass("rotate_leaf_right");

  var zoomsize = 1;

  var flwsiz = 30 + Math.random() * 15;

  var growing = setInterval(function() {
    if(zoomsize > flwsiz) {
      clearInterval(growing);  
      flwinx += 1;    
      return;   
    }
    for(var i = 0; i < flowerimg.length; i++){
      var idname = "flower_div" +  flwinx + "_" + flowerimg[i] + indx;
      // console.log(idname);
      document.getElementById(idname).style.zoom = zoomsize + "%";
    }       
    zoomsize += 0.15; 
  }, 1000 / 100 );    

}
