import { _decorator, Camera, Canvas, Component, director, RenderTexture, Sprite, SpriteFrame, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Ground')
export class Ground extends Component {

    @property({
        type: Camera
    }) groundCamera: Camera;
    @property({
        type: Sprite
    }) debugSprite: Sprite | null;

    private groundTexture: RenderTexture;
    private colorArr: Uint8Array = new Uint8Array([0, 0, 0, 0]);

    protected onLoad() {
        const mainCanvas = director.getScene().getComponentInChildren(Canvas);
        const mainCanvasUITransform = mainCanvas.getComponent(UITransform);
        this.groundTexture = new RenderTexture();
        this.groundTexture.reset({
            width: mainCanvasUITransform.width,
            height: mainCanvasUITransform.height,
        });
        this.groundCamera.targetTexture = this.groundTexture;
        this.groundCamera.orthoHeight = mainCanvas.cameraComponent.orthoHeight;
        if (this.debugSprite?.node?.active) {
            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = this.groundTexture;
            this.debugSprite.spriteFrame = spriteFrame;
        }
    }

    canWalk(x: number, y: number): boolean {
        this.groundTexture.readPixels(Math.round(x + 640), Math.round(y + 360), 1, 1, this.colorArr);
        console.log(this.colorArr);
        return this.colorArr[3] > 0;
    }
}

