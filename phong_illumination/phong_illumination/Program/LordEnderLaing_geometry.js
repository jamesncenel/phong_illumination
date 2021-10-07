/*
 * James Lord Ender Laing
 */

var vertices = [];
var twoPi = 6.28318530718;
var twoPiDeg = 360;

//Function for generating the points that make up the cylinder
function generateSurface(surfaceRev)
{
    var thetaInterval = twoPi / surfaceRev.numRotDir;
    var tInterval = 2/surfaceRev.numGenDir;
    var returnVertices = [];

    for(var i = 0; i <= surfaceRev.numRotDir; i++)
    {
        for(var j = 0; j <= surfaceRev.numGenDir; j++)
        {
            returnVertices.push(vec3( Math.cos( thetaInterval * i ), 
                                      -1 + (tInterval * j), 
                                      -1 *  Math.sin( thetaInterval * i ) ) );
        }
    }
    return returnVertices;
}

//Function for generating the points that make up the custom shape
function generateCustomShape(surfaceRev)
{
    var thetaInterval = twoPi / surfaceRev.numRotDir;
    var tInterval = 2/surfaceRev.numGenDir;
    var returnVertices = [];

    for(var i = 0; i <= surfaceRev.numRotDir; i++)
    {
        for(var j = 0; j <= surfaceRev.numGenDir; j++)
        {
            returnVertices.push(vec3( ( ((1/2) * Math.cos(6 * (-1 + (tInterval * j)))) * Math.cos(thetaInterval * i) ), 
                                      -1 + (tInterval * j), 
                                     ( ((1/2) * Math.cos(6 * (-1 + (tInterval * j)))) * (-1 * Math.sin(thetaInterval * i)) ) ) );
        }
    }
    return returnVertices;
}

//Function for generating the normal vectors for the cylinder
function generateNormals(surfaceRev)
{
    var returnNormals = [];
    var thetaInterval = twoPi / surfaceRev.numRotDir;
    var tInterval = 2/surfaceRev.numGenDir;

    for(var i = 0; i <= surfaceRev.numRotDir; i++)
    {
        for(var j = 0; j <= surfaceRev.numGenDir; j++)
        {
            var fullVector = vec3( ( (-1 * Math.cos( thetaInterval * i ) ) + ( (-1 + (tInterval * j) ) * Math.sin(thetaInterval * i)) ), 1, ( (-1 + (tInterval * j) ) * Math.cos(thetaInterval * i) + Math.sin(thetaInterval * i) ) );
            returnNormals.push(vec3(  
                ( ( (-1 * Math.cos( thetaInterval * i ) ) + ( (-1 + (tInterval * j) ) * Math.sin(thetaInterval * i)) )
                / length(fullVector) ),
                
                (1
                / length(fullVector) ),

                ( ( (-1 + (tInterval * j) ) * Math.cos(thetaInterval * i) + Math.sin(thetaInterval * i) )
                / length(fullVector) )

            ) );
        }
    }



    return returnNormals;
}

//Function for generating the normal vectors for the custom shape
function generateCustomNormals(){
    var returnNormals = [];
    var thetaInterval = twoPi / surfaceRev.numRotDir;
    var tInterval = 2/surfaceRev.numGenDir;

    for(var i = 0; i <= surfaceRev.numRotDir; i++)
    {
        for(var j = 0; j <= surfaceRev.numGenDir; j++)
        {
            var fullVector = vec3( 
                            ( ( ( ( (1/2) * Math.cos(6 * (-1 + (tInterval * j))) ) * (-1 * Math.cos(thetaInterval * i) ) ) )    -      ( ( (-1/2) * (-1 + (tInterval * j)) * Math.sin(6 * (-1 + (tInterval * j))) ) * ( -1 * (-1 + tInterval * j) * Math.sin(thetaInterval * i))  )    ),
                            ( ( ( ((-1/2) * Math.sin(6 * (-1 + (tInterval * j)))) * (-1 * Math.sin(thetaInterval * i))) * ( ((1/2) * Math.cos(6 * (-1 + (tInterval * j)))) * (-1 * Math.sin(thetaInterval * i))  ) )     -   ( ( ((-1/2) * Math.sin(6 * (-1 + (tInterval * j)))) * ( Math.cos(thetaInterval * i))) * ( ((1/2) * Math.cos(6 * (-1 + (tInterval * j)))) * (-1 * Math.cos(thetaInterval * i))  ) )  ),
                            ( ( ((-1/2) * (-1 + (tInterval * j)) * Math.sin(6 * (-1 + (tInterval * j)))) * ( (-1 + (tInterval * j)) * Math.cos(thetaInterval * i)))  -  (( ( (1/2) * Math.cos(6 * (-1 + (tInterval * j))) ) * (-1 * Math.sin(thetaInterval * i) ) ))    )
                            );  
            returnNormals.push(vec3(  
                ( ( ( ( ( (1/2) * Math.cos(6 * (-1 + (tInterval * j))) ) * (-1 * Math.cos(thetaInterval * i) ) ) )    -      ( ( (-1/2) * (-1 + (tInterval * j)) * Math.sin(6 * (-1 + (tInterval * j))) ) * ( -1 * (-1 + tInterval * j) * Math.sin(thetaInterval * i))  )    )
                / length(fullVector) ),
                
                ( ( ( ( ((-1/2) * Math.sin(6 * (-1 + (tInterval * j)))) * (-1 * Math.sin(thetaInterval * i))) * ( ((1/2) * Math.cos(6 * (-1 + (tInterval * j)))) * (-1 * Math.sin(thetaInterval * i))  ) )     -   ( ( ((-1/2) * Math.sin(6 * (-1 + (tInterval * j)))) * ( Math.cos(thetaInterval * i))) * ( ((1/2) * Math.cos(6 * (-1 + (tInterval * j)))) * (-1 * Math.cos(thetaInterval * i))  ) )  )
                / length(fullVector) ),

                ( ( ( ((-1/2) * (-1 + (tInterval * j)) * Math.sin(6 * (-1 + (tInterval * j)))) * ( (-1 + (tInterval * j)) * Math.cos(thetaInterval * i)))  -  (( ( (1/2) * Math.cos(6 * (-1 + (tInterval * j))) ) * (-1 * Math.sin(thetaInterval * i) ) ))    )
                / length(fullVector) )

            ) );
        }
    }

    return returnNormals;
}
