export class PathNode {

    public additiveDistance: number;

    constructor(
        public readonly x: number,
        public readonly y: number,
        initialDistance: number = Infinity,
    ) {
        this.additiveDistance = initialDistance;
    }
}

export class PathEdge {
    constructor (
        public readonly a: PathNode,
        public readonly b: PathNode,
        public readonly distance: number,
    ) {}
}

export class PathGraph {

    private startNode: PathNode = new PathNode(0, 0);
    private finishNode: PathNode = new PathNode(0, 0);
    private edges: PathEdge[] = [];
    private currentNodes: PathNode[] = [];

    constructor(
        private nodes: PathNode[],
        private constantEdges: PathEdge[],
    ) {}

    reset(startX: number, startY: number, finishX: number, finishY: number) {
        this.startNode = new PathNode(startX, startY, 0);
        this.finishNode = new PathNode(finishX, finishY);
        this.nodes.sort((a, b) => getDistance(a, this.startNode) - getDistance(b, this.startNode));
        const startEdge = new PathEdge(
            this.startNode,
            this.nodes[0],
            getDistance(this.startNode, this.nodes[0]),
        );
        this.nodes.sort((a, b) => getDistance(a, this.finishNode) - getDistance(b, this.finishNode));
        const finishEdge = new PathEdge(
            this.nodes[0],
            this.finishNode,
            getDistance(this.finishNode, this.nodes[this.nodes.length - 1]),
        );
        this.edges = [startEdge, finishEdge].concat(this.constantEdges);
        this.nodes.forEach((n) => n.additiveDistance = Infinity);
        this.currentNodes = [this.startNode];
    }

    search(): PathNode[] {
        while (this.finishNode.additiveDistance == Infinity) {
            this.searchStep();
        }
        let path = [this.finishNode];
        do {
            let startNearest: PathNode | null = null;
            let nearestDistance: number = Infinity;
            this.edges.forEach((edge) => {
                const distanceFromA = edge.a.additiveDistance + edge.distance;
                const distanceFromB = edge.b.additiveDistance + edge.distance;
                if (edge.b === path[0] && distanceFromA < nearestDistance) {
                    startNearest = edge.a;
                    nearestDistance = distanceFromA;
                } else if (edge.a === path[0] && distanceFromB < nearestDistance) {
                    startNearest = edge.b;
                    nearestDistance = distanceFromB;
                }
            });
            if (startNearest) {
                path.unshift(startNearest);
            }
        } while (path[0] !== this.startNode)
        return path;
    }

    private searchStep() {
        const includeNodes: Array<PathNode> = [];
        const excludeNodes: Array<PathNode> = [];
        this.currentNodes.forEach((currentNode) => {
            this.edges.forEach((edge) => {
                const isAEdge = edge.a === currentNode;
                const isBEdge = edge.b === currentNode;
                const isAtoB = edge.a.additiveDistance + edge.distance < edge.b.additiveDistance;
                const isBtoA = edge.b.additiveDistance + edge.distance < edge.a.additiveDistance;
                if (isAEdge && isAtoB) {
                    if (edge.b.additiveDistance == Infinity) {
                        includeNodes.push(edge.b);
                    }
                    if (excludeNodes.every((n) => n !== edge.a)) {
                        excludeNodes.push(edge.a);
                    }
                    edge.b.additiveDistance = edge.a.additiveDistance + edge.distance;
                } else if (isBEdge && isBtoA) {
                    if (edge.a.additiveDistance == Infinity) {
                        includeNodes.push(edge.a);
                    }
                    if (excludeNodes.every((n) => n !== edge.b)) {
                        excludeNodes.push(edge.b);
                    }
                    excludeNodes.push(edge.b);
                    edge.a.additiveDistance = edge.b.additiveDistance + edge.distance;
                }
            });
        });
        this.currentNodes = this.currentNodes
            .filter((n) => excludeNodes.every((nn) => nn !== n))
            .concat(includeNodes);
    }
}

function getDistance(a: PathNode, b: PathNode): number {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}
