import { _decorator, Color, Component, Graphics, Node, toRadian, v2 } from 'cc';
import { EDITOR } from 'cc/env';
const { ccclass, property, requireComponent, executeInEditMode } = _decorator;

@ccclass('WayMark')
@requireComponent(Graphics)
@executeInEditMode
export class WayMark extends Component {

    @property
    _debugVisible = true;
    @property get debugVisible() {
        return this._debugVisible;
    } set debugVisible(value: boolean) {
        this._debugVisible = value;
        this.onDebugVisible();
    }
    @property({
        type: [Node],
    })
    private _connectedWayMarks: Node[] = [];
    @property({
        type: [Node]
    })
    get nextWayMarks(): Node[] {
        return this._connectedWayMarks;
    } set nextWayMarks(nodes: Node[]) {
        this._connectedWayMarks = nodes.filter((n) => n.getComponent(WayMark));
        this.onDebugVisible();
    }


    private g: Graphics;
    private tempV2 = v2();
    private tempV2_1 = v2();

    protected onLoad(): void {
        this.g = this.getComponent(Graphics);
        this.onDebugVisible()
    }

    private onDebugVisible() {
        if (this.debugVisible && EDITOR) {
            this.g.enabled = true;
            this.g.strokeColor = Color.GREEN;
            this.g.fillColor = Color.GREEN;
            this.g.lineWidth = 3;
            this.nextWayMarks.forEach((nextWM) => {
                this.tempV2.set(
                    nextWM.position.x - this.node.position.x,
                    nextWM.position.y - this.node.position.y,
                );
                this.g.moveTo(0, 0);
                this.g.lineTo(this.tempV2.x, this.tempV2.y);
                this.g.stroke();
                this.g.moveTo(this.tempV2.x, this.tempV2.y);
                this.tempV2_1.set(this.tempV2).negative().rotate(toRadian(20)).normalize().multiplyScalar(10);
                for (let i = 0; i < 2; i++) {
                    this.tempV2_1.rotate(toRadian(-40 * i));
                    this.g.lineTo(
                        this.tempV2.x + this.tempV2_1.x,
                        this.tempV2.y + this.tempV2_1.y
                    );
                }
                this.g.lineTo(this.tempV2.x, this.tempV2.y);
                this.g.fill();
                this.g.stroke();
            });

            this.g.fillColor = Color.GREEN;
            this.g.strokeColor = Color.BLACK;
            this.g.lineWidth = 2;
            this.g.roundRect(0, 0, 6, 100, 2.5);
            this.g.fill();
            this.g.stroke();
            this.g.fillColor = Color.RED;
            this.g.moveTo(5.5, 98);
            this.g.lineTo(35.5, 83);
            this.g.lineTo(5.5, 68);
            this.g.fill();
            this.g.stroke();
        } else {
            this.g.clear();
            this.g.enabled = false;
        }
    }
}

