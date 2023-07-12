namespace Entity {
    import ƒ = FudgeCore;

    export class Entity extends ƒ.Node {
        public health: Health;
        public walkSpeed: number;

        constructor(_health: Health, _walkSpeed: number) {
            super("Entity");
            this.health = _health;
            this.walkSpeed = _walkSpeed;
            this.attach(new ƒ.ComponentTransform());
        }
    }
}