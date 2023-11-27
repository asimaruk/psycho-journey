import { _decorator, Camera, Component, EPSILON, find, Rect, UITransform, v3 } from 'cc';
import { BackgroundBoxChanged, EventManager, PlayerMoveEvent } from './EventManager';
import { getDistance } from './utils/vector-utils';
const { ccclass } = _decorator;

@ccclass('FollowingPlayer')
export class FollowingPlayer extends Component {

    private vec3_0 = v3();
    private vec3_1 = v3();
    private followPosition = v3();
    private backgroundBox: Rect = new Rect();
    private minX = 0;
    private minY = 0;
    private maxX = 0;
    private maxY = 0;
    private uiTransform: UITransform;

    protected onLoad() {
        EventManager.on('player_moved', this.onPlayerMove, this);
        EventManager.on('background_box_changed', this.onBackgroundBoxChanged, this);
        if (this.getComponent(Camera)) {
            this.uiTransform = find('Canvas').getComponent(UITransform);
        } else {
            this.uiTransform = this.getComponent(UITransform);
        }
    }

    protected update(dt: number) {
        if (!this.followPosition.equals(this.node.position, EPSILON)) {
            this.node.setPosition(this.node.position.lerp(this.followPosition, dt));
        }
    }

    protected onDestroy() {
        EventManager.off('player_moved', this.onPlayerMove, this);
        EventManager.off('background_box_changed', this.onBackgroundBoxChanged, this);
    }

    private onPlayerMove(event: PlayerMoveEvent) {
        this.vec3_0.set(event.x1, event.y1);
        this.vec3_1.set(event.x2, event.y2);
        if (getDistance(this.node.position, this.vec3_1) > getDistance(this.node.position, this.vec3_0)) {
            this.followPosition.set(
                Math.min(Math.max(this.vec3_1.x, this.minX), this.maxX),
                Math.min(Math.max(this.vec3_1.y, this.minY), this.maxY),
            );
        }
    }

    private onBackgroundBoxChanged(event: BackgroundBoxChanged) {
        this.backgroundBox.set(event.box);
        this.minX = this.backgroundBox.xMin + this.uiTransform.width * this.uiTransform.anchorPoint.x;
        this.minY = this.backgroundBox.yMin + this.uiTransform.height * this.uiTransform.anchorPoint.y;
        this.maxX = this.backgroundBox.xMax - this.uiTransform.width * (1 - this.uiTransform.anchorPoint.x);
        this.maxY = this.backgroundBox.yMax - this.uiTransform.height * (1 - this.uiTransform.anchorPoint.y);
    }
}

