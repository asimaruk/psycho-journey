import {
    _decorator,
    Animation,
    Canvas,
    Component,
    director,
    EventKeyboard,
    EventMouse,
    Input,
    input,
    KeyCode,
    Node,
    toRadian,
    UITransform,
    v2,
    v3,
    Vec2,
    Vec3
} from 'cc';
import { Map } from './Map';
import { EventManager, PlayerMoveEvent } from './EventManager';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('PlayerController')
@requireComponent(Animation)
export class PlayerController extends Component {

    @property
    speed = 1.0;
    @property({
        type: Map
    }) map: Map;

    private direction = v2();
    private vec2a = v2();
    private vec2b = v2();
    private animation: Animation;
    private mouseEventLocationV2 = v2();
    private mouseEventLocationV3 = v3();
    private inParentLocationV3 = v3();
    private path: Array<number> = [];
    private nextPathPointV3: Vec3 = v3();
    private vec3a = v3();
    private camera: Node;

    protected onLoad() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        this.animation = this.getComponent(Animation);
        this.camera = director.getScene().getComponentInChildren(Canvas).cameraComponent.node;
    }

    update(deltaTime: number) {
        const walkState = this.animation.getState('player_walk');
        if (this.direction.equals(Vec2.ZERO) && this.nextPathPointV3.equals(Vec3.ZERO)) {
            if (walkState.isPlaying) {
                walkState.pause();
            }
            return;
        }

        if (!this.direction.equals(Vec2.ZERO)) {
            // reset auto moving when touched navigation keys
            this.nextPathPointV3.set(Vec3.ZERO);
            this.path = null;

            if (!walkState.isPlaying || walkState.isPaused) {
                walkState.play();
            }
            this.vec2b.set(this.direction).multiplyScalar(this.speed * deltaTime);
            this.vec2a
                .set(this.vec2b)
                .add2f(this.node.position.x, this.node.position.y);
            for (let i = 1; i <= 160; i++) {
                if (this.map.canWalk(this.vec2a.x, this.vec2a.y)) {
                    const moveEvent: PlayerMoveEvent = {
                        kind: 'player_moved',
                        x1: this.node.position.x,
                        y1: this.node.position.y,
                        x2: this.vec2a.x,
                        y2: this.vec2a.y,
                    };
                    this.node.setPosition(this.vec2a.x, this.vec2a.y);
                    EventManager.emit('player_moved', moveEvent);
                    break;
                }
                this.vec2a
                    .set(this.vec2b)
                    .rotate(toRadian(i < 80 ? i : (80 - i)))
                    .add2f(this.node.position.x, this.node.position.y);
            }
        } else if (!this.nextPathPointV3.equals(Vec3.ZERO)) {
            if (!walkState.isPlaying || walkState.isPaused) {
                walkState.play();
            }
            this.vec3a
                .set(this.nextPathPointV3)
                .subtract(this.node.position)
                .normalize()
                .multiplyScalar(this.speed * deltaTime)
                .add(this.node.position);
            const moveEvent: PlayerMoveEvent = {
                kind: 'player_moved',
                x1: this.node.position.x,
                y1: this.node.position.y,
                x2: this.vec3a.x,
                y2: this.vec3a.y,
            };
            this.node.setPosition(this.vec3a);
            EventManager.emit('player_moved', moveEvent);
            if (this.node.position.equals(this.nextPathPointV3, 1)) {
                this.path = this.path.slice(2);
                if (this.path.length >= 2) {
                    this.nextPathPointV3.set(this.path[0], this.path[1]);
                } else {
                    this.path = [];
                    this.nextPathPointV3.set(Vec3.ZERO);
                }
            }
        }
    }

    protected onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
        input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
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

    private onMouseUp(event: EventMouse) {
        event.getUILocation(this.mouseEventLocationV2);
        console.log(`Mouse coordinates: ${this.mouseEventLocationV2}`);
        this.mouseEventLocationV3.set(this.mouseEventLocationV2.x, this.mouseEventLocationV2.y, 0);
        this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(this.mouseEventLocationV3, this.inParentLocationV3);
        this.inParentLocationV3.add(this.camera.position); // add camera offset cause UITransform doesn't take into account
        console.log(`Parent coordinates: ${this.inParentLocationV3}`);
        const now = Date.now();
        this.path = this.map.findPath(
            this.node.position.x,
            this.node.position.y,
            this.inParentLocationV3.x,
            this.inParentLocationV3.y,
        );
        console.log(`Path evaluating took ${Date.now() - now}ms`);
        if (this.path.length > 0) {
            this.nextPathPointV3.set(this.path[0], this.path[1]);
        }
    }
}

