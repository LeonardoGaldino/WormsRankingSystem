import React from 'react';
import Container from '@material-ui/core/Container';

import './App.css';
import RankingTable from './components/RankingTable.js';
import Games from './components/Games.js';

function App() {
  return (
    <div className="App">
      <Container>
        <h1 style={{display: 'inline-block'}}>Worms Ranking System</h1>
        <img style={{height: 100, position: 'relative', top: 20, marginLeft: 5}} src="./worms.png"></img>
        <RankingTable></RankingTable>
        <Games></Games>
      </Container>
    </div>
  );
}

export default App;
