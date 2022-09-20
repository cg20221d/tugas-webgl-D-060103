function main() {
    var canvas = document.getElementById("myCanvas");
    var gl = canvas.getContext('webgl');


    var vertices = [
        // angka 2
        0.2, 0.42,
        0.2, 0.3,
        0.7, 0.3,
        0.7, 0.4,
        0.35, 0.4,
        0.7, 0.6,
        0.7, 0.8,
        0.6, 0.9,
        0.3, 0.9,
        0.2, 0.8,
        0.2, 0.65,
        0.32, 0.65,
        0.32, 0.8,
        0.6, 0.8,
        0.6, 0.67,

        // Angka 3
        -0.9, 0.3, -0.9, 0.5, -0.7, 0.5, -0.5, 0.5, -0.5, 0.5, -0.5, 0.1, -0.5, 0.1, -0.5, -0.1, -0.5, -0.5, -0.5, -0.5, -0.8, -0.5, -0.9, -0.5, -0.9, -0.3, -0.6, -0.45, -0.6, -0.1, -0.8, -0.1, -0.8, 0.1, -0.6, 0.1, -0.6, 0.45,

        //huruf A
        -0.3, -0.1, -0.45, -0.1, -0.7, -0.9,

        -0.7, -0.9, -0.55, -0.9, -0.3, -0.1,

        -0.3, -0.1, -0.05, -0.9, -0.2, -0.9,

        -0.2, -0.9, -0.45, -0.1, -0.3, -0.1,

        -0.55, -0.6, -0.55, -0.7, -0.25, -0.6,

        -0.25, -0.6, -0.25, -0.7, -0.55, -0.7,

        0.2, 0.10,
        0.2, 0.5,
        0.2, 0.1,
        0.4, 0.5,
        0.6, 0.10,

    ];

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    //membuat vertex
    var vertexShaderCode = document.getElementById("vertexShaderCode").text;
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderCode);
    gl.compileShader(vertexShader);

    // membuat fragment
    var fragmentShaderCode = document.getElementById("fragmentShaderCode").text;
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderCode);
    gl.compileShader(fragmentShader);

    // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // var aPosition = gl.getAttribLocation(shaderprogram, "aPosition");
    // gl.vertexAttributPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(aPosition);
    // menambahkan input shader ke package agar bisa dicompile
    var shaderprogram = gl.createProgram();
    gl.attachShader(shaderprogram, vertexShader);
    gl.attachShader(shaderprogram, fragmentShader);
    gl.linkProgram(shaderprogram);
    gl.useProgram(shaderprogram);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    var coord = gl.getAttribLocation(shaderprogram, "aPosition");
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

    // membuat warna backgroun
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST); // cuman beda ini
    // mengosongkan canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height); // cuman beda ini
    // mulai menggambar
    // gl.drawArrays(gl.LINE_STRIP, 0, 6);

    // Angka 2
    gl.drawArrays(gl.LINE_LOOP, 0, 15);

    // ANGKA 3
    gl.drawArrays(gl.LINE_LOOP, 15, 19);

    // HURUF A
    gl.drawArrays(gl.TRIANGLE_FAN, 34, 12);
    gl.drawArrays(gl.TRIANGLE_FAN, 46, 6);

};