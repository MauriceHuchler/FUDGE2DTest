namespace Entity {
    export class Enemy extends Entity {
        public target: ƒ.Node;
        public myPos: ƒ.ComponentTransform;
        constructor(_walkSpeed: number, _transform: ƒ.ComponentTransform) {
            super(new Health(5), _walkSpeed);
            this.myPos = _transform;
        }


        public walkTowards(): void {
            let deltaTime: number = ƒ.Loop.timeFrameGame / 1000;
            let tgtVector: ƒ.Vector2 = ƒ.Vector2.DIFFERENCE(new ƒ.Vector2(this.target.mtxLocal.translation.x, this.target.mtxLocal.translation.y), new ƒ.Vector2(this.myPos.mtxLocal.translation.x, this.myPos.mtxLocal.translation.y));

            if (tgtVector.x == 0 && tgtVector.y == 0) {
                return;
            }
            if (tgtVector.magnitudeSquared < 0.1) {
                return;
            }
            tgtVector.normalize();
            // console.log(this.myPos.mtxLocal.toString());
            this.myPos.mtxLocal.translate(ƒ.Vector3.SCALE(tgtVector.toVector3(), deltaTime * this.walkSpeed));

        }

    }
}