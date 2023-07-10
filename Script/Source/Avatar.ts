namespace Avatar {
    import ƒ = FudgeCore;
    import ƒAid = FudgeAid;


    async function loadAvatar(): Promise<void> {
        let imgAvatar: ƒ.TextureImage = new ƒ.TextureImage()
    }


    export enum ACTION {
        IDLE, WALK
    }

    export class Avatar extends ƒAid.NodeSprite {
        private animIdle: ƒAid.SpriteSheetAnimation;

        public constructor() {
            super("Avatar");
            this.addComponent(new ƒ.ComponentTransform);

        }

        public update(_deltaTime: number): void {


        }

    }

}