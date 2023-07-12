namespace Script {
    import ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script);

    export class ComponentHealth extends ƒ.ComponentScript {
        public static readonly iSubclass: number = ƒ.Component.registerSubclass(ComponentHealth);

        private maxHealth: number
        public health: Entity.Health;

        constructor() {
            super();
            this.maxHealth = 5;
            this.health = new Entity.Health(this.maxHealth)
        }
    }
}