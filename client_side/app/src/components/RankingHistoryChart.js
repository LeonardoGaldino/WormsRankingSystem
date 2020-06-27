import React from 'react'
import Chart from 'chart.js'
import CachedSharpIcon from '@material-ui/icons/CachedSharp';

import {API_ENDPOINT} from '../env.js';

class RankingHistoryChart extends React.Component {

    state = {
        data: null,
    }
    requestPath = '/worms/api/player/ranking_history';


    async fetchData(playerName){
      let url = new URL(API_ENDPOINT + this.requestPath);
      url.searchParams.append('player_name', playerName);

      let res = await fetch(url);
      let resJSON = await res.json();

      this.setState({
          data: resJSON,
      });
    }

    // After data is available
    componentDidUpdate() {
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
            }
        });
    }

    componentDidMount(){
        this.fetchData(this.props.player);
    }

    render(){
        return (this.state.data !== null ?
                    <canvas id="ranking-history-chart"></canvas>
                    :
                    <div style={{textAlign: 'center'}}>
                        <CachedSharpIcon className='icon-spinner' fontSize='large' />
                    </div>
            );
    }
}

export default RankingHistoryChart