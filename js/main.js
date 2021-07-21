'use strict';
var gSmiley = {
    lose: '😢',
    win: '😎',
    normal: '😊'

}
var gTimer;
const FLAG = '📢';
const BOMB = '💣';
const LIFE = '❤️'

var gStartInterval;
var fEndInterval;
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,

};
var gLevel = {
    size: 4,
    mines: 2,
    life: 1,
    level: 'easy',
    bestTime: 0
};
var gBoard;
var gIsFirst = true;
var sizeFlag;

function initGame() {
    gBoard = buildBoard();
    renderMat(gBoard, '.board');
    renderSmiley(gSmiley.normal);
    renderLife();
    sizeFlag = gLevel.mines
    var mat = [
        [1, 2, 3],
        [, 4, 5, 6]
    ]
}

function radioClick(size, mines, life) {
    gLevel.size = size;
    gLevel.mines = mines;
    gLevel.life = life;
    restartGame();
}

function activateTimer() {
    var currTime = Date.now()
    var diff = new Date(currTime - gTimer)
    var min = diff.getMinutes();
    var sec = diff.getSeconds();
    var elDiv = document.querySelector('.timer');
    min = min < 10 ? `0${min}` : min
    sec = sec < 10 ? `0${sec}` : sec
    gGame.secsPassed = min + ':' + sec;
    var strHTML = min + ':' + sec;
    elDiv.innerHTML = strHTML;
}

function restartGame() {
    clearInterval(gStartInterval)
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
    };
    gBoard = [];
    gIsFirst = true
    initGame();
}

function buildBoard() {
    var board = [];

    for (var i = 0; i < gLevel.size; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.size; j++) {

            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
            board[i][j].minesAroundCount = 0;

        }
    }
    return board;
}

function getRandomPositionForBomb(mineSize, cellI, cellJ) {
    var mines = [];
    for (var i = 0; i < mineSize; i++) {
        var idxI = getRandomInteger(0, gLevel.size);
        var idxJ = getRandomInteger(0, gLevel.size);
        for (var j = 0; j < mines; j++) {
            if (i == j) continue;
            if (mines.length > 0 && mines[j].i === idxI && mines[j].j === idxJ) i--;
        }
        if (idxI === cellI && idxJ === cellJ) i--;
        else {
            mines.push({
                i: idxI,
                j: idxJ
            });
        }


    }
    console.log(mines);
    return mines;
}

function setBombOnBoard(i, j, mines) {
    for (var idx = 0; idx < mines.length; idx++) {
        gBoard[mines[idx].i][mines[idx].j].isMine = true;
    }
}


function setMinesNegsCount(cellI, cellJ, mines) {
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            gBoard[i][j].minesAroundCount = blowUpNegs(i, j, mines);
        }
    }
}

function markCell(elCell, i, j) {
    document.addEventListener('contextmenu', event => event.preventDefault());
    if (gGame.isOn) {
        if (sizeFlag && !gBoard[i][j].isMarked && !elCell.innerText) {

            elCell.classList.add(`mark`);
            elCell.innerText = FLAG;
            sizeFlag--;
            gBoard[i][j].isMarked = true;
        } else if (gBoard[i][j].isMarked && sizeFlag < gLevel.mines) {
            gBoard[i][j].isMarked = false;
            elCell.classList.remove(`mark`);
            elCell.innerText = '';
            sizeFlag++;
        }
    }
    checkVictory()
}

function cellClicked(elCell, idxI, idxJ) {
    localStorage.setItem(gLevel.level, gGame.secsPassed);
    if (gGame.isOn || gIsFirst) {
        if (!gBoard[idxI][idxJ].isShown && !gBoard[idxI][idxJ].isMarked) {
            if (gIsFirst) {
                gGame.isOn = true;
                gTimer = Date.now();
                gStartInterval = setInterval(activateTimer, 500)
                var mines = getRandomPositionForBomb(gLevel.mines, idxI, idxJ);
                setBombOnBoard(idxI, idxJ, mines);
                setMinesNegsCount(idxI, idxJ, mines);
                gIsFirst = false;
            }
            if (!gBoard[idxI][idxJ].minesAroundCount && !gBoard[idxI][idxJ].isMine) showNegs(idxI, idxJ, gBoard)
            else if (gBoard[idxI][idxJ].minesAroundCount && !gBoard[idxI][idxJ].isMine) {
                renderCell({
                    i: idxI,
                    j: idxJ
                }, gBoard[idxI][idxJ].minesAroundCount);
                gBoard[idxI][idxJ].isShown = true;
            } else if (gBoard[idxI][idxJ].isMine) {
                renderCell({
                    i: idxI,
                    j: idxJ
                }, BOMB);
                gBoard[idxI][idxJ].isShown = true;
                gLevel.life--;
                if (!gLevel.life) gGame.isOn = false;
                renderLife();
                renderSmiley(gSmiley.lose);
                clearInterval(gStartInterval);
            }
            checkVictory()
        }
    }
}

function isAllShown() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if ((gBoard[i][j].isMarked !== true && gBoard[i][j].isShown !== true) || (gBoard[i][j].isMine === true && gBoard[i][j].isMarked === false)) {
                return false
            }
        }
    }
    return true
}

function newCountMine(cellI, cellJ, mines) {
    var count = gBoard[cellI][cellI];
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gLevel.size) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gLevel.size) continue
            if (i === cellI && j === cellJ) continue
            for (var idx = 0; idx < mines.length; idx++) {
                if (i === mines[idx].i && j === mines[idx].j) {
                    count++;
                }
            }
        }
    }
    return count;
}




function checkVictory() {
    if (isAllShown()) {
        renderSmiley(gSmiley.win);
        gGame.isOn = false;
        var thisTime = localStorage.getItem(gLevel.level);
        console.log(thisTime);
        if (!gLevel.bestTime) {
            gLevel.bestTime = thisTime;
        } else if (thisTime < gLevel.bestTime) {
            gLevel.bestTime = thisTime;
        }
    }
    checkLoss();
    // if (checkAllCellIsSown()) {

    // }
}

function checkLoss() {
    if (!gLevel.life) {
        showHiddenBombs();
        clearInterval(gStartInterval)
        gGame.isOn = false;
    }
}

function showHiddenBombs() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                renderCell({
                    i,
                    j
                }, BOMB);
            }
        }
    }

}

function checkAllCellIsSown() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                return false;
            }
        }
    }
    return true;
}

function renderLife() {
    var elDiv = document.querySelector('.life');
    elDiv.innerText = ` ${LIFE.repeat(gLevel.life)}`
}

function renderSmiley(smiley) {
    var elh1 = document.querySelector('.smiley');
    elh1.innerText = smiley
}