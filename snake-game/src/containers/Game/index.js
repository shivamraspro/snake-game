import React, { Component } from 'react'
import styles from './index.module.css'
import { connect } from 'react-redux'
import Board from '../../components/Board'
import GameInfo from '../../components/GameInfo'
import Spinner from '../../components/Spinner'
import { getGridDimensions, getGrid, getFoodCell, getInitialSnake } from '../../game/gameSetup'
import * as constants from '../../utils/constants'
import * as actions from '../../store/actions'

class Game extends Component {

  state = {
    loadGame: true,
    loadGameText: 'PRESS SPACEBAR TO START GAME'
  }

  componentDidMount() {
    this.gamediv.focus()

    const { mRows, nCols } = getGridDimensions()
    const grid = getGrid()
    const foodCell = getFoodCell()
    const snake = getInitialSnake()

    this.props.onSetGameReady(this.props.user.uid, {
      mRows, nCols, grid, foodCell, snake
    })

    window.addEventListener('keydown', this.keyDownHandler)
  }

  componentWillMount() {
    window.removeEventListener('keydown', this.keyDownHandler)
  }

  changeGameStateHandler = (event) => {

    switch (event.target.dataset.state) {
      case constants.GAME_PLAYING: this.props.onGamePlaying() 
        break;
      case constants.GAME_PAUSED: this.props.onGamePaused() 
        break;
      case constants.GAME_OVER: this.props.onGameOver() 
        break;
      default:
        return
    }
  }

  loadGameHandlder = () => {
    this.setState({
      loadGame: false
    })

    this.props.onGamePlaying()
  }

  keyDownHandler = (event) => {

    if (this.state.loadGame) {
      this.loadGameHandlder()
      return;
    }

    event.preventDefault()
    
    // Arrow keys should work only when the game is in playing mode
    if (event.which !== 32 && this.props.gameState !== constants.GAME_PLAYING) {
      return;
    }

    switch (event.which) {
      case 32: // Spacebar is pressed
        if (this.props.gameState === constants.GAME_PAUSED
           || this.props.gameState === constants.GAME_READY) {
          this.props.onGamePlaying()
        } else if (this.props.gameState === constants.GAME_PLAYING) {
          this.props.onGamePaused()
        }
        break;
      case 37: // Left Arrow key is pressed
        if (this.props.direction === constants.UP
          || this.props.direction === constants.DOWN) {
          this.props.onChangeSnakeDirection(constants.LEFT)
        }
        break;
      case 38: // Up Arrow key is pressed
        if (this.props.direction === constants.LEFT
          || this.props.direction === constants.RIGHT) {
          this.props.onChangeSnakeDirection(constants.UP)
        }
        break;
      case 39: // Right Arrow key is pressed
        if (this.props.direction === constants.UP
          || this.props.direction === constants.DOWN) {
          this.props.onChangeSnakeDirection(constants.RIGHT)
        }
        break;
      case 40: // Down Arrow key is pressed
        if (this.props.direction === constants.LEFT
          || this.props.direction === constants.RIGHT) {
          this.props.onChangeSnakeDirection(constants.DOWN)
        }
        break;
      default: return
    }
  }

  render() {
    let game = null
    if (this.props.gameState !== constants.GAME_NULL && this.props.grid) {
      game = (
        <div>
          <div className={styles.BoardContainer}>
            <Board 
              grid={this.props.grid}
              foodCell={this.props.foodCell}
              snake={this.props.snake} />
            {this.state.loadGame ? 
              (
                <div className={styles.GameLoader}>
                  <span>{this.state.loadGameText}</span>
                </div>
              ) : null}
          </div>
          <GameInfo
            user={this.props.user}
            score={this.props.score}
            highScore={this.props.highScore}
            onLogout={this.props.onLogout} />
        </div>
      )
    } else {
      game = (
        <Spinner />
      )
    }

    return (
      <div 
        className={styles.Game}
        ref={(gamediv => this.gamediv = gamediv)}>
        {game}
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    gameState: state.game.gameState,
    mRows: state.game.mRows,
    nCols: state.game.nCols,
    grid: state.game.grid,
    foodCell: state.game.foodCell,
    snake: state.game.snake,
    direction: state.game.direction,
    score: state.game.score,
    highScore: state.game.highScore,
    user: state.auth.user
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onSetGameReady: (userUid, payload) => dispatch(actions.setGameReady(userUid, payload)),
    onGamePlaying: (payload) => dispatch(actions.gamePlaying(payload)),
    onGamePaused: (payload) => dispatch(actions.gamePaused(payload)),
    onChangeSnakeDirection: (direction) => dispatch(actions.changeSnakeDirection(direction)),
    onLogout: () => dispatch(actions.logout())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Game)