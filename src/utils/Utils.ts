/**
 * Control flow functions.
 */
/* tslint:disable:no-increment-decrement id-length */
import * as ts from 'typescript';
export namespace Utils {
    /**
     * Logical 'any' or 'exists' function.
     */
    export function exists<T extends ts.Node>(list: ts.NodeArray<T>, predicate: (t: T) => boolean): boolean {
        if (list != null) {
            for (let i = 0; i < list.length; i++) {
                const obj: T = list[i];
                if (predicate(obj)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * A contains function.
     */
    export function contains<T extends ts.Node>(list: ts.NodeArray<T>, element: T): boolean {
        return exists(
            list,
            (item: T): boolean => {
                return item === element;
            }
        );
    }

    /**
     * A removeAll function.
     */
    export function removeAll<T extends ts.Node>(source: ts.NodeArray<T>, elementsToRemove: ts.NodeArray<T>): T[] {
        if (source == null || source.length === 0) {
            return [];
        }
        if (elementsToRemove == null || elementsToRemove.length === 0) {
            return [].concat(source); // be sure to return a copy of the array
        }

        return source.filter(
            (sourceElement: T): boolean => {
                return !contains(elementsToRemove, sourceElement);
            }
        );
    }

    /**
     * A remove() function.
     */
    export function remove<T extends ts.Node>(source: ts.NodeArray<T>, elementToRemove: T): T[] {
        return removeAll(source, <any>[elementToRemove]);
    }

    export function trimTo(source: string, maxLength: number): string {
        if (source == null) {
            return '';
        }
        if (source.length <= maxLength) {
            return source;
        }
        return source.substr(0, maxLength - 2) + '...';
    }

    /**
     * Check whether two arrays are equal.
     */
    export function arraysShallowEqual(arr1: any[], arr2: any[]) {
        if (arr1.length !== arr2.length) {
            return false;
        }
        for (let i = arr1.length; i--; ) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
        return true;
    }
}
/* tslint:enable:no-increment-decrement */
