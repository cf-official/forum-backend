export class BitPerm {

    private perms: number;

    constructor(perms: number) {
        this.perms = perms;
    }

    set(perm: number) {
        this.perms |= perm;
    }

    toggle(perm: number) {
        this.perms ^= perm;
    }

    unset(perm: number) {
        this.perms &= ~perm;
    }

    has(perm: number): boolean {
        return !!(this.perms & perm);
    }

    get permissions() {
        return this.perms;
    }

}
