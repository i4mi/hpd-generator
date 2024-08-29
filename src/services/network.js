import {Network} from 'vis-network';
import {DataSet} from 'vis-data';

var nodeIds, nodesArray, nodes, edgesArray, edges, clicked = [];

export var network;

export function getEdges() {
    return edges.get();
}

export function startNetwork() {
    // this list is kept to remove a random node.. we do not add node 1 here because it's used for changes
    nodeIds = [];

    // create an array with nodes
    nodesArray = [];
    nodes = new DataSet(nodesArray);

    // create an array with edges
    edgesArray = [];
    edges = new DataSet(edgesArray);

    // create a network
    var container = document.getElementById("mynetwork");
    var data = {
        nodes: nodes,
        edges: edges,
    };
    var options = {
        nodes: {
            shape: "box",
            margin: 10,
            shadow: {
                enabled: true,
                color: 'rgba(0,0,0,0.3)',
                size: 30,
                x: 0,
                y: 0
            },
            color: {
                border: '#4e73df',
                background: '#4e73df',
                highlight: {
                    border: '#3d4d99',
                    background: '#3D4D99'
                },
                hover: {
                    border: '#4e73df',
                    background: '#4e73df'
                }
            },
            font: {
                color: '#fff',
            }
        },
        edges: {
            arrows: {
                from: {
                    enabled: true,
                    type: "arrow",
                    scaleFactor: 0.5
                },
            },
            hoverWidth: 3,
            smooth: {
                enabled: true,
                type: "dynamic",
                roundness: 0.5
            }
        },
        physics: {
            hierarchicalRepulsion: {
                avoidOverlap: 0.7
            }
        }
    };
    network = new Network(container, data, options);
}

export function fold(input, lineSize) {
    let firstSpace = input.indexOf(" ", lineSize);
    if (firstSpace === -1) {
        return input;
    }
    return [input.slice(0, firstSpace), "\n", input.slice(firstSpace + 1)].join('');
}

export function addNode(node) {
   // node.label = fold(node.label, 5)
    var newId = (Math.random() * 1e7).toString(32);
    nodes.add(node);
    nodeIds.push(newId);
}

export function addEdge(from, to, length) {
    if (!length) {
        length = 200
    }
    network.body.data.edges.add([{
        from: from, to: to, length: length
    }])
}

export function resetAllNodes() {
    nodes.clear();
    edges.clear();
    nodes.add(nodesArray);
    edges.add(edgesArray);
}

export function redraw() {
    network.redraw()
}

export function resetAll() {
    startNetwork();
    if (network !== null) {
        network.destroy();
        network = null;
    }
    startNetwork();
}

