# Advanced Soccer Statistics - KPI Formulas

This document explains the advanced statistics implemented in PitchMan.

## 1. Best CB Pair
**Goal**: Find the pair of center backs that offer the best defensive solidity.
- **Selection**: Matches where exactly 2 players with role `CB` (or `Difensore` as fallback) are in the starting lineup.
- **Formula**: `OpponentGoals / MatchesTogether`
- **Minimum Threshold**: `minPairMatches` (default: 3).
- **Ranking**: Ascending (lower is better).
- **Tie-break**: Most matches played > Lowest total goals conceded > Alphabetic key.

## 2. Best G/A per Starter Appearance
**Goal**: Identify the most impactful offensive players when they start the match.
- **Formula**: `(Goals + Assists) / StarterAppearances`
- **Metrics**: 
  - `Goals`: Goals scored by the player.
  - `Assists`: Assists recorded in events.
  - `StarterApps`: Number of matches where the player was in the starting lineup.
- **Minimum Threshold**: `minStarterApps` (default: 3).
- **Ranking**: Descending (higher is better).
- **Tie-break**: Highest (G+A) > Most starter apps > Alphabetic ID.

## 3. Most Decisive Goals
**Goal**: Identify "match winners", players who score the goal that definitively puts the team in the lead.
- **Algorithm**:
  1. Reconstruct chronological goal timeline.
  2. Find the first goal for our team after which the score never returns to a draw or loss status.
  3. Attribute success only if the match ends in a Win (`W`).
- **Confidence**:
  - `high`: All goal events (ours and opponents) are present and match the final score.
  - `mixed`: Some opponent goal events might be missing, but the team won.
- **Ranking**: Descending (most goals).
- **Tie-break**: Alphabetic ID.

## 4. Lowest Loss Rate as Starter
**Goal**: Identify "lucky charms" or solid players whose presence as starters correlates with not losing.
- **Formula**: `StarterLosses / StarterAppearances`
- **Metrics**:
  - `StarterLosses`: Matches where the player started and the result was `L`.
  - `StarterApps`: Total matches started.
- **Minimum Threshold**: `minStarterApps` (default: 3).
- **Ranking**: Ascending (lower is better).
- **Tie-break**: Most starter apps > Fewest total losses > Alphabetic ID.

---

## Technical Implementation Details
- **Backward Compatibility**: Data from legacy matches is normalized on-the-fly. If `teamGoals` or `opponentGoals` are missing, they are derived from the `result` object. If `resultType` is missing, it's calculated from goals.
- **Determinism**: All rankings use explicit tie-breaks to ensure consistent output for the same input data.
- **Persistence**: Results are stored in `teams/{seasonId}/aggregates/leaderboards/current` for fast retrieval.
