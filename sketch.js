const screen_width = 720;
const screen_height = 720;

const half_width = (screen_width / 2);
const half_height = (screen_height / 2);

const quarter_width = (screen_width / 4);
const quarter_height = (screen_height / 4);

const threequarter_width = (3 * screen_width / 4);
const threequarter_height = (3 * screen_height / 4);

const scale = 300;
const point_scale = 64;
const samples = 16384;

const c1 = '#ffcc00';
const c2 = '#222222';
const c3 = '#22222240';
const c4 = '#888888';
const c5 = '#ff4444c0';
const c6 = '#44ff44c0';

const max_freq = 12;

var fourier_real;
var fourier_imag;
var fourier_freq;

var values;
var visible_values;

var cycle_time;
var cur_freq;

var started;

var funcs;
var func_names;

var cur_func;

function init_funcs () {
    funcs = [];
    func_names = [];
    cur_func = 0;
    
    funcs.push (function (t) {
        return sin(t * TAU * 3);
    })
    
    func_names.push ("sine.png");
    
    funcs.push (function (t) {
        return 2 * (3*t - floor(3*t)) - 1;
    })
    
    func_names.push ("saw.png");
    
    funcs.push (function (t) {
        if (3*t - floor(3*t) < 0.5) {
            return 1;
        }
        else return -1;
    });
    
    func_names.push ("square.png")
}

function prev_function () {
    cur_func --;
    if (cur_func < 0) {
        cur_func = func_names.length - 1;
    }
    
    update_values();
    stop_anim();
    
    fourier_real = [];
    fourier_imag = [];
    fourier_freq = [];
    
    update_function();
}

function next_function () {
    cur_func ++
    if (cur_func >= func_names.length) {
        cur_func = 0;
    }
    
    update_values();
    stop_anim();
    
    fourier_real = [];
    fourier_imag = [];
    fourier_freq = [];
    
    update_function();
}

function update_function () {
    document.getElementById("wave").src = func_names[cur_func];
}

function start_anim () {
    started = true;
}

function stop_anim () {
    started = false;
}

function reset_anim () {
    fourier_real = [];
    fourier_imag = [];
    fourier_freq = [];
    cycle_time = samples;
    freq = 1;
}

function init_visible () {
    visible_values = [];
    for (var i = 0; i < samples; i ++) {
        visible_values[i] = 0;
    }
}

function update_visible () {
    for (var i = 0; i < values.length; i ++) {
        visible_values[i] = (visible_values[i] * 4 + values[i]) / 5;
    }
}

function update_fourier (x, yreal, yimag) {
    fourier_freq.push(x);
    fourier_real.push(yreal);
    fourier_imag.push(yimag);
}

function update_values () {
    values = [];
    for (var i = 0; i < samples; i ++) {
        values[i] = funcs[cur_func](i / samples);
    }
}


function setup () {
    createCanvas (screen_width, screen_height);
    
    init_visible();
    
    init_funcs();
    update_values();
    
    for (var i = 0; i < func_names.length; i ++) {
        (new Image()).src = func_names[i];
    } 
    
    
    cycle_time = samples;
    
    fourier_freq = [];
    fourier_real = [];
    fourier_imag = [];
    
    start = false;
    freq = 1.0;
}


function draw () {
    background(0);
    strokeWeight(1);
    
    update_visible();
    
    /* Axes */
    stroke(c2);
    
    line(0, quarter_height, screen_width, quarter_height); /* X */
    line(half_width, threequarter_height, screen_width, threequarter_height); 
    line(half_width, half_height, half_width, screen_height); 
    line(scale, threequarter_height, half_width - scale, threequarter_height);
    line(quarter_width, half_height + scale, quarter_width, screen_height - scale);
    
    line(0, 0, 0, half_height); /* Y */
    
    if (started && freq < max_freq) {
        freq += 0.1;
        cycle_time = samples / freq;
    }
    
    /* Function */
    var int_x = 0;
    var int_y = 0;
    
    var last_x_scale = half_width;
    var last_b_scale = threequarter_height;
    var last_c_scale = threequarter_height;
    
    /* Plot of fourier transform */
    for (var i = 0; i < fourier_freq.length; i ++) {
        var a = (fourier_freq[i] - 1) * half_width / max_freq; 
        var b = fourier_real[i] / 8;
        var c = fourier_imag[i] / 8;
        
        var x_scale = a + half_width;
        var b_scale = threequarter_height - (b / 8);
        var c_scale = threequarter_height - (c / 8);
        
        stroke(c5);
        line(x_scale, b_scale, last_x_scale, last_b_scale);
        
        stroke(c6);
        line(x_scale, c_scale, last_x_scale, last_c_scale);
        
        last_x_scale = x_scale;
        last_b_scale = b_scale;
        last_c_scale = c_scale;
    }
    
    stroke(c2);
    
    for (var i = 0; i < samples / cycle_time; i ++) {
        var x = i * cycle_time;
        line(x * screen_width / samples, scale / 2, x * screen_width / samples, half_height - (scale / 2)); /* Cycles */
    }
    
    stroke(c1);
    
    for (var i = 0; i < samples; i ++) {
        var x = cos(-TAU * (i / cycle_time)) * visible_values[i];
        var y = sin(-TAU * (i / cycle_time)) * visible_values[i];
        
        int_x += x;
        int_y += y;
       
        var x_scale = quarter_width + (x * scale / 2);
        var y_scale = threequarter_height - (y * scale / 2);
        
        point (x_scale, y_scale);
    }
    
    for (var i = 0; i < screen_width; i ++) {
        var x = floor(i * samples / screen_width);
        var y = visible_values [x];
        
        var y_scale = quarter_height - (y * scale / 4);
        point (i, y_scale);
    }
   
    var f = samples / cycle_time;
    update_fourier(f, int_x, int_y) 
    
    fill(c1);
    ellipse(quarter_width + (int_x / point_scale), threequarter_height - (int_y / point_scale), 10, 10);
    
    stroke(c5);
    line(quarter_width, threequarter_height, quarter_width + (int_x / point_scale), threequarter_height);
    
    stroke(c6);
    line(quarter_width + (int_x / point_scale), threequarter_height, quarter_width + (int_x / point_scale), threequarter_height - (int_y / point_scale));
}
