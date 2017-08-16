// tslint:disable no-increment-decrement
/**
 * TypeScript program to print all topological sorts of a graph
 * Original C++ source code from http://www.geeksforgeeks.org/all-topological-sorts-of-a-directed-acyclic-graph/
 */
export class DirectedAcyclicGraph {
    private V: number;    // No. of vertices

    constructor(V: number) {
        this.V = V;

        // Initialising all indegree with 0
        for (let i: number = 0; i < V; i = i + 1) {
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
        const { V } = this;
        // Mark all the vertices as not visited
        const visited: boolean[] = [];
        for (let i: number = 0; i < V; i = i + 1) {
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
        const { V, inDegree, adj } = this;
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

        for (let i: number = 0; i < V; i++) {
            //  If indegree is 0 and not yet visited then
            //  only choose that vertex
            // console.log('i', i, inDegree[i], visited[i]); // tslint:disable-line no-console
            if (inDegree[i] === floor && !visited[i]) {
                // console.log('visit', i, inDegree[i], visited[i]); // tslint:disable-line no-console

                //  reducing indegree of adjacent vertices
                let j: number;
                for (j = 0; j < adj[i].length; j++) {
                    const jv = adj[i][j];
                    inDegree[jv]--;
                }

                //  including in result
                visited[i] = true;
                allSorts.push(...this.alltopologicalSortUtil(res.concat(i), visited));

                // resetting visited, res and indegree for
                // backtracking
                visited[i] = false;
                for (j = 0; j < adj[i].length; j++) {
                    const jv = adj[i][j];
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
    public addEdge(v: number, w: number): void {
        this.adj[v].push(w); // Add w to v's list.
        // increasing inner degree of w by 1
        this.inDegree[w]++;
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