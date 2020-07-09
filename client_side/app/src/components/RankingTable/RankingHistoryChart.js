import React from 'react'
import Chart from 'chart.js'
import CachedSharpIcon from '@material-ui/icons/CachedSharp';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';


import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import Divider from '@material-ui/core/Divider';

import {API_ENDPOINT} from '../../env.js';
import Game from '../Games/Game.js'

class RankingHistoryChart extends React.Component {

    state = {
        rankingData: null,
        renderedChart: false,
        selectedGame: null,
        gameData: null,
    }
    rankingHistoryRequestPath = '/worms/api/player/ranking_history';
    gameRequestPath = '/worms/api/game';

    renderGame(gameData) {
        this.setState((state, _) => ({
            ...state,
            gameData: null,
            selectedGame: gameData,
        }), this.fetchGameData);
    }

    changeGame(forward) {
        let currentIndex = this.state.selectedGame.index;

        let newIndex;
        if(forward) {
            newIndex = Math.min(currentIndex+1, this.state.rankingData.processed.length-1);
        } else {
            // index 0 is not a game (ranking start with 1500 with no games played)
            newIndex = Math.max(1, currentIndex-1);
        }

        if(newIndex !== this.state.selectedGame.index) {
            this.renderGame({
                id: this.state.rankingData.processed[newIndex].gameId,
                index: newIndex,
            });
        }
    }

    async fetchGameData() {
        if(this.state.selectedGame !== null) {
            let url = new URL(API_ENDPOINT + this.gameRequestPath);
            url.searchParams.append('game_id', this.state.selectedGame.id);

            let res = await fetch(url);
            let resJSON = await res.json();

            this.setState((state, _) => ({
                ...state,
                gameData: resJSON,
            }));
        } else {
            this.setState((state, _) => ({
                ...state,
                gameData: null,
            }));
        }
    }

    async fetchRankingData(playerName){
      let url = new URL(API_ENDPOINT + this.rankingHistoryRequestPath);
      url.searchParams.append('player_name', playerName);

      let res = await fetch(url);
      let resJSON = await res.json();

      this.setState((state, _) => ({
          ...state,
          rankingData: {
            raw: resJSON,
          }
      }));
    }

    // After ranking data is available
    componentDidUpdate() {
        if(this.state.renderedChart) {
            return;
        }

        let data = this.state.rankingData.raw;

        let ctx = document.getElementById('ranking-history-chart');
        ctx.style.backgroundColor = 'rgba(30,30,30,1)';

        let currentRanking = data.current_ranking;
        let lowestRanking = currentRanking;
        let highestRanking = currentRanking;

        let rankings = new Array(data.history.length + 1);
        rankings[data.history.length] = {
            gameId: data.history[data.history.length - 1].game_id,
            x: new Date(data.history[data.history.length - 1].game_ts * 1000),
            y: currentRanking,
        }

        for(let idx = data.history.length - 1 ; idx >= 0 ; --idx) {
            let gameId = null;
            // Project start date
            let gameDate = Date.parse('01 Jun 2020 00:00:00 GMT-03:00');
            if(idx > 0) {
                gameId = data.history[idx-1].game_id;
                let gameTs = data.history[idx-1].game_ts;
                gameDate = new Date(gameTs*1000);
            }

            currentRanking -= data.history[idx].delta_ranking;

            highestRanking = Math.max(highestRanking, currentRanking);
            lowestRanking = Math.min(lowestRanking, currentRanking);

            rankings[idx] = {
                gameId: gameId,
                x: gameDate,
                y: currentRanking,
            }
        }

        let getBorderColor = (ranking) => {
            if(ranking.y === highestRanking) {
                return 'rgba(0,0,255,1)';
            } else if(ranking.y === lowestRanking) {
                return 'rgba(255,0,0,1)'
            } else {
                return 'rgba(236,245,66,1)';
            }
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    fill: false,
                    label: 'Ranking',
                    data: rankings,
                    backgroundColor: 'rgba(220,220,220,1)',
                    borderColor: 'rgba(236,245,66,1)',
                    pointBorderColor: rankings.map(getBorderColor),
                    borderWidth: .8,
                }]
            },
            options: {
                responsive: true,
                scales: {
                    xAxes: [{
                        type: 'time',
                        distribution: 'series',
                        time: {
                            unit: 'year',
                            displayFormats: {
                                year: 'D/M/YY',
                            }
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: false
                        }
                    }],
                },
                onClick: (_, elems) => {
                    if(elems.length > 0) {
                        let index = elems[0]._index;
                        if(index > 0) {
                            this.renderGame({index: index, id: rankings[index].gameId});
                        }
                    }
                }
            }
        });
        this.setState((state, _) => ({
            ...state,
            rankingData: {
                ...state.rankingData,
                processed: rankings,
            },
            renderedChart: true,
        }));
    }

    componentDidMount(){
        this.fetchRankingData(this.props.player);
    }

    render(){
        if(this.state.rankingData !== null) {
            return <div>
                <canvas id="ranking-history-chart"></canvas>
                <Dialog
                    PaperProps={{style: {backgroundColor: '#f5f5f5'}}}
                    maxWidth='md'
                    fullWidth={true}
                    open={this.state.selectedGame !== null}
                    onClose={() => this.renderGame(null)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">
                        <DialogTitle id="alert-dialog-title">Game {(this.state.selectedGame !== null ? this.state.selectedGame.id : null)}</DialogTitle>
        
                        <Divider />

                        <DialogContent style={{marginBottom: 20}}>
                            {this.state.gameData !== null && 
                            <Game gameTs={this.state.gameData.game_ts} playerEntries={this.state.gameData.players_data}>
                            </Game>}
                            {this.state.gameData === null && 
                            <div style={{textAlign: 'center', marginTop: 20}}>
                                <CachedSharpIcon className='icon-spinner' fontSize='large' />
                            </div>}
                        </DialogContent>
        
                        <Divider />
                        
                        <DialogActions>
                            <Button onClick={() => this.changeGame(false)} color="primary" autoFocus>
                            <NavigateBefore></NavigateBefore> Previous
                            </Button>
                            <Button onClick={() => this.changeGame(true)} color="primary" autoFocus>
                                Next <NavigateNext></NavigateNext>
                            </Button>
                            <Button onClick={() => this.renderGame(null)} color="primary" autoFocus>
                                Close
                            </Button>
                        </DialogActions>
                </Dialog>
            </div>
        } else {
            return <div style={{textAlign: 'center'}}>
                    <CachedSharpIcon className='icon-spinner' fontSize='large' />
                </div>
        }
    }
}

export default RankingHistoryChart