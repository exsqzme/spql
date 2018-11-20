import {makeOperation, makeOperationWithAction} from './helpers'

const USERGROUP = 'usergroup'
const makeUserOperation = makeOperation(USERGROUP)

export const getUserCollectionFromGroup = makeUserOperation('GetUserCollectionFromGroup')