namespace Script {
    import ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script);

    export class ComponentSpawner extends ƒ.ComponentScript {
        public static readonly iSubclass: number = ƒ.Component.registerSubclass(CustomComponentScript);
        public enemyPrefab: ƒ.Node;
        public enemySpawnpoints: ƒ.Node[];

        constructor() {
            super();
            this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
            this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
            this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
            ƒ.Project.addEventListener("GraphReady", <EventListener>this.start);

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
            }
        }

        public start = () => {
           this.enemyPrefab

        }
        public spawnEnemies() {

        }
    }
}