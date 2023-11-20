import {
    _decorator,
    Camera,
    Canvas,
    Component,
    director,
    Graphics,
    RenderTexture,
    Sprite,
    SpriteFrame,
    UITransform,
} from 'cc';
import { WayMark } from './WayMark';
import { getDistance } from './utils/vector-utils';
import { PathEdge, PathGraph, PathNode } from './utils/graph-utils';
const { ccclass, property } = _decorator;

@ccclass('Map')
export class Map extends Component {

    @property({
        type: Camera
    }) mapCamera: Camera;
    @property({
        type: Sprite
    }) debugSprite: Sprite | null;
    @property({
        type: Graphics
    }) g: Graphics | null;

    private groundTexture: RenderTexture;
    private colorArr: Uint8Array;
    private wholeMap: Uint8Array;
    private wayMarks: Array<WayMark> = [];
    private graph: PathGraph;

    protected onLoad() {
        const mainCanvas = director.getScene().getComponentInChildren(Canvas);
        const mainCanvasUITransform = mainCanvas.getComponent(UITransform);
        const canvasWidth = Math.round(mainCanvasUITransform.width);
        const canvasHeight = Math.round(mainCanvasUITransform.height);
        this.colorArr = new Uint8Array(canvasWidth * canvasHeight * 4);
        this.wholeMap = new Uint8Array(canvasWidth * canvasHeight);
        this.wholeMap.fill(0);
        this.groundTexture = new RenderTexture();
        this.groundTexture.reset({
            width: canvasWidth,
            height: canvasHeight,
        });
        this.mapCamera.targetTexture = this.groundTexture;
        this.mapCamera.orthoHeight = mainCanvas.cameraComponent.orthoHeight;
        if (this.debugSprite?.node?.active) {
            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = this.groundTexture;
            this.debugSprite.spriteFrame = spriteFrame;
        }
        this.wayMarks = this.getComponentsInChildren(WayMark);
        const pathNodes = this.wayMarks.map((wm) => new PathNode(wm.node.position.x, wm.node.position.y));
        const pathEdges = this.wayMarks.reduce<Array<PathEdge>>((edges, wm) => {
            const wmX = wm.node.position.x;
            const wmY = wm.node.position.y;
            const nextEdges = wm.nextWayMarks.map((nextWM) => {
                return new PathEdge(
                    pathNodes.find((n) => n.x == wmX && n.y == wmY),
                    pathNodes.find((n) => n.x == nextWM.position.x && n.y == nextWM.position.y),
                    getDistance(wm.node.position, nextWM.position),
                )
            });
            return edges.concat(nextEdges);
        }, []);
        this.graph = new PathGraph(pathNodes, pathEdges);
    }

    canWalk(x: number, y: number): boolean {
        this.colorArr.fill(0);
        this.groundTexture.readPixels(Math.round(x + 640), Math.round(y + 360), 1, 1, this.colorArr);
        return this.colorArr[3] == 255;
    }

    findPath(fromX: number, fromY: number, toX: number, toY: number): number[] {
        this.graph.reset(fromX, fromY, toX, toY);
        const path = this.graph.search();
        return path.reduce<Array<number>>((acc, v) => {
            acc.push(v.x);
            acc.push(v.y);
            return acc;
        }, []);
    }
}
