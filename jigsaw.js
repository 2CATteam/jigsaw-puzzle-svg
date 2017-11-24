
var numPiecesH = 9;
var numPiecesV = 6;
var pieceHeight = 100;
var pieceWidth = 80;

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
  var totalWidth = numPiecesH*pieceWidth;
  var totalHeight = numPiecesV*pieceHeight;
  svgElem.setAttribute('width', totalWidth + 'px');
  svgElem.setAttribute('height', totalHeight + 'px');
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
