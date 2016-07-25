/**
 * @flow
 */

export type HorizonCollection = any
export type HorizonInstance = (collectionName: string) => HorizonCollection
export type Horizon = (config: Object) => HorizonInstance
