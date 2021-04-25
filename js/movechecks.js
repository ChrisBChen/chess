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
        this.shortPieceList = [
            "K", "Q", "R", "R", "N", "N", "B", "B",
            "P", "P", "P", "P", "P", "P", "P", "P",
            "k", "q", "r", "r", "n", "n", "b", "b",
            "p", "p", "p", "p", "p", "p", "p", "p"
        ]
    }
    // Returns a list of pseudolegal moves for the chosen piece
    eligibleMoves(chosenPieceIndex=this.pieceIndex) {
        
        let currentPosition = this.pieceArray[chosenPieceIndex]

        // If the piece has already been taken, return nothing
        if (currentPosition == 99) {
            return
        }

        // If we've selected a rook:
        let rook_indices = [2, 3, 18, 19];
        if (rook_indices.includes(chosenPieceIndex)) {
            return rookEligibleMoves(this)
        }

        // If we've selected a bishop:
        let bishop_indices = [6, 7, 22, 23];
        if (bishop_indices.includes(chosenPieceIndex)) {
            return rookEligibleMoves(this, true)
        }

        // If we've selected a queen:
        let queen_indices = [1, 17]
        if (queen_indices.includes(chosenPieceIndex)) {
            return rookEligibleMoves(this,true).concat(rookEligibleMoves(this))
        }

        // If we've selected a knight:
        let knight_indices = [4, 5, 20, 21];
        if (knight_indices.includes(chosenPieceIndex)) {
            let knightIncrementList = [21, 12, 19, 8, -12, -21, -19, -8]
            return knightEligibleMoves(knightIncrementList, this)
        }

        let king_indices = [0, 16]
        if (king_indices.includes(chosenPieceIndex)) {
            let kingIncrementList = [9, 10, 11, -1, 1, -10, -9, -11]
            return knightEligibleMoves(kingIncrementList, this)
        }

        return pawnEligibleMoves(this)

        // Returns a list of pseudolegal moves for a rook or bishop
        function rookEligibleMoves(boardState, bishop=false) {
            //initialize possible moves array
            let possibleMoves = [];

            // Check moves in each direction (up down left right)
            function checkSide(currentPosition, increment, boardState) {

                let moveList = []

                if (typeof(boardState) === "undefined"){
                    let tester = 0
                }

                // First check if the square is valid
                if (isInvalidSquare(currentPosition + increment)) {
                    return
                }
                // If there is another piece up/down/left/right of the current piece...
                else if (boardState.pieceArray.includes(currentPosition + increment)) {
                    // Find the index of this piece
                    let occupyingPiece = (element) => element == (currentPosition + increment);
                    let occupyingPieceIndex = boardState.pieceArray.findIndex(occupyingPiece)

                    // Check if the piece is adjacent to the rook or not
                    // If black to move,
                    if (boardState.gameState.blackToMove) {
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
                    possibleMoves.push(currentPosition + increment, checkSide(currentPosition + increment, increment, boardState))
                    return
                }
            }
            if (bishop==false){
                possibleMoves.push(checkSide(currentPosition, 1, boardState), checkSide(currentPosition,-1, boardState),
                    checkSide(currentPosition,10, boardState), checkSide(currentPosition,-10, boardState))
            }
            else {
                possibleMoves.push(checkSide(currentPosition, 11, boardState), checkSide(currentPosition,-11, boardState),
                    checkSide(currentPosition,9, boardState), checkSide(currentPosition,-9, boardState))
            }
            possibleMoves = possibleMoves.filter(Boolean)

            return possibleMoves
        }

        // Returns a list of pseudolegal moves for a knight or king
        function knightEligibleMoves(incrementList, boardState) {
            //initialize possible moves array
            let possibleMoves = [];

            // Check all 8 possible knight moves
            function checkSide(currentPosition, increment, boardState) {
                let moveList = []
                // First check if the square is valid
                if (isInvalidSquare(currentPosition + increment)) {
                    return
                }
                // If there is another piece present...
                else if (boardState.pieceArray.includes(currentPosition + increment)) {
                    // Find the index of this piece
                    let occupyingPiece = (element) => element == (currentPosition + increment);
                    let occupyingPieceIndex = boardState.pieceArray.findIndex(occupyingPiece)

                    // If black to move,
                    if (boardState.gameState.blackToMove) {
                        // If the occupying piece is black
                        if (occupyingPieceIndex >= 16) {
                            // Then no more moves
                            return
                        }
                        // Otherwise, the occupying piece is white
                        else {
                            // the move is valid
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
                    possibleMoves.push(currentPosition + increment)
                    return
                }
            }


            for (let i in incrementList) {
                possibleMoves.push(checkSide(currentPosition, incrementList[i], boardState))
            }

            possibleMoves = possibleMoves.filter(Boolean)

            return possibleMoves
        }

        // Returns a list of pseudolegal moves for a specific pawn
        /*
        Pawn movement is a nightmare, honestly. There are a number of special things
        to consider.
        0. Directionality (black pawns move south, white pawns move north)
        1. Pawn initial two-step
        2. Diagonal capture
        3. En-passant
        4. Pawn promotion and promoted pawns
         */
        /*
        Pseudocode

        let pawnval = boardArray at the current position

        If pawnval is not "p" (meaning the pawn has been promoted)
            if pawnval == "q"
                return eligible moves for a queen at this position
            elif pawnval == "n"
                return eligible moves for a knight at this positon
            elif pawnval == "r"
                similar to above
            elif pawnval == "b"
                similar to above

        If pawn is dark:
            // moving directly forward
            If the pawn is on the 7th rank (starting rank)
                If there is no piece at -10
                    Add -10 to the list
                    If there is no piece at -20
                        Add -20 to the list
            Else
                If there is no piece at -10
                    Add -10 to the list
            // diagonal capture
            If there is a piece at -11
                Add -11 to the list
            If there is a piece at -9
                Add -9 to the list

            // En passant
            If gameState.enPassant !== 0 && pawn's rank == 4:
                If the gameState.enPassant column is on the left of the pawn:
                    Add -11 to the list
                If the gameState.enPassant column is on the right of the pawn:
                    Add -9 to the list

        Else (pawn not dark):
            // moving directly forward
            If the pawn is on the 2nd rank (starting rank)
                If there is no piece at 10
                    Add 10 to the list
                    If there is no piece at 20
                        Add 20 to the list
            Else
                If there is no piece at 10
                    Add 10 to the list
            // diagonal capture
            If there is a piece at 11
                Add 11 to the list
            If there is a piece at 9
                Add 9 to the list

            // En passant
            If gameState.enPassant !== 0 && pawn's rank == 5:
                If the gameState.enPassant column is on the left of the pawn:
                    Add 9 to the list
                If the gameState.enPassant column is on the right of the pawn:
                    Add 11 to the list

         */
        function pawnEligibleMoves(boardState) {
            let currentPositionColumn = Math.trunc(currentPosition / 10)
            let currentPositionRow = currentPosition % 10
            let pawnMoveList = []

            let pawnval = boardState.boardArray[currentPositionRow - 1][currentPositionColumn - 1]

            if (pawnval.toLowerCase() !== "p") {
                if (pawnval === "q") {
                    return rookEligibleMoves(this, true).concat(rookEligibleMoves(this))
                }
                else if (pawnval === "n") {
                    let knightIncrementList = [21, 12, 19, 8, -12, -21, -19, -8]
                    return knightEligibleMoves(knightIncrementList, this)
                }
                else if (pawnval === "r") {
                    return rookEligibleMoves(this)
                }
                else if (pawnval === "b") {
                    return rookEligibleMoves(this, true)
                }
            }


            if (boardState.gameState.blackToMove) {

                if (currentPositionRow === 7) {
                    if (boardState.boardArray[8 - currentPositionRow + 1][currentPositionColumn - 1] === " ") {
                        pawnMoveList.push(-1)
                        if (boardState.boardArray[8 - currentPositionRow + 2][currentPositionColumn - 1] === " ") {
                            pawnMoveList.push(-2)
                        }
                    }
                }
                else {
                    if (boardState.boardArray[8 - currentPositionRow + 1][currentPositionColumn - 1] === " ") {
                        pawnMoveList.push(-1)
                    }
                }

                if (!isInvalidSquare(currentPosition - 11)) {
                    if (boardState.boardArray[8 - currentPositionRow + 1][currentPositionColumn - 2] !== " ") {
                        pawnMoveList.push(-11)
                    }
                }

                if (!isInvalidSquare(currentPosition + 9)) {
                    if (boardState.boardArray[8 - currentPositionRow + 1][currentPositionColumn] !== " ") {
                        pawnMoveList.push(9)
                    }
                }

                if (boardState.gameState.enPassant !== 0 && currentPositionRow === 4) {
                    if (!isInvalidSquare(currentPosition - 11)) {
                        if (boardState.gameState.enPassant === currentPositionColumn - 1) {
                            pawnMoveList.push(-11)
                        }
                    }

                    else if (!isInvalidSquare(currentPosition + 9)) {
                        if (boardState.gameState.enPassant === currentPositionColumn + 1) {
                            pawnMoveList.push(9)
                        }
                    }

                }

            }

            else {

                if (currentPositionRow === 2) {

                    if (boardState.boardArray[8 - currentPositionRow - 1][currentPositionColumn - 1] === " ") {
                        pawnMoveList.push(1)
                        if (boardState.boardArray[8 - currentPositionRow - 2][currentPositionColumn - 1] === " ") {
                            pawnMoveList.push(2)
                        }
                    }
                }
                else {
                    if (boardState.boardArray[8 - currentPositionRow - 1][currentPositionColumn - 1] === " ") {
                        pawnMoveList.push(1)
                    }
                }

                if (!isInvalidSquare(currentPosition - 9)) {
                    if (boardState.boardArray[8 - currentPositionRow - 1][currentPositionColumn - 2] !== " ") {
                        pawnMoveList.push(-9)
                    }
                }

                if (!isInvalidSquare(currentPosition + 11)) {
                    if (boardState.boardArray[8 - currentPositionRow - 1][currentPositionColumn] !== " ") {
                        pawnMoveList.push(11)
                    }
                }

                if (boardState.gameState.enPassant !== 0 && currentPositionRow === 5) {
                    if (!isInvalidSquare(currentPosition - 9)) {
                        if (boardState.gameState.enPassant === currentPositionColumn - 1) {
                            pawnMoveList.push(-9)
                        }
                    }

                    else if (!isInvalidSquare(currentPosition + 11)) {
                        if (boardState.gameState.enPassant === currentPositionColumn + 1) {
                            pawnMoveList.push(11)
                        }
                    }
                }

            }

            return pawnMoveList.map(function(x) {return x + currentPosition})

        }

        // Check if a given square is actually on the board or not
        function isInvalidSquare(coordinate) {
            let row = coordinate % 10
            let column = Math.trunc(coordinate / 10)

            return !(row >= 1 && row <= 8 && column >= 1 && column <= 8)
        }

    }

    // Returns a list of pseudolegal moves for all pieces on the board
    // When flat is false, the list is a list of lists for each individual piece 
    // (e.g. king moves: [...], queen moves: [...], etc.)
    // When flat is true, the list is a list of all possible moves
    // (e.g. 11, 12, 15, 25, ...)
    pseudoLegalMoves(flat=false) {
        let pseudolegalMoveList = []
        if (this.gameState.blackToMove) {
            for (let i = 16; i < 32; i++) {
                if (flat) {
                    pseudolegalMoveList = pseudolegalMoveList.concat(this.eligibleMoves(i))
                }
                else {
                    pseudolegalMoveList.push(this.eligibleMoves(i))
                }
            }
        }
        else {
            for (let i = 0; i < 16; i++) {
                if (flat) {
                    pseudolegalMoveList = pseudolegalMoveList.concat(this.eligibleMoves(i))
                }
                else {
                    pseudolegalMoveList.push(this.eligibleMoves(i))
                }
            }
        }

        return pseudolegalMoveList

    }
    
    // Checks if a given pseudo-legal move is actually legal or not
    pseudoLegalIsLegal(pieceIndex, newPosition) {
        let previousPosition = this.pieceArray[pieceIndex]
        // Deep copy boardArray and pieceArray
        let deepCopy = (array) => {
            let copy = [];
            array.forEach(coord => {
                if(Array.isArray(coord)){
                    copy.push(deepCopy(coord))
                }else{
                    copy.push(coord)
                }
            })
            return copy;
        }
        let newPieceArray = deepCopy(this.pieceArray)
        let newBoardArray = deepCopy(this.boardArray)

        let previousPositionRow = 8 - previousPosition % 10
        let previousPositionColumn = Math.trunc(previousPosition/10) - 1

        let newPositionRow = 8 - newPosition % 10
        let newPositionColumn = Math.trunc(newPosition/10) - 1
        newBoardArray[newPositionRow][newPositionColumn] = newBoardArray[previousPositionRow][previousPositionColumn]

        newBoardArray[previousPositionRow][previousPositionColumn] = " "

        // Next, delete any existing pieces at that location in the piece array
        let isNewPosition = (element) => element === newPosition;
        let existing_index = newPieceArray.findIndex(isNewPosition)
        if (existing_index !== -1){
            newPieceArray[existing_index] = 99
        }
        
        let kingLocation;

        if (this.gameState.blackToMove) {
            //snag location of the king:
            kingLocation = newPieceArray[16];
            
            if (this.gameState.enPassant*10 + 3 == newPosition) {
                let isNewPosition = (element) => element == newPosition + 1;
                let existing_index = newPieceArray.findIndex(isNewPosition)
                newPieceArray[existing_index] = 99
                newBoardArray[4][this.gameState.enPassant - 1] = " "
            }
        }
        else {
            kingLocation = newPieceArray[0]
            
            if (this.gameState.enPassant*10 + 6 === newPosition) {
                let isNewPosition = (element) => element === newPosition - 1;
                let existing_index = newPieceArray.findIndex(isNewPosition)
                newPieceArray[existing_index] = 99
                newBoardArray[3][this.gameState.enPassant - 1] = " "
            }
        }

        newPieceArray[pieceIndex] = newPosition

        let newGameState = {
            blackToMove: this.gameState.blackToMove,
            castlingPossible: this.gameState.castlingPossible,
            enPassant: this.gameState.enPassant,
            kingInCheck: this.gameState.kingInCheck
        }

        newGameState.enPassant = 0
        // If we've selected a pawn
        if (this.shortPieceList[pieceIndex].toLowerCase() === "p") {
            // If we've moved the piece two spaces forward
            if ( Math.abs(newPosition - previousPosition) === 2) {
                newGameState.enPassant = newPositionColumn + 1
            }
        }

        newGameState.blackToMove = !newGameState.blackToMove
        console.log("NEW gamestate", newGameState)
        
        let newMoveChecker = new moveChecker(newPieceArray,newBoardArray,pieceIndex,newGameState)

        // In essence, we make the move and update the piece and board array; then, we see if the new set of pseudolegal
        // moves contains the location of our king, which would mean that the prior move left the king in check and
        // would be illegal.
        return !newMoveChecker.pseudoLegalMoves(true).includes(kingLocation)
        
    }

    legalMoves(chosenPieceIndex=this.pieceIndex) {
        let pseudoMoveList = this.eligibleMoves(chosenPieceIndex)

        return pseudoMoveList.filter(move => this.pseudoLegalIsLegal(chosenPieceIndex, move))

    }

}
