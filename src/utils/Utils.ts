/**
 * Control flow functions.
 */
/* tslint:disable:no-increment-decrement id-length */
export module Utils {
    /**
     * Logical 'any' or 'exists' function.
     */
    export function exists<T>(list: T[], predicate: (t: T) => boolean): boolean {
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
    export function contains<T>(list: T[], element: T): boolean {
        return exists(list, (item: T): boolean => {
            return item === element;
        });
    }

    /**
     * A removeAll function.
     */
    export function removeAll<T>(source: T[], elementsToRemove: T[]): T[] {
        if (source == null || source.length === 0) {
            return [];
        }
        if (elementsToRemove == null || elementsToRemove.length === 0) {
            return [].concat(source); // be sure to return a copy of the array
        }

        return source.filter((sourceElement: T): boolean => {
            return !contains(elementsToRemove, sourceElement);
        });
    }

    /**
     * A remove() function.
     */
    export function remove<T>(source: T[], elementToRemove: T): T[] {
        return removeAll(source, [elementToRemove]);
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
