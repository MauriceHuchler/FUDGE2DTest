namespace TestGame {
    export enum SOUNDS {
        AVATARWALK,
        AVATARSHOOT,
        ENEMYWALK,
        ENEMYSHOOT
    }

    const avatarWalkAudio: ƒ.Audio = new ƒ.Audio("Sounds/avatarWalk.mp3");
    const cmpAvatarWalk: ƒ.ComponentAudio = new ƒ.ComponentAudio(avatarWalkAudio, true, false);
    cmpAvatarWalk.connect(true);
    cmpAvatarWalk.volume = .08;

    const avatarShootAudio: ƒ.Audio = new ƒ.Audio("Sounds/avatarShoot.mp3");
    const cmpAvatarShoot: ƒ.ComponentAudio = new ƒ.ComponentAudio(avatarShootAudio, false, false);
    cmpAvatarShoot.connect(true);
    cmpAvatarShoot.volume = .4;

    export function getSoundByName(_name: SOUNDS) {
        switch (_name) {
            case SOUNDS.AVATARWALK:
                return cmpAvatarWalk;
            case SOUNDS.AVATARSHOOT:
                return cmpAvatarShoot;
            case SOUNDS.ENEMYSHOOT:
                break;
            case SOUNDS.ENEMYWALK:
                break;
        }
    }
}