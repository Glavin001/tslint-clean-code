// tslint:disable no-increment-decrement
/**
 * TypeScript program to print all topological sorts of a graph
 * Original C++ source code from http://www.geeksforgeeks.org/all-topological-sorts-of-a-directed-acyclic-graph/
 */
export class DirectedAcyclicGraph {
    private numVertices: number; // No. of vertices

    constructor(numVertices: number) {
        this.numVertices = numVertices;

        // Initialising all indegree with 0
        for (let curr: number = 0; curr < numVertices; curr = curr + 1) {
            this.inDegree.push(0);
            this.adj.push([]);
        }
    }

    // Pointer to an array containing adjacency list
    private adj: number[][] = [];

    // Vector to store indegree of vertices
    private inDegree: number[] = [];

    //  The function does all Topological Sort.
    //  It uses recursive alltopologicalSortUtil()
    public alltopologicalSort(): number[][] {
        const { numVertices } = this;
        // Mark all the vertices as not visited
        const visited: boolean[] = [];
        for (let curr: number = 0; curr < numVertices; curr = curr + 1) {
            visited.push(false);
        }
        const res: number[] = [];
        return this.alltopologicalSortUtil(res, visited);
    }

    // A function used by alltopologicalSort
    // Prints all Topological Sorts
    //  Main recursive function to print all possible
    //  topological sorts
    private alltopologicalSortUtil(res: number[], visited: boolean[]): number[][] {
        // console.log('topSort', res, visited); // tslint:disable-line no-console
        const { numVertices, inDegree, adj } = this;
        // To indicate whether all topological are found
        // or not
        let flag: boolean = false;
        const allSorts: number[][] = [];
        const floor: number = inDegree.reduce((result, val, index) => {
            // console.log('i', index, val, visited[index]); // tslint:disable-line no-console
            if (visited[index] === false) {
                return Math.min(result, val);
            }
            return result;
        }, Infinity);
        // console.log('floor', floor); // tslint:disable-line no-console

        for (let vertex: number = 0; vertex < numVertices; vertex++) {
            //  If indegree is 0 and not yet visited then
            //  only choose that vertex
            // console.log('i', i, inDegree[i], visited[i]); // tslint:disable-line no-console
            if (inDegree[vertex] === floor && !visited[vertex]) {
                // console.log('visit', i, inDegree[i], visited[i]); // tslint:disable-line no-console

                //  reducing indegree of adjacent vertices
                let adjIndex: number;
                for (adjIndex = 0; adjIndex < adj[vertex].length; adjIndex++) {
                    const jv = adj[vertex][adjIndex];
                    inDegree[jv]--;
                }

                //  including in result
                visited[vertex] = true;
                allSorts.push(...this.alltopologicalSortUtil(res.concat(vertex), visited));

                // resetting visited, res and indegree for
                // backtracking
                visited[vertex] = false;
                for (adjIndex = 0; adjIndex < adj[vertex].length; adjIndex++) {
                    const jv = adj[vertex][adjIndex];
                    inDegree[jv]++;
                }

                flag = true;
            }
        }

        //  We reach here if all vertices are visited.
        //  So we print the solution here
        if (!flag) {
            // console.log('Finished', visited); // tslint:disable-line no-console
            allSorts.push(res);
        }
        return allSorts;
    }

    // function to add an edge to graph
    // Utility function to add edge
    public addEdge(src: number, dest: number): void {
        this.adj[src].push(dest); // Add w to v's list.
        // increasing inner degree of w by 1
        this.inDegree[dest]++;
    }
}

/*
// Driver program to test above functions
function main(): number {
    // Create a graph given in the above diagram
    const g = new DirectedAcyclicGraph(6);
    g.addEdge(5, 2);
    g.addEdge(5, 0);
    g.addEdge(4, 0);
    g.addEdge(4, 1);
    g.addEdge(2, 3);
    g.addEdge(3, 1);

    console.log('All Topological sorts\n'); // tslint:disable-line no-console

    const allSorts = g.alltopologicalSort();
    console.log(allSorts); // tslint:disable-line no-console

    return 0;
}

main();
*/
