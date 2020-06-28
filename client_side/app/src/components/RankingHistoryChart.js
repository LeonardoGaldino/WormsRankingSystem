import React from 'react'
import Chart from 'chart.js'
import CachedSharpIcon from '@material-ui/icons/CachedSharp';

import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import Divider from '@material-ui/core/Divider';

import {API_ENDPOINT} from '../env.js';

class RankingHistoryChart extends React.Component {

    state = {
        data: null,
        renderedChart: false,
        selectedGameId: null,
    }
    requestPath = '/worms/api/player/ranking_history';

    renderGame(gameId) {
        this.setState((state, _) => ({
            ...state,
            selectedGameId: gameId,
        }));
    }


    async fetchData(playerName){
      let url = new URL(API_ENDPOINT + this.requestPath);
      url.searchParams.append('player_name', playerName);

      let res = await fetch(url);
      let resJSON = await res.json();

      this.setState((state, _) => ({
          ...state,
          data: resJSON,
      }));
    }

    // After data is available
    componentDidUpdate() {
        if(this.state.renderedChart) {
            return;
        }

        let data = this.state.data;

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
                        this.renderGame(rankings[elems[0]._index].gameId);
                    }
                }
            }
        });
        this.setState((state, _) => ({
            ...state,
            renderedChart: true,
        }));
    }

    componentDidMount(){
        this.fetchData(this.props.player);
    }

    render(){
        if(this.state.data !== null) {
            return <div>
                <canvas id="ranking-history-chart"></canvas>
                <Dialog
                    maxWidth='md'
                    fullWidth={true}
                    open={this.state.selectedGameId !== null}
                    onClose={() => this.renderGame(null)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">
                        <DialogTitle id="alert-dialog-title">Game {this.state.selectedGameId}</DialogTitle>
        
                        <DialogContent>
                            TODO
                        </DialogContent>
        
                        <Divider />
                        
                        <DialogActions>
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