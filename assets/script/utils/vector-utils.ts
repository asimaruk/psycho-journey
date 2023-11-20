import { Vec3 } from "cc";

export function getDistance(a: Vec3, b: Vec3): number {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2) + Math.pow(b.z - a.z, 2));
}
