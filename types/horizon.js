/**
 * @flow
 */

export type HorizonCollection = any
export type HorizonObservable = any
export type HorizonInstance = (collectionName: string) => HorizonCollection
export type Horizon = (config: Object) => HorizonInstance
