declare namespace Avatar {
    import ƒAid = FudgeAid;
    enum ACTION {
        IDLE = 0,
        WALK = 1
    }
    class Avatar extends ƒAid.NodeSprite {
        private animIdle;
        constructor();
        update(_deltaTime: number): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class ComponentController extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        private walkSpeed;
        private cmpAnimator;
        readonly avatarSpeed: number;
        private avatarIdleL;
        private avatarIdleR;
        private avatarWalkL;
        private avatarWalkR;
        private currentAnimation;
        constructor();
        hndEvent: (_event: Event) => void;
        update: (_event: Event) => void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class CustomComponentScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        constructor();
        hndEvent: (_event: Event) => void;
    }
}
declare namespace TestGame {
}
