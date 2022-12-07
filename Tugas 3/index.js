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
      varying vec3 vNormal;
      void main() {
          vec4 position = vec4(aPosition, 1.0);
          gl_Position = uProjection * uView * uModel * position;
          // gl_Position is the final destination for storing
          //  positional data for the rendered vertex
          vColor = aColor;
          vNormal = aNormal;
          vPosition = (uModel * position).xyz;
      }
      `;
    var vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShaderObject, vertexShaderCode);
    gl.compileShader(vertexShaderObject); // sampai sini sudah jadi .o
    
    // Fragment shader
    var fragmentShaderCode = `
      precision mediump float;
      varying vec3 vColor;
      uniform vec3 uLightConstant;      // It represents the light color
        uniform float uAmbientIntensity;  // It represents the light intensity
        varying vec3 vPosition;
        varying vec3 vNormal;
        uniform vec3 uLightPosition;
        uniform vec3 uViewerPosition;
        uniform mat3 uNormalModel;
      void main() {
          gl_FragColor = vec4(vColor, 1.0);
          vec3 ambient = uLightConstant * uAmbientIntensity;
            vec3 lightDirection = uLightPosition - vPosition;
            vec3 normalizedLight = normalize(lightDirection);
            vec3 normalizedNormal = normalize(uNormalModel * vNormal);
            float cosTheta = dot(normalizedNormal, normalizedLight);
            vec3 diffuse = vec3(0.0, 0.0, 0.0);
            if (cosTheta > 0.0) {
                float diffuseIntensity = cosTheta;
                diffuse = uLightConstant * diffuseIntensity;
                vec3 normalizedReflector = normalize(reflect(-lightDirection, normalizedNormal));
                vec3 normalizedViewer = normalize(uViewerPosition - vPosition);
                float cosPhi = dot(normalizedReflector, normalizedViewer);
                vec3 specular = vec3(0., 0., 0.);
            if (cosPhi > 0.) {
                    float shininessConstant = 100.0;    // bare minimum spec for metal
                    float specularIntensity = pow(cosPhi, shininessConstant);
                    specular = uLightConstant * specularIntensity;
                }
                vec3 phong = ambient + diffuse + specular;
                gl_FragColor = vec4(phong * vColor, 1.0);
                // gl_FragColor is the final destination for storing
                //  color data for the rendered fragment
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
    var isAnimated = false;
    var theta = 0.0;
    var direction = "";
    var dX = 0.0;
    var dY = 0.0;
    
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
    
    // For the lighting and shading
    var uLightConstant = gl.getUniformLocation(shaderProgram, "uLightConstant");
        // Ambient
    var uAmbientIntensity = gl.getUniformLocation(shaderProgram, "uAmbientIntensity");
    gl.uniform3fv(uLightConstant, [1.0, 1.0, 1.0]);   // white color
    gl.uniform1f(uAmbientIntensity, 0.455);             // 40% intensity
        // Diffuse
    var uLightPosition = gl.getUniformLocation(shaderProgram, "uLightPosition");
    gl.uniform3fv(uLightPosition, [1.0, 0.0, 1.0]);
    var uNormalModel = gl.getUniformLocation(shaderProgram, "uNormalModel");
        // Specular
    var uViewerPosition = gl.getUniformLocation(shaderProgram, "uViewerPosition");

    // Kita mengajari GPU bagaimana caranya mengoleksi
    //  nilai posisi dari ARRAY_BUFFER
    //  untuk setiap verteks yang sedang diproses
    var aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 9 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.enableVertexAttribArray(aPosition);
    var aColor = gl.getAttribLocation(shaderProgram, "aColor");
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 9 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(aNormal);
    
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
         theta += 0.01;
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