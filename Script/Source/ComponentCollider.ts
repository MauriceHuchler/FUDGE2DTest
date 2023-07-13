namespace Script {
    import ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script);

    export class ComponentCollider extends ƒ.ComponentScript {
        public static readonly iSubclass: number = ƒ.Component.registerSubclass(ComponentCollider);
        public position: ƒ.Vector3;
        public radius: number;

        constructor() {
            super();

            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;




            this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
            this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
            this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
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
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    this.position = this.node.mtxLocal.translation;
                    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);

                    break;
            }
        }

        public collides(_collider: ComponentCollider): boolean {
            let distance: ƒ.Vector2 = ƒ.Vector2.DIFFERENCE(this.position.toVector2(), _collider.position.toVector2());
            if (this.radius + _collider.radius > distance.magnitude) {
                // ƒ.Project.dispatchEvent(new CustomEvent("PlayerCollision"));

                return true;
            }
            return false;
        }


        public update = (): void => {
            this.position = this.node.mtxLocal.translation;
            console.log(this.position.toString());
        }


    }

}