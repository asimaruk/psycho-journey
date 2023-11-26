import { _decorator, Component, EPSILON, v3 } from 'cc';
import { EventManager, PlayerMoveEvent } from './EventManager';
import { getDistance } from './utils/vector-utils';
const { ccclass } = _decorator;

@ccclass('FollowingPlayer')
export class FollowingPlayer extends Component {

    private vec3_0 = v3();
    private vec3_1 = v3();
    private followPosition = v3();

    protected onLoad() {
        EventManager.on('player_moved', this.onPlayerMove, this);
    }

    protected update(dt: number) {
        if (!this.followPosition.equals(this.node.position, EPSILON)) {
            this.node.setPosition(this.node.position.lerp(this.followPosition, dt));
        }
    }

    protected onDestroy() {
        EventManager.off('player_moved', this.onPlayerMove, this);
    }

    private onPlayerMove(event: PlayerMoveEvent) {
        this.vec3_0.set(event.x1, event.y1);
        this.vec3_1.set(event.x2, event.y2);
        if (getDistance(this.node.position, this.vec3_1) > getDistance(this.node.position, this.vec3_0)) {
            this.followPosition.set(this.vec3_1);
        }
    }
}

