import { _decorator, Component, Rect, UITransform } from 'cc';
import { EventManager } from './EventManager';
const { ccclass, requireComponent } = _decorator;

@ccclass('Background')
@requireComponent(UITransform)
export class Background extends Component {

    private uiTransform: UITransform;
    private boundingBox: Rect = new Rect();

    protected onLoad(): void {
        this.uiTransform = this.getComponent(UITransform);
        this.boundingBox.set(this.uiTransform.getBoundingBoxTo(this.node.parent.worldMatrix));
    }

    start() {
        EventManager.emit('background_box_changed', {
            kind: 'background_box_changed',
            box: this.boundingBox,
        });
    }
}

