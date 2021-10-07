/*
 * James Lord Ender Laing
 */
 // I've put some code in this file for ideas for set up ..  you don't need to use these data structures

 var canvas;
 var gl;
 var startingIndex;

 var program1;
 var tempVertices = [];
 var tempNormals = [];
 var actualVertices = [];
 var customVertices = [];
 var normalArray = [];
 var testVertices = [];

 //Object that contains the number of faces and rotations of the cylinder and custom shape
 var surfaceRev = 
 {
    numGenDir: 5,
    numRotDir: 20,
    
    inputChoice: 0,	
    CYLINDER: 0,
    MYCHOICE: 0 
 }

//Declaring the indices array that is used for triangulation
var indices = [];

//This next block of code adds the indices to the index array based on the number of rotations and faces
indices.push(0);
indices.push(1);
indices.push(surfaceRev.numGenDir + 1);
for(var j = 1; j < surfaceRev.numGenDir ; j++)
{
    indices.push(j);
    indices.push(j + surfaceRev.numGenDir);
    indices.push(j + (surfaceRev.numGenDir + 1));
    indices.push(j);
    indices.push(j + 1);
    indices.push(j + (surfaceRev.numGenDir + 1));
}
indices.push(surfaceRev.numGenDir);
indices.push(surfaceRev.numGenDir + surfaceRev.numGenDir);
indices.push(surfaceRev.numGenDir + surfaceRev.numGenDir + 1);
for(var i = 0; i < surfaceRev.numRotDir - 1; i++)
{
    for(var j = 0; j < (3 * (surfaceRev.numGenDir * 2)); j++)
    {
        indices.push(indices[(i * (3 * (surfaceRev.numGenDir * 2))) + j] + surfaceRev.numGenDir + 1);
    }
}
var tempLimit = indices.length;
for(var k = 0; k < tempLimit; k++)
{
    indices.push(indices[k] + 126);
}

 var numVertices = (3 * (surfaceRev.numGenDir * 2) ) * (surfaceRev.numRotDir) ;
 
 
 // Object properties
 // You can choose to have one object data structure and re-load when user chooses new SOR
 // OR you can build both and keep track of where 2nd one starts in data structures for GPU (vertexStart)
  
 var object = 
 {
     numPoints: null,
     numTriangles: null,
     
     points: null,
     triangles: null,
      
     // starting vertex in vertices list for GPU (for handling multiple objects)
     vertexStart: 0,
     
     // material properties  
     //original:
    //  ambient: vec4(1.0, 0.0, 1.0, 1.0),
    //  diffuse: vec4(1.0, 0.8, 0.0, 1.0),
    //  specular: vec4(1.0, 0.8, 0.0, 1.0),
    //  shininess: 1.0,
    //gold:
    ambient: vec4(0.24725, 0.1995, 0.0745, 1.0),
    diffuse: vec4(0.75164, 0.60648, 0.22648, 1.0),
    specular: vec4(0.628281, 0.555802, 0.366065, 1.0),
    shininess: 0.4,
    //emerald:
    // ambient: vec4(0.0215, 0.1745, 0.0215, 1.0),
    // diffuse: vec4(0.07568, 0.61424, 0.07568, 1.0),
    // specular: vec4(0.633, 0.727811, 0.633, 1.0),
    // shininess:0.6,

      
     // material properties for transferring to the GPU
     u_ambientProduct: null,
     u_diffuseProduct: null,
     u_specularProduct: null,
     u_shininess: null
 };
 
 var viewer = 
 {
     eye: vec3(0.0, 0.0, -3.0),
     at:  vec3(0.0, 0.0, 0.0),  
     up:  vec3(0.0, 0.1, 0.0),
     
     // for moving around object
     radius: null,
     theta: 0,
     phi: 0
 };
 
 // Create better params that suit your geometry
 var perspProj = 
  {
     fov: 60,
     aspect: 1,
     near: 0.1,
     far: 10
  }
 
 // modelview and project matrices
 var mvMatrix;
 var u_mvMatrix;
 
 var projMatrix;
 var u_projMatrix;
 
 // GPU attributes for vertex position  
 var a_vertexPosition;
 var u_vertexColor;
 
 // Light properties
 // You determine if light defined in world or eye coords
 // Check vertex shader: apply modelview to light or not?
 var light =
 {
     position: vec4(0.0, 0.0, -3.0, 1.0),
     //Light is white (all 1's) by default.
     ambient: vec4(1.0, 1.0, 1.0, 1.0),
     diffuse: vec4(1.0, 1.0, 1.0, 1.0),
     specular: vec4(1.0, 1.0, 1.0, 1.0),
 };
 
 var ambientProductLoc;
 var diffuseProductLoc;
 var specularProductLoc;
 var lightPositionLoc;
 var shininessLoc;
 
 // mouse interaction
  
 var mouse =
 {
     prevX: 0,
     prevY: 0,
 
     leftDown: false,
     rightDown: false,
 };

 startingIndex = [0, numVertices ];
 var startingIndexAlter = 0;
  


 window.onload = function init() {
    console.log("Cylinder minmax box dimensions: ");
    console.log("x dimension: 10, y dimension: 10, z dimension: 10");
    console.log("Custom shape minmax box dimensions: ");
    console.log("x dimension: 10, y dimension: 10, z dimension: 10");
    console.log("Description: The minmax box for both was defined in order to more easily determine the position for the viewer.\n");
    console.log("Initial eye: <0.0, 0.0, -3.0>");
    console.log("Initial at: <0.0, 0.0, 0.0>");
    console.log("Initial up: <0.0, 0.1, 0.0>\n");
    console.log("Initial perspective arguments: " + perspProj.fov + " " + perspProj.aspect + " " + perspProj.near + " " + perspProj.far + "\n");
    console.log("Initial light position: " + light.position);
    

    actualVertices = generateSurface(surfaceRev);
    // actualVertices = generateCustomShape(surfaceRev);
    tempVertices = generateCustomShape(surfaceRev);
    for(var i = 0; i < tempVertices.length; i++)
    {
        actualVertices.push(tempVertices[i]);
    }
    normalArray = generateNormals(surfaceRev);
    // normalArray = generateCustomNormals(surfaceRev);
    tempNormals = generateCustomNormals(surfaceRev);
    for(var i = 0; i < tempNormals.length; i++)
    {
        normalArray.push(tempNormals[i]);
    }

     // set up canvas
     canvas = document.getElementById( "gl-canvas" );
     
     gl = WebGLUtils.setupWebGL( canvas );
     if ( !gl ) { alert( "WebGL isn't available" ); }
     
     // Define viewport size and background color and enable zbuffering
     gl.viewport( 0, 0, canvas.width, canvas.height );
     
     // you need a different color for the background
     gl.clearColor( 1.0, 1.0, 1.0, 1.0 ); 
     
     gl.enable(gl.DEPTH_TEST);
 
     //  Load shaders:  program1 for shading
     program1 = initShaders( gl, "vertex-shader1", "fragment-shader" );
     gl.useProgram( program1 );

     //Initializes the radius for the viewer
     var diff = subtract(viewer.eye,viewer.at);
     viewer.radius = length(diff);

    // Pre-compute lighting model products
    object.ambientProduct = mult(object.ambient, light.ambient);
    object.diffuseProduct = mult(object.diffuse, light.diffuse);
    object.specularProduct = mult(object.specular, light.specular);
     //array element buffer
     var iBuffer = gl.createBuffer();
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);
    
     // buffer for normals
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalArray), gl.STATIC_DRAW );

    var a_vertexNormal = gl.getAttribLocation( program1, "a_vertexNormal" );
    gl.vertexAttribPointer( a_vertexNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( a_vertexNormal);

    // buffer for vertices
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(actualVertices), gl.STATIC_DRAW );
    
    var a_vertexPosition = gl.getAttribLocation( program1, "a_vertexPosition" );
    gl.vertexAttribPointer( a_vertexPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( a_vertexPosition );

    
     u_mvMatrix = gl.getUniformLocation( program1, "u_mvMatrix" );
     u_projMatrix = gl.getUniformLocation( program1, "u_projMatrix" );

    //  gl.uniform4fv( gl.getUniformLocation(program1, 
    //     "ambientProduct"),flatten(object.ambientProduct) );
    //  gl.uniform4fv( gl.getUniformLocation(program1, 
    //     "diffuseProduct"),flatten(object.diffuseProduct) );
    //  gl.uniform4fv( gl.getUniformLocation(program1, 
    //     "specularProduct"),flatten(object.specularProduct) );	
    //  gl.uniform4fv( gl.getUniformLocation(program1, 
    //     "lightPosition"),flatten(light.position) );
    //  gl.uniform1f( gl.getUniformLocation(program1, 
    //     "shininess"),object.shininess );
     
     //mvMatrix and Projection Matrix altered:
     mvMatrix = lookAt(viewer.eye, viewer.at , viewer.up);
    //  projMatrix = ortho(left, right, bottom, ytop, perspProj.near, perspProj.far);
     projMatrix = perspective(perspProj.fov, perspProj.aspect, perspProj.near, perspProj.far);
     
     
     //Mouse movement code
     document.getElementById("gl-canvas").onmousedown = function (event)
     {
         if(event.button == 0 && !mouse.leftDown)
         {
             mouse.leftDown = true;
             mouse.prevX = event.clientX;
             mouse.prevY = event.clientY;
         }
         else if (event.button == 2 && !mouse.rightDown)
         {
             mouse.rightDown = true;
             mouse.prevX = event.clientX;
             mouse.prevY = event.clientY;
         }
     };
 
     document.getElementById("gl-canvas").onmouseup = function (event)
     {
         // Mouse is now up
         if (event.button == 0)
         {
             mouse.leftDown = false;
         }
         else if(event.button == 2)
         {
             mouse.rightDown = false;
         }
 
     };
 
     document.getElementById("gl-canvas").onmouseleave = function ()
     {
         // Mouse is now up
         mouse.leftDown = false;
         mouse.rightDown = false;
     };
 
 
     document.getElementById("gl-canvas").onmousemove = function (event)
     {
         // Get changes in x and y
         var currentX = event.clientX;
         var currentY = event.clientY;
 
         var deltaX = event.clientX - mouse.prevX;
         var deltaY = event.clientY - mouse.prevY;
         
         var makeChange = 0;
 
         // Only perform actions if the mouse is down
         // Compute camera rotation on left click and drag
         if (mouse.leftDown)
         {
             makeChange = 1;
             
             // Perform rotation of the camera
             if (viewer.up[1] > 0)
             {
                 viewer.theta -= 0.01 * deltaX;
                 viewer.phi -= 0.01 * deltaY;
             }
             else
             {
                 viewer.theta += 0.01 * deltaX;
                 viewer.phi -= 0.01 * deltaY;
             }
             
             // Wrap the angles
             var twoPi = 6.28318530718;
             if (viewer.theta > twoPi)
             {
                 viewer.theta -= twoPi;
             }
             else if (viewer.theta < 0)
             {
                 viewer.theta += twoPi;
             }
 
             if (viewer.phi > twoPi)
             {
                 viewer.phi -= twoPi;
             }
             else if (viewer.phi < 0)
             {
                 viewer.phi += twoPi;
             }
 
         }
         else if(mouse.rightDown)
         {
             makeChange = 1;
             // Perform zooming
              
             viewer.radius -= 0.01 * deltaX;
          
             viewer.radius = Math.max(0.1, viewer.radius);
         }
 
         if(makeChange == 1) {
             
             
             // Recompute eye and up for camera
             var threePiOver2 = 4.71238898;
             var piOver2 = 1.57079632679;
             
             var pi = 3.14159265359;
             
             var r = viewer.radius * Math.sin(viewer.phi + piOver2);
              
             
             viewer.eye = vec3(r * Math.cos(viewer.theta + piOver2), viewer.radius * Math.cos(viewer.phi + piOver2), r * Math.sin(viewer.theta + piOver2));
             
             //add vector (at - origin) to move 
             for(k=0; k<3; k++)
                 viewer.eye[k] = viewer.eye[k] + viewer.at[k];
             
             
             // move down -z axis ?????
             //viewer.eye[2] = viewer.eye[2] - viewer.radius;
             
             
             if (viewer.phi < piOver2 || viewer.phi > threePiOver2) {
                 viewer.up = vec3(0.0, 1.0, 0.0);
             }
             else {
                 viewer.up = vec3(0.0, -1.0, 0.0);
             }
             // Recompute the view
             mvMatrix = lookAt(vec3(viewer.eye), viewer.at, viewer.up);
              
 
             mouse.prevX = currentX;
             mouse.prevY = currentY;
         }
     };

     //Buttons/UI Handlers:
     document.getElementById('toggleObjects').onclick = function()
     {
        if(startingIndexAlter == 0)
        {
            startingIndexAlter = 1;
        }
        else{
            startingIndexAlter = 0;
        }
     }

     document.getElementById('goldMaterial').onclick = function()
     {
        object.ambient = vec4(0.24725, 0.1995, 0.0745, 1.0);
        object.diffuse = vec4(0.75164, 0.60648, 0.22648, 1.0);
        object.specular = vec4(0.628281, 0.555802, 0.366065, 1.0);
        object.shininess = 0.4;

        object.ambientProduct = mult(object.ambient, light.ambient);
        object.diffuseProduct = mult(object.diffuse, light.diffuse);
        object.specularProduct = mult(object.specular, light.specular);

        document.getElementById('shineSlider').value = 40;
        document.getElementById("currentValueShine").innerHTML = 40;
     }

     document.getElementById('emeraldMaterial').onclick = function()
     {
        // object.ambient = vec4(0.05, 0.0, 0.0, 1.0);
        // object.diffuse = vec4(0.5, 0.4, 0.4, 1.0);
        // object.specular = vec4(0.7, 0.04, 0.04, 1.0);
        // object.shininess = 0.078125;
        
        object.ambient= vec4(0.0215, 0.1745, 0.0215, 1.0)
        object.diffuse = vec4(0.07568, 0.61424, 0.07568, 1.0);
        object.specular= vec4(0.633, 0.727811, 0.633, 1.0);
        object.shininess=0.6

        object.ambientProduct = mult(object.ambient, light.ambient);
        object.diffuseProduct = mult(object.diffuse, light.diffuse);
        object.specularProduct = mult(object.specular, light.specular);

        document.getElementById('shineSlider').value = 60;
        document.getElementById("currentValueShine").innerHTML = 60;
     }
      
     document.getElementById('whiteLight').onclick = function()
     {
        light.ambient = vec4(1.0, 1.0, 1.0, 1.0);
        light.diffuse = vec4(1.0, 1.0, 1.0, 1.0);
        light.specular = vec4(1.0, 1.0, 1.0, 1.0);

        object.ambientProduct = mult(object.ambient, light.ambient);
        object.diffuseProduct = mult(object.diffuse, light.diffuse);
        object.specularProduct = mult(object.specular, light.specular);
     }

     document.getElementById('greenLight').onclick = function()
     {
        light.ambient = vec4(0.0, 0.05, 0.0, 1.0);
        light.diffuse = vec4(0.4, 0.5, 0.4, 1.0);
        light.specular = vec4(0.04, 0.7, 0.04, 1.0);

        object.ambientProduct = mult(object.ambient, light.ambient);
        object.diffuseProduct = mult(object.diffuse, light.diffuse);
        object.specularProduct = mult(object.specular, light.specular);
     }

     document.getElementById('eyePosition').onclick = function()
     {
        light.position= vec4(0.0, 0.0, -3.0, 1.0)
     }
     document.getElementById('otherPosition').onclick = function()
     {
        light.position= vec4(1.5, 1.0, -5.0, 1.0)
     }

     document.getElementById('shineSlider').onchange = function()
     {
         object.shininess = document.getElementById('shineSlider').value/100;
     }
     render();
 }
 
 var render = function() {
     
     gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

     gl.uniform4fv( gl.getUniformLocation(program1, 
        "ambientProduct"),flatten(object.ambientProduct) );
     gl.uniform4fv( gl.getUniformLocation(program1, 
        "diffuseProduct"),flatten(object.diffuseProduct) );
     gl.uniform4fv( gl.getUniformLocation(program1, 
        "specularProduct"),flatten(object.specularProduct) );	
     gl.uniform4fv( gl.getUniformLocation(program1, 
        "lightPosition"),flatten(light.position) );
     gl.uniform1f( gl.getUniformLocation(program1, 
        "shininess"),object.shininess );

     mvMatrix = lookAt(viewer.eye, viewer.at , viewer.up);
     perspProj.fov = document.getElementById('fovSlider').value;
     projMatrix = perspective(perspProj.fov, perspProj.aspect, perspProj.near, perspProj.far);     
    //  projMatrix = ortho(left, right, bottom, ytop, perspProj.near, perspProj.far);
     gl.uniformMatrix4fv(u_mvMatrix, false, flatten(mvMatrix) );
     gl.uniformMatrix4fv(u_projMatrix, false, flatten(projMatrix) );
     

     gl.drawElements( gl.TRIANGLES, numVertices , gl.UNSIGNED_BYTE, startingIndex[startingIndexAlter] );
          
     requestAnimFrame(render);
}
 