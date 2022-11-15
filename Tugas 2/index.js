import { vertices, indices } from "./vertices_indices.js"

function main() {
    var kanvas = document.getElementById("kanvas");
    var gl = kanvas.getContext("webgl");
    
    var kanvas = document.getElementById("kanvas");
    var gl = kanvas.getContext("webgl");
    
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
    // Vertex shader
    var vertexShaderCode = `
      attribute vec3 aPosition;  
      attribute vec3 aColor;
      uniform mat4 uModel;
      uniform mat4 uView;
      uniform mat4 uProjection;
      varying vec3 vColor;
      void main() {
          gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
          vColor = aColor;
      }
      `;
    var vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShaderObject, vertexShaderCode);
    gl.compileShader(vertexShaderObject); // sampai sini sudah jadi .o
    
    // Fragment shader
    var fragmentShaderCode = `
      precision mediump float;
      varying vec3 vColor;
      void main() {
          gl_FragColor = vec4(vColor, 1.0);
      }
      `;
    var fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShaderObject, fragmentShaderCode);
    gl.compileShader(fragmentShaderObject); // sampai sini sudah jadi .o
    
    var shaderProgram = gl.createProgram(); // wadah dari executable (.exe)
    gl.attachShader(shaderProgram, vertexShaderObject);
    gl.attachShader(shaderProgram, fragmentShaderObject);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);
    
    // Variabel lokal
    var theta = 0.0;
    var thetax = 0.0;
    var freeze = false;
    var horizontalSpeed = 0.0;
    var verticalSpeed = 0.0;
    var horizontalDelta = 0.0;
    var verticalDelta = 0.0;
    
    // Variabel pointer ke GLSL
    var uModel = gl.getUniformLocation(shaderProgram, "uModel");
    // View
    var cameraX = 0.0;
    var cameraZ = 7.5;
    var uView = gl.getUniformLocation(shaderProgram, "uView");
    var view = glMatrix.mat4.create();
    glMatrix.mat4.lookAt(
      view,
      [cameraX, 0.0, cameraZ], // the location of the eye or the camera
      [cameraX, 0.0, 0.0], // the point where the camera look at
      [0.0, 1.0, 0.0]
    );
    // Projection
    var uProjection = gl.getUniformLocation(shaderProgram, "uProjection");
    var perspective = glMatrix.mat4.create();
    glMatrix.mat4.perspective(perspective, (5*Math.PI)/12, 1.0, 0.5, 50.0);
    
    // Kita mengajari GPU bagaimana caranya mengoleksi
    //  nilai posisi dari ARRAY_BUFFER
    //  untuk setiap verteks yang sedang diproses
    var aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.enableVertexAttribArray(aPosition);
    var aColor = gl.getAttribLocation(shaderProgram, "aColor");
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(aColor);
    
    // Grafika interaktif
    // Tetikus
    function onMouseClick(event) {
      freeze = !freeze;
    }
    document.addEventListener("click", onMouseClick);
    // Papan ketuk
    function onKeydown(event) {
      if (event.keyCode == 32) freeze = !freeze; // spasi
      // Gerakan horizontal: a ke kiri, d ke kanan
      if (event.keyCode == 37) {
        // arrow-kiri
        theta += -0.1;
      } else if (event.keyCode == 39) {
        // arrow-kanan
        theta += 0.1;
      }
      // Gerakan vertikal: w ke atas, s ke bawah
      if (event.keyCode == 38) {
        // w
        thetax -= 0.1;
      } else if (event.keyCode == 40) {
        // s
        thetax += 0.1;
      }
    }
    function onKeyup(event) {
      if (event.keyCode == 32) freeze = !freeze;
      if (event.keyCode == 37 || event.keyCode == 39) horizontalSpeed = 0.0;
      if (event.keyCode == 38 || event.keyCode == 40) verticalSpeed = 0.0;
    }
    document.addEventListener("keydown", onKeydown);
    document.addEventListener("keyup", onKeyup);
    
    function render() {
      gl.enable(gl.DEPTH_TEST);
      gl.clearColor(0.17,      0.8,    0.44,    1.0);  // Oranye
      //            Merah     Hijau   Biru    Transparansi
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      if (!freeze) {
        // theta += 0.01;
      }
      horizontalDelta += horizontalSpeed;
      verticalDelta -= verticalSpeed;
      var model = glMatrix.mat4.create(); // Membuat matriks identitas
      glMatrix.mat4.translate(
        model, model, [horizontalDelta, verticalDelta, 0.0]
      );
      glMatrix.mat4.rotateX(
        model, model, thetax
      );
      glMatrix.mat4.rotateY(
        model, model, theta
      );
      gl.uniformMatrix4fv(uModel, false, model);
      gl.uniformMatrix4fv(uView, false, view);
      gl.uniformMatrix4fv(uProjection, false, perspective);
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

main();