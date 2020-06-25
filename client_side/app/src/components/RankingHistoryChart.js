import React from 'react'
import Chart from 'chart.js'
import CachedSharpIcon from '@material-ui/icons/CachedSharp';
import dayjs from 'dayjs';

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
        let highestRanking = currentRanking;

        let rankings = [currentRanking];
        for(let game of data.history.reverse()){
            currentRanking -= game.delta_ranking;
            rankings.push(currentRanking);
            if(currentRanking > highestRanking){
                highestRanking = currentRanking;
            }
        }
        rankings = rankings.reverse();

        let borderColorArray = rankings.map(ranking => (ranking === highestRanking)
             ? 'rgba(255,0,0,1)' : 'rgba(236,245,66,1)');
        let xLabels = [''].concat(data.history.map(game => dayjs.unix(game.game_ts).format('DD/MM/YY')).reverse());

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: xLabels,
                datasets: [{
                    fill: false,
                    label: 'Ranking',
                    data: rankings,
                    backgroundColor: 'rgba(220,220,220,1)',
                    borderColor: 'rgba(236,245,66,1)',
                    pointBorderColor: borderColorArray,
                    borderWidth: .8,
                }]
            },
            options: {
                responsive: true,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: false
                        }
                    }],
                }
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