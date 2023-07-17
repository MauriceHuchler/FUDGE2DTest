namespace Script {
    import ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script);

    export class ComponentBullet extends ƒ.ComponentScript {
        public static readonly iSubclass: number = ƒ.Component.registerSubclass(ComponentBullet);

        public speed: number;
        private lifetime: Cooldown;

        constructor() {
            super();
            this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
            this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
            this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
            this.speed = 15;
            this.lifetime = new Cooldown(3 * 60);
            this.lifetime.onEndCooldown = this.remove;
        }

        public hndEvent = (_event: Event): void => {
            switch (_event.type) {
                case ƒ.EVENT.COMPONENT_ADD:
                    break;
                case ƒ.EVENT.COMPONENT_REMOVE:
                    this.removeEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
                    this.removeEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
                    break;
                case ƒ.EVENT.NODE_DESERIALIZED:
                    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
                    this.lifetime.startCooldown();

                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
            }
        }

        public update = (): void => {
            let deltaTime: number = ƒ.Loop.timeFrameGame / 1000;
            this.node.mtxLocal.translateX(this.speed * deltaTime)
        }

        public remove = (): void => {
            TestGame.graph.removeChild(<ƒ.Node>this.node);
        }
    }


}
