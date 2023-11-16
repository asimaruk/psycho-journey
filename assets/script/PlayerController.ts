import { _decorator, Animation, Component, EventKeyboard, HALF_PI, Input, input, KeyCode, toRadian, TWO_PI, v2, Vec2 } from 'cc';
import { Map } from './Map';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('PlayerController')
@requireComponent(Animation)
export class PlayerController extends Component {

    @property
    speed = 1.0;
    @property({
        type: Map
    }) ground: Map;

    private direction = v2();
    private v2temp = v2();
    private v2temp2 = v2();
    private animation: Animation;

    protected onLoad() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        this.animation = this.getComponent(Animation);
    }

    update(deltaTime: number) {
        const walkState = this.animation.getState('player_walk');
        if (this.direction.equals(Vec2.ZERO)) {
            if (walkState.isPlaying) {
                walkState.pause();
            }
            return;
        }

        if (!walkState.isPlaying || walkState.isPaused) {
            walkState.play();
        }
        this.v2temp2.set(this.direction).multiplyScalar(this.speed * deltaTime);
        this.v2temp
            .set(this.v2temp2)
            .add2f(this.node.position.x, this.node.position.y);
        for (let i = 1; i <= 160; i++) {
            if (this.ground.canWalk(this.v2temp.x, this.v2temp.y)) {
                this.node.setPosition(this.v2temp.x, this.v2temp.y);
                break;
            }
            this.v2temp
                .set(this.v2temp2)
                .rotate(toRadian(i < 80 ? i : (80 - i)))
                .add2f(this.node.position.x, this.node.position.y);
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

