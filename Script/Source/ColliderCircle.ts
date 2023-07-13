namespace Collider {
    import ƒ = FudgeCore;

    export class Collider {
        public position: ƒ.Vector2;
        public radius: number;

        constructor(_position: ƒ.Vector2, _radius: number) {
            this.position = _position;
            this.radius = _radius;
        }

        public collides(_collider: Collider): boolean {
            let distance: ƒ.Vector2 = ƒ.Vector2.DIFFERENCE(this.position, _collider.position);
            if (this.radius + _collider.radius > distance.magnitude) {
                return true;
            }
            return false;
        }

    }
}