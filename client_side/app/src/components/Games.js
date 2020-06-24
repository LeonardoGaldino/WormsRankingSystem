import React from 'react';
import Game from './Game.js'
import MenuItem from '@material-ui/core/MenuItem';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';

import {API_ENDPOINT , API_PORT , API_URL} from '../env.js'

class Games extends React.Component {

    requestPath = '/worms/api/games';
    timeoutId = null;
    state = {
      games: [],
      currentPage: 0,
      numPages: 0,
      pageSize: 5,
      resultsBackground: '#f5f5f5', 
    };
  
    componentDidMount() {
      this.fetchData(false);
    }
  
    async fetchData(resetBackground) {
      if(this.state.currentPage === 0) {
        this.timeoutId = setTimeout(() => { this.fetchData(false)}, 5000);
      } else {
        if(this.timeoutId !== null) {
          clearTimeout(this.timeoutId);
          this.timeoutId = null;
        }
      }
      if(resetBackground) {
        this.setState((state, props) => ({
          ...state,
          resultsBackground: '#f5f5f5'
        }));
      }
  
      let res = await fetch(`${API_ENDPOINT+this.requestPath}?page=${this.state.currentPage}&page_size=${this.state.pageSize}`, {
        method: 'GET',
      });
      let data = await res.json();
      this.setState((state, props) => ({
        ...state,
        games: data.games,
        numPages: data.num_pages,
        resultsBackground: 'white'
      }));
    }
  
    render() {
      return <Paper style={{marginTop: 30, paddingBottom: 20, backgroundColor: '#f5f5f5'}} elevation={3}>
        <h1 style={{paddingTop: 15, display: 'block'}}>Games</h1>
        <div>
          <InputLabel id="demo-simple-select-label">Games per page</InputLabel>
          <Select
            style={{width: 45}}
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={this.state.pageSize}
            onChange={(event) => {
                event.persist()
                this.setState({
                  ...this.state,
                  pageSize: parseInt(event.target.value),
                  currentPage: 0,
                }, () => this.fetchData(true));
              }
            }
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </Select>
        </div>
  
        <div>
          <IconButton
              onClick={() => {
                this.setState((state, props) => ({
                  ...state,
                  currentPage: Math.max(0, state.currentPage - 1)
                }), () => this.fetchData(true))
              }}
              aria-label="previous page"
            >
              <KeyboardArrowLeft />
          </IconButton>
  
          <span style={{color: "rgba(0,0,0,0.54)", fontWeight: 400, fontSize: 16}}>
            {`${this.state.currentPage+1}/${this.state.numPages}`}
          </span>
  
          <IconButton
            onClick={() => {
              this.setState((state, props) => ({
                ...state,
                currentPage: Math.min(state.currentPage + 1, state.numPages - 1)
              }), () => this.fetchData(true))
            }}
            aria-label="next page"
          >
            <KeyboardArrowRight />
          </IconButton>
        </div>
  
        <div>
          {
            Object.keys(this.state.games).map(gameTs => {
            return <div style={{width: '95%', margin: 'auto'}} key={gameTs+'div'}>
                <Game key={gameTs} background={this.state.resultsBackground} 
                gameTs={gameTs} playerEntries={this.state.games[gameTs]}>
                </Game>
            </div>
          })}
        </div>
      </Paper>
    }
}

export default Games