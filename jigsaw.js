
var numPiecesH = 9;
var numPiecesV = 6;
var pieceHeight = 100;
var pieceWidth = 80;
var kerf = 0.25;

function makeSvgElem(tag, attrs) {
  var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (var k in attrs) {
    el.setAttribute(k, attrs[k]);
  }
  return el;
}

function makeSvgPath(path_def) {
  return makeSvgElem('path', {stroke: '#ff0000', fill: 'transparent', d: path_def});
}

function svgCurve(cx, cy, x, y) {
  return 'S ' + cx.toFixed(2) + ',' + cy.toFixed(2) + ' ' + x.toFixed(2) + ',' + y.toFixed(2) + ' ';
}

function jiggle(value, maxJiggle) {
  return value + Math.random() * maxJiggle - maxJiggle / 2.;
}
function readForm() {
  numPiecesH = parseInt($('#num-pieces-h')[0].value);
  numPiecesV = parseInt($('#num-pieces-v')[0].value);
  pieceHeight = parseInt($('#piece-height')[0].value);
  pieceWidth = parseInt($('#piece-width')[0].value);
  kerf = parseFloat($('#piece-kerf')[0].value);
}

function updateTotals() {
  readForm();
  
  $('#total-pieces').text(numPiecesH * numPiecesV);
  $('#total-dimensions').text(numPiecesH*pieceWidth + ' x ' + numPiecesV*pieceHeight);
  $('#aspect-ratio').text((numPiecesH*pieceWidth/(numPiecesV*pieceHeight)).toFixed(4));
}

function onGenerate() {
  readForm();
  
  var svgElem = document.getElementById('svg');
  while (svgElem.firstChild) {
    svgElem.removeChild(svgElem.firstChild);
  }
  var totalWidth = numPiecesH*pieceWidth;
  let canvasWidth = totalWidth;
  if (kerf != 0) {
    canvasWidth += kerf * 2;
  }
  var totalHeight = numPiecesV*pieceHeight;
  let canvasHeight = totalHeight;
  if (kerf != 0) {
    canvasHeight *= 2;
    canvasHeight += kerf * 6;
  }
  svgElem.setAttribute('width', canvasWidth + 'px');
  svgElem.setAttribute('height', canvasHeight + 'px');
  svgElem.appendChild(makeSvgPath('M 0,0 L '+totalWidth+',0 L '+totalWidth+','+totalHeight+' L 0,'+totalHeight+' L 0,0'));

  // Top-down curves
  for (var i = 1; i < numPiecesH; i++) {
    var cur = [i*pieceWidth, 0];
    var prev = null;
    var s = 'M ' + cur[0] + ',' + cur[1] + ' ';
    
    for (var j = 1; j <= numPiecesV; j++) {
      prev = cur;
      cur = [i*pieceWidth, j*pieceHeight];
      
      // Extrude direction
      var extrudeDir = Math.random() < 0.5 ? 1 : -1;

      // Pre-midpoint
      var premidpt = [0.375*cur[0] + 0.625*prev[0],
                      0.375*cur[1] + 0.625*prev[1]];
      premidpt[0] += extrudeDir * jiggle(pieceWidth*0.05, pieceWidth*0.05)
      premidpt[1] += jiggle(pieceHeight*0.05, pieceHeight*0.02)
      s += svgCurve(premidpt[0] - 0.07*pieceWidth*extrudeDir, premidpt[1],
                    premidpt[0], premidpt[1]);

      // Midpoint
      var midpt = [0.5*cur[0] + 0.5*prev[0],
                   0.5*cur[1] + 0.5*prev[1]];
      var midptExtrude = jiggle(pieceWidth*0.2, pieceWidth*0.1);
      midpt[0] += extrudeDir * midptExtrude;
      midpt[1] += jiggle(0, pieceHeight*0.1);
      s += svgCurve(midpt[0], midpt[1] - 0.22*pieceHeight, midpt[0], midpt[1]);

      // Post-midpoint
      var postmidpt = [premidpt[0],
                       0.625*cur[1] + 0.375*prev[1]];
      postmidpt[1] -= jiggle(pieceHeight*0.05, pieceHeight*0.02);
      s += svgCurve(postmidpt[0]+0.07*extrudeDir*pieceWidth, postmidpt[1],
                    postmidpt[0], postmidpt[1]);

      // Corner
      var nudge = [Math.random() * pieceWidth * 0.02 + pieceWidth * 0.02,
                   -Math.random() * pieceHeight * 0.05 - pieceHeight * 0.05];
      s += svgCurve(cur[0]+nudge[0], cur[1]+nudge[1], cur[0], cur[1]);
    }
    
    svgElem.appendChild(makeSvgPath(s));
  }
  
  // Left-right curves
  for (var j = 1; j < numPiecesV; j++) {
    var cur = [0, j*pieceHeight];
    var prev = null;
    var s = 'M ' + cur[0] + ',' + cur[1] + ' ';
    
    for (var i = 1; i <= numPiecesH; i++) {
      prev = cur;
      cur = [i*pieceWidth, j*pieceHeight];
      
      // Extrude direction
      var extrudeDir = Math.random() < 0.5 ? 1 : -1;

      // Pre-midpoint
      var premidpt = [0.375*cur[0] + 0.625*prev[0],
                      0.375*cur[1] + 0.625*prev[1]];
      premidpt[0] += jiggle(pieceWidth*0.05, pieceWidth*0.02)
      premidpt[1] += extrudeDir * jiggle(pieceHeight*0.05, pieceHeight*0.05)
      s += svgCurve(premidpt[0], premidpt[1] - 0.07*pieceHeight*extrudeDir,
                    premidpt[0], premidpt[1]);

      // Midpoint
      var midpt = [0.5*cur[0] + 0.5*prev[0],
                   0.5*cur[1] + 0.5*prev[1]];
      var midptExtrude = jiggle(pieceHeight*0.2, pieceHeight*0.1);
      midpt[0] += jiggle(0, pieceWidth*0.1);
      midpt[1] += extrudeDir * midptExtrude;
      s += svgCurve(midpt[0] - 0.22*pieceWidth, midpt[1], midpt[0], midpt[1]);

      // Post-midpoint
      var postmidpt = [0.625*cur[0] + 0.375*prev[0], premidpt[1]];
      postmidpt[0] -= jiggle(pieceWidth*0.05, pieceWidth*0.02);
      s += svgCurve(postmidpt[0]+0.07*extrudeDir*pieceWidth, postmidpt[1],
                    postmidpt[0], postmidpt[1]);

      // Corner
      var nudge = [-Math.random() * pieceWidth * 0.1 - pieceWidth * 0.1,
                   -Math.random() * pieceHeight * 0.05 - pieceHeight * 0.05];
      s += svgCurve(cur[0]+nudge[0], cur[1]+nudge[1], cur[0], cur[1]);
    }
    svgElem.appendChild(makeSvgPath(s));
  }
  
  $('#output-div').css('display', '');

  //Split the paths for the kerf offset step
  if (kerf != 0) {
    //An array of arrays of arrays of SVG commands
    // SVG commands are stored as objects
    // An array of SVG commands represents one piece side/segment
    // An array of arrays of SVG commants represents one entire line
    // The whole array is the collection of all the lines
    //Horizontal lines are always left-to-right
    let horizontalCuts = [];
    //Vertical lines are always top-to-bottom
    let verticalCuts = [];
    //An array of commands to add
    let currentLine = [];

    //Add the top outermost border
    for (let i = 0; i < numPiecesH; i++) {
      //Add a single side to the line
      currentLine.push([{type: "L", values: [pieceWidth * (i + 1), 0]}]);
    }
    horizontalCuts.push(currentLine);

    //Add the left outermost border
    currentLine = [];
    for (let i = 0; i < numPiecesV; i++) {
      //Add a single side to the line
      currentLine.push([{type: "L", values: [0, pieceHeight * (i + 1)]}]);
    }
    verticalCuts.push(currentLine);

    //Remove the outermost border
    svgElem.removeChild(svgElem.firstChild);
    //Go through and extract each side from the lines
    currentLine = [];
    for (let i = 0; i < numPiecesH + numPiecesV - 2; i++) {
      //Get the next path
      let commands = svgElem.firstChild.getPathData({normalize: true});
      svgElem.removeChild(svgElem.firstChild);
      //Track which side we're on. Each side has 4 segments
      let currentSegment = [];
      let segmentIndex = 0;
      //Go through every command and split them into segments
      for (let j = 0; j < commands.length; j++) {
        //We don't want to track M or Z commands
        if (commands[j].type == "M" || commands[j].type == "Z") continue;

        //Add the current command to the current segment
        currentSegment.push(commands[j]);

        //Increment the segment index, and push the segment if needed
        segmentIndex++;
        //Every 4 commands marks a new segment
        if (segmentIndex >= 4) {
          segmentIndex = 0;
          currentLine.push(currentSegment);
          currentSegment = [];
        }
      }
      //Add the current line to the proper array
      (i < numPiecesH - 1 ? verticalCuts : horizontalCuts).push(currentLine);
      currentLine = [];
    }

    //Add the bottom outermost border
    currentLine = [];
    for (let i = 0; i < numPiecesH; i++) {
      //Add a single side to the line
      currentLine.push([{type: "L", values: [pieceWidth * (i + 1), numPiecesV * pieceHeight]}]);
    }
    horizontalCuts.push(currentLine);

    //Add the right outermost border
    currentLine = [];
    for (let i = 0; i < numPiecesV; i++) {
      //Add a single side to the line
      currentLine.push([{type: "L", values: [numPiecesH * pieceWidth, pieceHeight * (i + 1)]}]);
    }
    verticalCuts.push(currentLine);

    //We now have the paths split into piece sides.
    // Now, put them all together into individual pieces.
    //Make an array of pieces
    let pieces = []
    //Fill the array with each piece's paths, clockwise.
    for (let i = 0; i < numPiecesH; i++) {
      for (let j = 0; j < numPiecesV; j++) {
        //Make a piece and start it in the right place
        let currentPiece = [];
        currentPiece.push({type: "M", values: [i * pieceWidth, j * pieceHeight]});
        
        //Add the top path commands
        currentPiece.push(...horizontalCuts[j][i]);
        //Right
        currentPiece.push(...verticalCuts[i + 1][j]);
        //Bottom
        currentPiece.push(...reverseCommands(horizontalCuts[j + 1][i], (i) * pieceWidth, (j + 1) * pieceHeight));
        //Left
        currentPiece.push(...reverseCommands(verticalCuts[i][j], (i) * pieceWidth, (j) * pieceHeight));

        //Close the piece path and push it to the pieces array
        currentPiece.push({type: "Z", values: []});
        pieces.push(currentPiece);
      }
    }

    //Translate half the pieces down (in a checkerboard pattern), to make the kerf offset work
    for (let i = 0; i < numPiecesH; i++) {
      for (let j = 0; j < numPiecesV; j++) {
        if ((i + j) % 2 == 1) {
          let piece = pieces[j + i * numPiecesV];
          for (let k = 0; k < piece.length; k++) {
            if (piece[k].type == "L" || piece[k].type == "M") {
              piece[k].values[1] += totalHeight + kerf * 4;
            } else if (piece[k].type == "C") {
              piece[k].values[1] += totalHeight + kerf * 4;
              piece[k].values[3] += totalHeight + kerf * 4;
              piece[k].values[5] += totalHeight + kerf * 4;
            }
          }
        }
      }
    }

    //Turn the pieces into actual SVG elements
    for (let i = 0; i < pieces.length; i++) {
      let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setPathData(pieces[i]);
      path.setAttribute("stroke", "#FF0000")
      path.setAttribute("fill", "#FFFFFF")
      svgElem.appendChild(path)
    }
  }
}

function reverseCommands(commands, previousX, previousY) {
  let toReturn = []
  for (let i = 0; i < commands.length; i++) {
    let newCommand = {type: commands[i].type, values: []}
    if (i == 0) {
      newCommand.values.push(previousX, previousY)
    } else {
      newCommand.values.push(commands[i - 1].values[(commands[i - 1].type == "C" ? 4 : 0)],
                             commands[i - 1].values[(commands[i - 1].type == "C" ? 5 : 1)])
    }
    if (commands[i].type == "C") {
      newCommand.values.unshift(commands[i].values[2], commands[i].values[3],
                                commands[i].values[0], commands[i].values[1])
    }
    toReturn.unshift(newCommand)
  }
  return toReturn
}

function onDownload() {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(document.getElementById('svg').outerHTML));
  element.setAttribute('download', 'jigsaw.svg');
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

$(document).ready(function() {
  updateTotals();
  $('input').change(updateTotals);
  $('#button-generate').click(onGenerate);
  $('#button-download').click(onDownload);
});
