namespace Script {
    import ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script);

    export class ComponentSpawner extends ƒ.ComponentScript {
        public static readonly iSubclass: number = ƒ.Component.registerSubclass(ComponentSpawner);
        public enemyPrefab: ƒ.Graph;
        public enemySpawnpoints: ƒ.Node[];
        public counter: number
        public spawnCooldown: Cooldown;
        public numberOfEnemies: number;
        public numberEnemiesHTML: HTMLElement;

        constructor() {

            super();
            this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
            this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
            this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
            ƒ.Project.addEventListener("GraphReady", <EventListener>this.start);
            this.counter = 0;
            this.numberOfEnemies = 4;
            this.spawnCooldown = new Cooldown(3 * 60);
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
                    this.numberEnemiesHTML = document.getElementById("EnemyNumber");
                    this.numberEnemiesHTML.innerText = this.numberOfEnemies.toString();
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
            }
        }

        public start = (_event: CustomEvent): void => {
            let spawnParent = TestGame.getNode(TestGame.graph, "Spawn Points");
            this.enemySpawnpoints = spawnParent.getChildren();
            this.enemyPrefab = <ƒ.Graph>ƒ.Project.getResourcesByName("Enemy")[0];

        }

        public update = (_event: Event): void => {
            if (this.numberOfEnemies > 0) {
                if (this.spawnCooldown.hasCooldown) {
                    return;
                }
                this.spawnEnemies();

            }
        }
        async spawnEnemies() {
            let nextSpawnPosition: ƒ.Vector3 = this.enemySpawnpoints[this.counter % 3].mtxLocal.translation;
            this.counter++;
            this.enemyPrefab.mtxLocal.translation = nextSpawnPosition;
            this.spawnCooldown.startCooldown();
            this.numberOfEnemies--;
            this.setHTMLText(this.numberOfEnemies);

            let instance = await ƒ.Project.createGraphInstance(this.enemyPrefab);
            TestGame.graph.addChild(instance);
            ƒ.Project.dispatchEvent(new CustomEvent("SetTarget"));
            TestGame.scanCollider();
        }

        private setHTMLText(_number: number) {
            this.numberEnemiesHTML.innerText = _number.toString();
        }


    }
}