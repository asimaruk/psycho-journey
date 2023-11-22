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
    v3,
} from 'cc';
import { WayMark } from './WayMark';
import { getDistance } from './utils/vector-utils';
import { GraphEdge, PathGraph, GraphNode } from './utils/graph-utils';
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
    private vec3a = v3();
    private vec3b = v3();
    private vec3c = v3();

    protected onLoad() {
        const mainCanvas = director.getScene().getComponentInChildren(Canvas);
        const mainCanvasUITransform = mainCanvas.getComponent(UITransform);
        const canvasWidth = Math.round(mainCanvasUITransform.width);
        const canvasHeight = Math.round(mainCanvasUITransform.height);
        this.colorArr = new Uint8Array(canvasWidth * canvasHeight * 4);
        this.wholeMap = new Uint8Array(canvasWidth * canvasHeight);
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
        const pathNodes = this.wayMarks.map((wm) => new GraphNode(wm.node.position.x, wm.node.position.y));
        const pathEdges = this.wayMarks.reduce<Array<GraphEdge>>((edges, wm) => {
            const wmX = wm.node.position.x;
            const wmY = wm.node.position.y;
            const nextEdges = wm.nextWayMarks.map((nextWM) => {
                return new GraphEdge(
                    pathNodes.find((n) => n.x == wmX && n.y == wmY),
                    pathNodes.find((n) => n.x == nextWM.position.x && n.y == nextWM.position.y),
                    getDistance(wm.node.position, nextWM.position),
                );
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
        const now = Date.now();
        this.groundTexture.readPixels(0, 0, this.groundTexture.width, this.groundTexture.height, this.colorArr);
        console.log(`Ground texture reading took ${Date.now() - now}`);
        const now_1 = Date.now();
        this.wholeMap.forEach((v, i) => {
            this.wholeMap[i] = this.colorArr[i * 4 + 3];
        });
        console.log(`Converting to map took ${Date.now() - now_1}`);

        if (this.g && this.g.enabledInHierarchy) {
            this.g.clear();
            this.wholeMap.forEach((v, i) => {
                if (v == 255) {
                    this.g.circle(i % 1280 - 640, Math.ceil(i / 1280) - 360, 1);
                    this.g.fill();
                }
            });
        }

        if (this.wholeMap[Math.round(toX) + 640 + 1280 * (Math.round(toY) + 360)] != 255) {
            return [];
        }

        const now_2 = Date.now();
        this.graph.reset(fromX, fromY, toX, toY, (x0, y0, x1, y1) => {
            this.vec3a.set(x0, y0);
            this.vec3b.set(x1, y1);
            const dist = getDistance(this.vec3a, this.vec3b);
            const xDist = x1 - x0;
            const yDist = y1 - y0;
            for (let i = 1; i < dist; i++) {
                const ratio = i / dist;
                this.vec3c.set(x0 + xDist * ratio, y0 + yDist * ratio);
                if (this.wholeMap[Math.round(this.vec3c.x) + 640 + 1280 * (Math.round(this.vec3c.y) + 360)] != 255) {
                    return Infinity;
                }
            }
            return dist;
        });
        console.log(`Graph reseting took ${Date.now() - now_2}`);
        const path = this.graph.search();
        return path.reduce<Array<number>>((acc, v) => {
            acc.push(v.x);
            acc.push(v.y);
            return acc;
        }, []);
    }
}
