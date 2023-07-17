namespace Script {
    import ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script);

    export class ComponentEnemy extends ƒ.ComponentScript {
        public static readonly iSubclass: number = ƒ.Component.registerSubclass(ComponentEnemy);

        private enemy: Entity.Enemy;
        public walkSpeed: number;
        public damage: number

        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.damage = 1;


            // Listen to this component being added to or removed from a node
            this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
            this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
            this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
            ƒ.Project.addEventListener(ƒ.EVENT.RESOURCES_LOADED, this.hndEvent);
            ƒ.Project.addEventListener("SetTarget", <EventListener>this.setTarget);

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
                    break;
                case ƒ.EVENT.RESOURCES_LOADED:
                    break;

            }
        }

        public setTarget = (_event: CustomEvent): void => {
            this.enemy = new Entity.Enemy(this.walkSpeed, this.node.cmpTransform);
            this.enemy.target = TestGame.getNode(TestGame.graph, "Avatar");
            ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
        }


        public update = (): void => {
            this.enemy.walkTowards();
        }
    }

}