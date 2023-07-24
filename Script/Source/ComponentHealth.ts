namespace Script {
    import ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script);

    export class ComponentHealth extends ƒ.ComponentScript {
        public static readonly iSubclass: number = ƒ.Component.registerSubclass(ComponentHealth);

        public health: Entity.Health;
        public maxHealth: number;

        private healthSprite: ƒ.AnimationSprite;
        private cmpAnimation: ƒ.ComponentAnimator;

        constructor() {
            super();

            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;

            this.maxHealth = 10;
            this.health = new Entity.Health(this.maxHealth);

            this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
            this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
            this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
            ƒ.Project.addEventListener(ƒ.EVENT.RESOURCES_LOADED, this.hndEvent);

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
                    this.cmpAnimation = TestGame.getNode(this.node, "Sprite").getComponent(ƒ.ComponentAnimator);
                    break;
                case ƒ.EVENT.RESOURCES_LOADED:
                    this.healthSprite = <ƒ.AnimationSprite>ƒ.Project.getResourcesByName("HealthBarSprite")[0];
                    break;
            }
        }

        public getDamage(_damage: number, _node: ƒ.Node) {
            this.health.getDamage(_damage);
            if (this.health.currentHealth <= 0) {
                let parent = _node.getParent();
                if (parent != null) {
                    parent.removeChild(_node);
                }
                // delete Node
            }
            // console.log(this.node.getAllComponents());
            //TODO: set healthbar sprite
            // console.log(this.cmpAnimation.animation);
        }
    }
}