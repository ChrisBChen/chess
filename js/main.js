
let margin = {top: 40, right: 10, bottom: 60, left: 60};

let width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

let squareside = width/8

// This sets how much smaller the pieces are relative to the square
let pieceScale = 1

// This function adjusts a set of coordinates into an SVG coordinate within the nearest square (snap-to function)
function snapSquare(x, y) {
    var x_new = Math.trunc(x/squareside) * squareside
    var y_new = squareside*8 - Math.trunc((squareside*8 - y)/squareside) * squareside - squareside
    return [x_new, y_new]
}
// This function encodes an SVG coordinate into a two-digit number coordinate (e.g. 66 = f6)
function encodeSquare(x, y) {
    var x_val = (Math.trunc(x/squareside) + 1) * 10
    var y_val = Math.trunc((squareside*8 - y)/squareside)
    return (x_val + y_val)
}

// This function decodes two-digit number coordinates (e.g. 66 = f6) into an SVG coordinate
function decodeSquare(encodedValue) {
    var y = squareside * 8 - (encodedValue % 10 * squareside)
    var x = Math.trunc(encodedValue / 10) * squareside - squareside
    return [x, y]
}


//Initialize global variables
var players;
var board;
var ball;
var landings;
var ballpos = [];
var csvData;
var Tooltip;

var pieceArray;
var boardArray;
var spritesArray;
var pieceList = [
    "white_king", "white_queen", "white_king_rook", "white_queen_rook", 
    "white_king_knight", "white_queen_knight", "white_king_bishop", "white_queen_bishop", 
    "white_k_pawn", "white_q_pawn", "white_kr_pawn", "white_qr_pawn", 
    "white_kn_pawn", "white_qn_pawn", "white_kb_pawn", "white_qb_pawn",
    "black_king", "black_queen", "black_king_rook", "black_queen_rook",
    "black_king_knight", "black_queen_knight", "black_king_bishop", "black_queen_bishop",
    "black_k_pawn", "black_q_pawn", "black_kr_pawn", "black_qr_pawn",
    "black_kn_pawn", "black_qn_pawn", "black_kb_pawn", "black_qb_pawn"
]
var shortPieceList = [
    "K", "Q", "R", "R", "N", "N", "B", "B",
    "P", "P", "P", "P", "P", "P", "P", "P",
    "k", "q", "r", "r", "n", "n", "b", "b",
    "p", "p", "p", "p", "p", "p", "p", "p"
]
var selectedPiece;
var gameState;

//Initialization functions
drawBoard();
drawPlayers();

//Button presses
// Activates to generate random ball position
document.getElementById("ball-gen").onclick = drawBoard
// Activates to calculate and plot time to intercept
document.getElementById("ball-gen-100").onclick = drawBoard
document.getElementById("clear-landings").onclick = drawBoard
document.getElementById("reset-board").onclick = drawPlayers

function drawBoard(){
    board = d3.select("#board").append("svg")
        .attr("id","field-svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



    squares = board.append("g")
        .attr("id","squares-group")

    darksquares = squares.append("g")
        .attr("id","dark-squares-group")

    lightsquares = squares.append("g")
        .attr("id","light-squares-group")

    //Draw dark squares
    for (i = 0; i < 8; i++) {
        for (j = 0; j < 4; j++) {
            darksquares.append("rect")
                .attr("id","dark-squares")
                .attr('x', j * 2 * squareside + ( (i + 1) % 2) * squareside)
                .attr('y', i * squareside)
                .attr("stroke","black")
                .attr("fill","#C4A484")
                .attr('pointer-events', 'all')
                .attr("width", squareside)
                .attr("height", squareside)
        }
    }

    //Draw light squares
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 4; j++) {
            lightsquares.append("rect")
                .attr("id","dark-squares")
                .attr('x', j * 2 * squareside + ( i % 2) * squareside)
                .attr('y', i * squareside)
                .attr("stroke","black")
                .attr("fill","white")
                .attr('pointer-events', 'all')
                .attr("width", squareside)
                .attr("height", squareside)
        }
    }

}

// This function resets the piece array to the starting locations of all 32 pieces
// The piece array is comprised of a 32-size list, representing the location of each individual piece in the following
// order:
// White pieces first, then black pieces:
//      King, queen, king rook, queen rook, king knight, queen knight, king bishop, queen bishop,
//      k pawn, q pawn, kr pawn, qr pawn, kn pawn, qn pawn, kb pawn, qb pawn
//
// Position is encoded by a two-digit number, where the first digit represents column and second represents row
//      e.g. 64 represents the square f4
// If the piece is captured, the value sets to 99
function initializePieceArray(){
    pieceArray = [
        51, 41, 81, 11, 71, 21, 61, 31,
        52, 42, 82, 12, 72, 22, 62, 32,
        58, 48, 88, 18, 78, 28, 68, 38,
        57, 47, 87, 17, 77, 27, 67, 37
    ]
    spritesArray = [
        "wk","wq","wr","wr","wn","wn","wb","wb",
        "wp","wp","wp","wp","wp","wp","wp","wp",
        "bk","bq","br","br","bn","bn","bb","bb",
        "bp","bp","bp","bp","bp","bp","bp","bp"
    ]
}

// This function resets the board array to the starting locations of all 32 boards
// The board array is comprised of each part of the 8x8 board, where capital letters are white and lowercase are black
function initializeBoardArray(){
    boardArray = [
        ["r", "n", "b", "q", "k", "b", "n", "r"],
        ["p", "p", "p", "p", "p", "p", "p", "p"],
        [" " ," " ," " ," " ," " ," " ," " , " "],
        [" " ," " ," " ," " ," " ," " ," " , " "],
        [" " ," " ," " ," " ," " ," " ," " , " "],
        [" " ," " ," " ," " ," " ," " ," " , " "],
        ["P", "P", "P", "P", "P", "P", "P", "P"],
        ["R", "N", "B", "Q", "K", "B", "N", "R"]
    ]
}

function drawPlayers(){

    // Clear any existing pieces
    d3.selectAll("#players")
        .remove();

    initializePieceArray();
    initializeBoardArray();
    updateHTMLArrays();

    // Define player group
    players = d3.select("#board").select("svg")
        .append("g")
        .attr("id","players")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Draw players
    // For all the pieces in pieceArray:
    for (let i = 0; i < 32; i++) {
        // If the piece hasn't been captured:
        if (pieceArray[i] !== 99){
            // Then draw the piece
            players.append("image")
                .attr('xlink:href','pieces/' + spritesArray[i] + '.png')
                .attr('class', 'piece')
                .attr('id', pieceList[i])
                .attr('height', squareside * pieceScale)
                .attr('width', squareside * pieceScale)
                .attr('y', decodeSquare(pieceArray[i])[1] )
                .attr('x', decodeSquare(pieceArray[i])[0] )
        }
    }


    // Define individual drag functionalities
    let drag = d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);

    //Add drag capabilities to players
    players.selectAll('image')
        .call(drag);

    /*
    Initialize the game state, which tracks whose turn it is, whether castling is possible, and whether en passant
    might be possible, in that order

    Turn: white is false, black is true
    castling possible: no is false, yes is true
    en passant possible: no is 0, yes is represented by a 1-8 based on the pawn's column
    king is in check: no is false, yes is true
    */
    gameState = {
        blackToMove: false,
        castlingPossible: false,
        enPassant: 0,
        kingInCheck: false
    }
}

/*
//Initializes coordinate tooltip (distance and angle display)
function initializeCoordinateTooltip(){

    coordTooltip = d3.select("#board")
        .select("svg")
        .append("g")
        .attr("id","coordtooltip-group")

    coordTooltip.append("text")
        .attr("class","tooltip-text")
        .attr("id","coordtooltip-distance")
        .attr("pointer-events","none")
        .attr("fill","black")
        .attr("x",10)
        .attr("y",10);

    coordTooltip.append("text")
        .attr("class","tooltip-text")
        .attr("id","coordtooltip-angle")
        .attr("pointer-events","none")
        .attr("fill","black")
        .attr("x",10)
        .attr("y",10);

    players.selectAll("circle")
        .on("mouseover", function(mouse,data) {
            var tempx = xfieldLineScaleAdjusted.invert($(this).attr("cx"))
            var tempy = yfieldLineScale.invert($(this).attr("cy"))
            var tempdist = Math.sqrt(tempx ** 2 + tempy ** 2)
            var tempangle = Math.atan(tempx/tempy)*180/Math.PI

            coordTooltip.select("#coordtooltip-distance")
                .attr("x",10)
                .attr("y",height - 25)
                .text("Distance: " + d3.format(".1f")(tempdist) + " ft.")
                .transition()
                .duration(150)
                .attr("fill-opacity",1)

            coordTooltip.select("#coordtooltip-angle")
                .attr("x",10)
                .attr("y",height - 10)
                .text("Angle: " + d3.format(".1f")(tempangle) + "°")
                .transition()
                .duration(150)
                .attr("fill-opacity",1)

            d3.select(this)
                .transition()
                .attr("stroke","black")
                .attr("stroke-opacity",1)

        })
        .on("mouseleave", function(d) {
            coordTooltip.selectAll(".tooltip-text")
                .transition()
                .attr("fill-opacity",0)
                .transition()
                .duration(0)
                .text("");

            d3.select(this)
                .attr("stroke","black")
                .attr("stroke-opacity",0)
        })
}
 */

let movablePieceSelected = false

function dragstarted(d) {
    // This saves which piece is currently selected so that we can update its position when it's dropped
    selectedPiece = d.sourceEvent.path[0].id

    if (movablePieces().includes(selectedPiece)){
        movablePieceSelected = true
        d3.selectAll("#" + selectedPiece)
            .raise()
            .attr("x",d.x - squareside/2)
            .attr("y",d.y - squareside/2)
    }
}

// Move pieces when dragged
function dragged(event) {
    if (movablePieceSelected){
        d3.select(this)
            .attr('x', event.x - squareside/2)
            .attr('y', event.y - squareside/2)
    }

}

function dragended(d) {
    if (movablePieceSelected){
        var xy = snapSquare(d.x,d.y)

        // First find the index of the selected piece in the 32-long list
        let isSelectedPiece = (element) => element === selectedPiece;
        var pieceIndex = pieceList.findIndex(isSelectedPiece)

        // Then find the new position that we want to move the piece to
        var newPosition = encodeSquare(xy[0], xy[1])

        // Check if we can actually move the piece there
        if (isValidMove(pieceIndex, newPosition)){
            var removedPiece = updatePosition(xy)
            d3.selectAll("#" + selectedPiece)
                .attr("x", xy[0])
                .attr("y", xy[1])

            if (removedPiece !== " ") {
                d3.selectAll("#" + removedPiece)
                    .remove()
            }
            gameState.blackToMove = !gameState.blackToMove
        }
        // Otherwise, replace the piece and try again
        else {
            let oldPosition = decodeSquare(pieceArray[pieceIndex])
            d3.selectAll("#" + selectedPiece)
                .attr("x", oldPosition[0])
                .attr("y", oldPosition[1])
        }

        movablePieceSelected = false
    }


    selectedPiece = " "
}

function updatePosition(xy_tuple) {
    var x = xy_tuple[0]
    var y = xy_tuple[1]
    var removedPiece = " "

    // First find the index of the piece in the 32-long list
    let isSelectedPiece = (element) => element === selectedPiece;
    var pieceIndex = pieceList.findIndex(isSelectedPiece)

    // Then find the new position that we want to move the piece to
    var newPosition = encodeSquare(x, y)

    // Then find its previous position in the piece array and update with the new position
    var previousPosition = pieceArray[pieceIndex]

    // If the new position is different from the previous positon...
    if (newPosition !== previousPosition) {
        // First update the board array
        // First update the new location with the old location, then clear the old location
        var previousPositionRow = 8 - previousPosition % 10
        var previousPositionColumn = Math.trunc(previousPosition/10) - 1

        var newPositionRow = 8 - newPosition % 10
        var newPositionColumn = Math.trunc(newPosition/10) - 1
        boardArray[newPositionRow][newPositionColumn] = boardArray[previousPositionRow][previousPositionColumn]

        boardArray[previousPositionRow][previousPositionColumn] = " "

        // Next, delete any existing pieces at that location in the piece array
        let isNewPosition = (element) => element === newPosition;
        let existing_index = pieceArray.findIndex(isNewPosition)
        if (existing_index !== -1){
            pieceArray[existing_index] = 99
            removedPiece = pieceList[existing_index]
        }

        // TODO
        /*
        En Passant Sprite Removal
        When a pawn is captured via en passant, the sprite of the captured pawn must be
        specially removed
         */
        if (gameState.blackToMove) {
            if (gameState.enPassant*10 + 3 == newPosition) {
                let isNewPosition = (element) => element == newPosition + 1;
                let existing_index = pieceArray.findIndex(isNewPosition)
                pieceArray[existing_index] = 99
                removedPiece = pieceList[existing_index]
                boardArray[4][gameState.enPassant - 1] = " "
            }
        }
        else {
            if (gameState.enPassant*10 + 6 == newPosition) {
                let isNewPosition = (element) => element == newPosition - 1;
                let existing_index = pieceArray.findIndex(isNewPosition)
                pieceArray[existing_index] = 99
                removedPiece = pieceList[existing_index]
                boardArray[3][gameState.enPassant - 1] = " "
            }
        }

        // TODO
        /*
        Reset/unreset the en passant gamestate depending on the new move
         */
        gameState.enPassant = 0
        // If we've selected a pawn
        if (shortPieceList[pieceIndex].toLowerCase() == "p") {
            console.log(newPosition)
            console.log(previousPosition)
            // If we've moved the piece two spaces forward
            if ( Math.abs(newPosition - previousPosition) == 2) {
                gameState.enPassant = newPositionColumn + 1
            }
        }


        // Pawn Promotion
        /*
        Pseudocode

        If the selected piece is a pawn AND the new position is on the back rank (8 mod 10):

            Then allow the user to promote to queen, rook, bishop, or knight
            Update the selected sprite on the board with the appropriate new sprite
            Update the board array with the correct new piece value

         */
        if (shortPieceList[pieceIndex].toLowerCase() == "p" && [0,7].includes(newPositionRow)
            && boardArray[newPositionRow][newPositionColumn].toLowerCase() == "p") {
            let piece = ""
            while (!["q","r","b","n"].includes(piece)) {
                piece = prompt("Please enter promotion piece (q, r, b, n):", "q")
            }

            let filename = ""

            if (!gameState.blackToMove) {
                filename = "pieces/w" + piece + ".png"
            }
            else {
                filename = "pieces/b" + piece + ".png"
            }

            players.selectAll("#" + selectedPiece)
                .attr('xlink:href',filename)

            if (pieceIndex >= 16) {
                boardArray[newPositionRow][newPositionColumn] = piece
            }
            else {
                boardArray[newPositionRow][newPositionColumn] = piece.toUpperCase()
            }


        }

        console.log("Gamestate: ", gameState)

        // Finally update the piece array
        pieceArray[pieceIndex] = newPosition
    }

    updateHTMLArrays()
    return removedPiece
}

// This writes the Javascript representations of the chessboard into HTML
function updateHTMLArrays() {
    console.log(pieceArray);
    console.log(boardArray);
}

// Checks if a move is legal or not
function isValidMove(pieceIndex, newPosition) {
    let moveChecker1 = new moveChecker(pieceArray,boardArray,pieceIndex,gameState)
    console.log("Calling eligible moves")
    console.log("Eligible Moves: ", moveChecker1.eligibleMoves())
    console.log("Calling legal moves")
    console.log("Legal Moves: ", moveChecker1.legalMoves())
    console.log("Calling eligible moves 2")
    console.log("Eligible Moves: ", moveChecker1.eligibleMoves())
    console.log("Calling pseudolegal moves")
    console.log("Pseudolegal Moves: ", moveChecker1.pseudoLegalMoves())

    console.log("final call ------------")
    return moveChecker1.legalMoves().includes(newPosition);


}

// Returns a list of all pieces that are eligible to move
function movablePieces() {
    let possiblePieces = []
    if (gameState.blackToMove) {
        possiblePieces = ["black_king", "black_queen", "black_king_rook", "black_queen_rook",
            "black_king_knight", "black_queen_knight", "black_king_bishop", "black_queen_bishop",
            "black_k_pawn", "black_q_pawn", "black_kr_pawn", "black_qr_pawn",
            "black_kn_pawn", "black_qn_pawn", "black_kb_pawn", "black_qb_pawn"]
    }
    else {
        possiblePieces = ["white_king", "white_queen", "white_king_rook", "white_queen_rook",
            "white_king_knight", "white_queen_knight", "white_king_bishop", "white_queen_bishop",
            "white_k_pawn", "white_q_pawn", "white_kr_pawn", "white_qr_pawn",
            "white_kn_pawn", "white_qn_pawn", "white_kb_pawn", "white_qb_pawn"]
    }
    return possiblePieces
}