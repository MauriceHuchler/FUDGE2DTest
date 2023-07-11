declare namespace Script {
    import ƒ = FudgeCore;
    class CharacterController extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        walkSpeed: number;
        private isFacingRight;
        private cmpAnimator;
        readonly avatarWalkL: ƒ.AnimationSprite;
        readonly avatarWalkR: ƒ.AnimationSprite;
        readonly avatarIdleL: ƒ.AnimationSprite;
        readonly avatarIdleR: ƒ.AnimationSprite;
        private currentAnimation;
        constructor();
        hndEvent: (_event: Event) => void;
        update: (_event: Event) => void;
    }
}
declare namespace Script {
    class CustomComponentScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        constructor();
        hndEvent: (_event: Event) => void;
    }
}
declare namespace TestGame {
}
