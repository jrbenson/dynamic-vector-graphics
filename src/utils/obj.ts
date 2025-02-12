import deepEqual from 'deep-equal'

/**
 * Removes all properties from an object that are not in the provided list of keys.
 *
 * @param obj Object to trim.
 * @param keys List of keys to keep.
 */
export function trimObjProperties(obj: Record<string, any>, keys: string[]) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key) && !keys.includes(key)) {
      delete obj[key]
    }
  }
}

/**
 * Checks if an object is a subset of another object.
 *
 * @param obj1 Object to check if it is a subset.
 * @param obj2 Object to check if it is a superset.
 * @returns True if obj1 is a subset of obj2, false otherwise.
 */
export function objIsSubset(obj1: Record<string, any>, obj2: Record<string, any>) {
  for (let key in obj1) {
    if (obj1.hasOwnProperty(key) && !obj2.hasOwnProperty(key)) {
      return false
    }
  }
  return true
}

/**
 * Deletes all properties from obj1 that are deep duplicates of properties in obj2.
 *
 * @param obj1 Object to delete duplicate properties from.
 * @param obj2 Object to compare against.
 */
export function deleteDuplicateProperties(obj1: Record<string, any>, obj2: Record<string, any>) {
  for (let key in obj1) {
    if (obj1.hasOwnProperty(key) && obj2.hasOwnProperty(key)) {
      if (deepEqual(obj1[key], obj2[key])) {
        delete obj1[key]
      }
    }
  }
}
