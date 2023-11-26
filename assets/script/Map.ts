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
    private mapColorSingle: Uint8Array;
    private mapColors: Uint8Array;
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
        this.mapColorSingle = new Uint8Array(4);
        this.mapColors = new Uint8Array(canvasWidth * canvasHeight * 4);
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
        const cameraRelatedX = Math.round(x - this.mapCamera.node.position.x + 640);
        const cameraRelatedY = Math.round(y - this.mapCamera.node.position.y + 360);
        this.groundTexture.readPixels(cameraRelatedX, cameraRelatedY, 1, 1, this.mapColorSingle);
        return this.mapColorSingle[3] == 255;
    }

    private isWalkable(x: number, y: number): boolean {
        if (Math.abs(this.mapCamera.node.position.x - x) > 640 || Math.abs(this.mapCamera.node.position.y - y) > 360) {
            return false;
        }
        const cameraRelatedX = Math.round(x - this.mapCamera.node.position.x + 640);
        const cameraRelatedY = Math.round(y - this.mapCamera.node.position.y + 360);
        const pointAlphaIndex = (cameraRelatedX + 1280 * cameraRelatedY) * 4 + 3;
        return this.mapColors[pointAlphaIndex] == 255;
    }

    findPath(fromX: number, fromY: number, toX: number, toY: number): number[] {
        const now = Date.now();
        this.groundTexture.readPixels(0, 0, this.groundTexture.width, this.groundTexture.height, this.mapColors);
        console.log(`Ground texture reading took ${Date.now() - now}ms`);

        if (this.g && this.g.enabledInHierarchy) {
            this.g.clear();
            this.g.node.setPosition(this.mapCamera.node.position);
            for (let i = 3; i < this.mapColors.length; i += 4) {
                if (this.mapColors[i] == 255) {
                    const n = Math.floor(i / 4);
                    this.g.circle(n % 1280 - 640, Math.ceil(n / 1280) - 360, 1);
                    this.g.fill();
                }
            }
        }

        if (!this.isWalkable(toX, toY)) {
            return [];
        }

        const now_1 = Date.now();
        this.graph.reset(fromX, fromY, toX, toY, (x0, y0, x1, y1) => {
            if (!this.isWalkable(x0, y0) || !this.isWalkable(x1, y1)) {
                return Infinity;
            }
            this.vec3a.set(x0, y0);
            this.vec3b.set(x1, y1);
            const dist = getDistance(this.vec3a, this.vec3b);
            const xDist = x1 - x0;
            const yDist = y1 - y0;
            for (let i = 1; i < dist; i++) {
                const ratio = i / dist;
                this.vec3c.set(x0 + xDist * ratio, y0 + yDist * ratio);
                if (!this.isWalkable(this.vec3c.x, this.vec3c.y)) {
                    return Infinity;
                }
            }
            return dist;
        });
        console.log(`Graph reseting took ${Date.now() - now_1}ms`);
        const path = this.graph.search();
        return path.reduce<Array<number>>((acc, v) => {
            acc.push(v.x);
            acc.push(v.y);
            return acc;
        }, []);
    }
}
