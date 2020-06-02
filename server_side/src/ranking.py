from abc import ABC, abstractmethod

class Player:

    def __init__(self, name: str):
        self.name = name

class ScoreComputer:

    @abstractmethod
    def compute_score(self) -> float:
        pass

class PlayerStatistics:

    ALPHA = 2.0
    BETA = 2.0
    GAMMA = 0.2

    def __init__(self, position: int, kills: int, suicides: int):
        self.position = position
        self.kills = kills
        self.suicides = suicides

    def compute_score(self) -> float:
        kill_points = self.ALPHA*self.kills
        suicide_points = self.BETA**self.suicides
        nominator = kill_points - suicide_points
        
        position_points = self.GAMMA*(self.position-1)
        denominator = 1 - position_points

    return nominator/denominator

class PlayerResult:

    def __init__(self, player: Player, playerStats: PlayerStatistics):
        self. player = player
        self.playerStats = playerStats
