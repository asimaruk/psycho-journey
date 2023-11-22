export class GraphNode {

    public additiveDistance: number;
    private _x: number;
    private _y: number;

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    constructor(
        x: number,
        y: number,
        initialDistance: number = Infinity,
    ) {
        this._x = x;
        this._y = y;
        this.additiveDistance = initialDistance;
    }

    setup(x: number, y: number, initialDistance: number) {
        this._x = x;
        this._y = y;
        this.additiveDistance = initialDistance;
    }
}

export class GraphEdge {
    constructor (
        public readonly a: GraphNode,
        public readonly b: GraphNode,
        public readonly distance: number,
    ) {}
}

export class PathGraph {

    private startNode: GraphNode = new GraphNode(0, 0);
    private finishNode: GraphNode = new GraphNode(0, 0);
    private edges: GraphEdge[];
    private nodes: GraphNode[];
    private currentNodes: GraphNode[];
    private includeNodes: Array<GraphNode>;
    private excludeNodes: Array<GraphNode>;

    constructor(
        baseNodes: GraphNode[],
        private baseEdges: GraphEdge[],
    ) {
        this.nodes = Array.from(baseNodes).concat([this.startNode, this.finishNode]);
        this.currentNodes = Array(this.nodes.length);
        this.edges = Array.from(baseEdges).concat(Array((this.nodes.length - 1) * 2));
        this.includeNodes = Array(this.nodes.length);
        this.excludeNodes = Array(this.nodes.length);
    }

    reset(
        startX: number,
        startY: number,
        finishX: number,
        finishY: number,
        distance: (fromX: number, fromY: number, toX: number, toY: number) => number,
    ) {
        this.currentNodes.fill(undefined);
        this.nodes.forEach((n) => {
            n.additiveDistance = Infinity
        });
        this.edges.fill(undefined, this.baseEdges.length);
        this.includeNodes.fill(undefined);
        this.excludeNodes.fill(undefined);

        this.startNode.setup(startX, startY, 0);
        this.finishNode.setup(finishX, finishY, Infinity);
        this.nodes.forEach((n) => {
            if (n !== this.startNode) {
                const dist = distance(this.startNode.x, this.startNode.y, n.x, n.y);
                if (dist != Infinity && dist != -Infinity) {
                    const edge = new GraphEdge(this.startNode, n, dist);
                    push(this.edges, edge);
                }
            }
            if (n !== this.finishNode) {
                const dist = distance(this.finishNode.x, this.finishNode.y, n.x, n.y);
                if (dist != Infinity && dist != -Infinity) {
                    const edge = new GraphEdge(this.finishNode, n, dist);
                    push(this.edges, edge);
                }
            }
        });
    }

    search(): GraphNode[] {
        if (this.startNode.additiveDistance == Infinity) {
            return [];
        }
        push(this.currentNodes, this.startNode);
        while (this.finishNode.additiveDistance == Infinity) {
            this.searchStep();
        }
        let path = [this.finishNode];
        do {
            let startNearest: GraphNode | null = null;
            let nearestDistance: number = Infinity;
            this.edges.forEach((edge) => {
                if (!edge || edge.distance == Infinity) return;

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
        this.includeNodes.fill(undefined);
        this.excludeNodes.fill(undefined);
        this.currentNodes.forEach((currentNode) => {
            if (!currentNode) return;

            this.edges.forEach((edge) => {
                if (!edge) return;

                const isAEdge = edge.a === currentNode;
                const isBEdge = edge.b === currentNode;
                const isAtoB = edge.a.additiveDistance + edge.distance < edge.b.additiveDistance;
                const isBtoA = edge.b.additiveDistance + edge.distance < edge.a.additiveDistance;
                if (isAEdge && isAtoB) {
                    if (edge.b.additiveDistance == Infinity) {
                        push(this.includeNodes, edge.b);
                    }
                    pushUnique(this.excludeNodes, edge.a);
                    edge.b.additiveDistance = edge.a.additiveDistance + edge.distance;
                } else if (isBEdge && isBtoA) {
                    if (edge.a.additiveDistance == Infinity) {
                        push(this.includeNodes, edge.a);
                    }
                    pushUnique(this.excludeNodes, edge.b);
                    edge.a.additiveDistance = edge.b.additiveDistance + edge.distance;
                }
            });
        });
        clearAll(this.currentNodes, this.excludeNodes);
        pushAll(this.currentNodes, this.includeNodes);
    }
}

function push<T>(arr: Array<T>, elem: T) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i]) continue;
        arr.fill(elem, i, i + 1);
        break;
    }
}

function pushUnique<T>(arr: Array<T>, elem: T) {
    let insetPos = -1;
    for (let i = 0; i < arr.length; i++) {
        if (!arr[i] && insetPos < 0) {
            insetPos = i;
        }
        if (arr[i] === elem) return;
    }
    if (insetPos >= 0) {
        arr.fill(elem, insetPos, insetPos + 1);
    }
}

function pushAll<T>(arr: Array<T>, elems: Array<T>) {
    elems.forEach((e) => {
        if (!e) return;
        push(arr, e);
    });
}

function clearAll<T>(arr: Array<T>, elems: Array<T>) {
    elems.forEach((e) => {
        if (!e) return;
        for (let i = 0; i < arr.length; i++) {
            if (e === arr[i]) {
                arr[i] = undefined;
                break;
            }
        }
    });
}
