/*
Movechecks.js

This file includes helper functions to determine if a certain move is possible for a certain piece.
The tests here check for bishop, knight, rook, pawn, and king movement, and return a boolean if the move is possible
 */
class moveChecker {
    constructor(pieceArray, boardArray, pieceIndex, gameState){
        this.pieceArray = pieceArray
        this.boardArray = boardArray
        this.pieceIndex = pieceIndex
        this.gameState = gameState
    }
    // Returns a list of pseudolegal moves for the chosen piece
    eligibleMoves() {
        let currentPosition = pieceArray[this.pieceIndex]

        // If we've selected a rook:
        let rook_indices = [2, 3, 18, 19];
        if (rook_indices.includes(this.pieceIndex)) {
            return rookEligibleMoves()
        }

        // If we've selected a bishop:
        let bishop_indices = [6, 7, 22, 23];
        if (bishop_indices.includes(this.pieceIndex)) {
            return rookEligibleMoves(true)
        }

        // If we've selected a queen:
        let queen_indices = [1, 17]
        if (queen_indices.includes(this.pieceIndex)) {
            return rookEligibleMoves(true).concat(rookEligibleMoves())
        }

        // Returns a list of pseudolegal moves for a rook or bishop
        function rookEligibleMoves(bishop=false) {
            //initialize possible moves array
            let possibleMoves = [];

            // Check moves in each direction (up down left right)
            function checkSide(currentPosition, increment) {
                let moveList = []
                // First check if the square is valid
                if (isInvalidSquare(currentPosition + increment)) {
                    return
                }
                // If there is another piece up/down/left/right of the current piece...
                else if (pieceArray.includes(currentPosition + increment)) {
                    // Find the index of this piece
                    let occupyingPiece = (element) => element == (currentPosition + increment);
                    let occupyingPieceIndex = pieceArray.findIndex(occupyingPiece)

                    // Check if the piece is adjacent to the rook or not
                    // If black to move,
                    if (gameState[0]) {
                        // If the occupying piece is black
                        if (occupyingPieceIndex >= 16) {
                            // Then no more moves
                            return
                        }
                        // Otherwise, the occupying piece is white
                        else {
                            // capture the piece but no more moves
                            return currentPosition + increment
                        }
                    }
                    // If white to move,
                    else {
                        // If the occupying piece is black
                        if (occupyingPieceIndex >= 16) {
                            // capture the piece but no more moves
                            return currentPosition + increment
                        }
                        // Otherwise, the occupying piece is white
                        else {
                            // Then no more moves
                            return
                        }
                    }
                }
                // Otherwise, there is no piece to that direction, so add to the list and recurse
                else {
                    possibleMoves.push(currentPosition + increment, checkSide(currentPosition + increment, increment))
                    return
                }
            }
            if (bishop==false){
                possibleMoves.push(checkSide(currentPosition, 1), checkSide(currentPosition,-1),
                    checkSide(currentPosition,10), checkSide(currentPosition,-10))
            }
            else {
                possibleMoves.push(checkSide(currentPosition, 11), checkSide(currentPosition,-11),
                    checkSide(currentPosition,9), checkSide(currentPosition,-9))
            }
            possibleMoves = possibleMoves.filter(Boolean)

            return possibleMoves
        }

        // Check if a given square is actually on the board or not
        function isInvalidSquare(coordinate) {
            let row = coordinate % 10
            let column = Math.trunc(coordinate / 10)

            return !(row >= 1 && row <= 8 && column >= 1 && column <= 8)
        }

    }


}
