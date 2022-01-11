import InternalPlayer, { PlayerProps } from "./Player";
import PlayerContainer from "./PlayerContainer";
import PlayerControls from "./PlayerControls";

type InternalPlayerType = typeof InternalPlayer;

interface PlayerInterface extends InternalPlayerType {
  Container: typeof PlayerContainer;
  Controls: typeof PlayerControls;
}

const Player = InternalPlayer as PlayerInterface;

Player.Container = PlayerContainer;
Player.Controls = PlayerControls;

export { PlayerProps };

export default Player;
