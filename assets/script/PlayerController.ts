import { _decorator, Component, EventKeyboard, Input, input, KeyCode, v2, Vec2 } from 'cc';
import { Ground } from './Ground';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {

    @property
    speed = 1.0;
    @property({
        type: Ground
    }) ground: Ground;

    private direction = v2();
    private tempV2 = v2();

    protected onLoad() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    update(deltaTime: number) {
        if (!this.direction.equals(Vec2.ZERO)) {
            this.tempV2.set(this.direction).multiplyScalar(this.speed * deltaTime);
            this.tempV2.add2f(this.node.position.x, this.node.position.y);
            if (this.ground.canWalk(this.tempV2.x, this.tempV2.y)) {
                this.node.setPosition(this.tempV2.x, this.tempV2.y);
            }
        }
    }

    protected onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    private onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_W:
            case KeyCode.ARROW_UP:
                this.direction.add(Vec2.UNIT_Y);
                break;
            case KeyCode.KEY_S:
            case KeyCode.ARROW_DOWN:
                this.direction.subtract(Vec2.UNIT_Y);
                break;
            case KeyCode.KEY_A:
            case KeyCode.ARROW_LEFT:
                this.direction.subtract(Vec2.UNIT_X);
                break;
            case KeyCode.KEY_D:
            case KeyCode.ARROW_RIGHT:
                this.direction.add(Vec2.UNIT_X);
                break;
        }
    }

    private onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_W:
            case KeyCode.ARROW_UP:
                this.direction.subtract(Vec2.UNIT_Y);
                break;
            case KeyCode.KEY_S:
            case KeyCode.ARROW_DOWN:
                this.direction.add(Vec2.UNIT_Y);
                break;
            case KeyCode.KEY_A:
            case KeyCode.ARROW_LEFT:
                this.direction.add(Vec2.UNIT_X);
                break;
            case KeyCode.KEY_D:
            case KeyCode.ARROW_RIGHT:
                this.direction.subtract(Vec2.UNIT_X);
                break;
        }
    }
}

