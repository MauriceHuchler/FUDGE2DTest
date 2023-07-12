namespace Entity {
    export class Health {
        private maxHealth: number;
        public currentHealth: number;
        constructor(_maxHealth: number) {
            this.maxHealth = _maxHealth;
            this.currentHealth = this.maxHealth;
        }


        public getDamage(_damage: number) {
            this.currentHealth -= _damage;
            if (this.currentHealth > this.maxHealth) {
                this.currentHealth = this.maxHealth;
            }
            console.log("Health:" + this.currentHealth);
        }
    }
}