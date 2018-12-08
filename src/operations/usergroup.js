import {makeOperation, makeOperationWithAction} from './helpers'

const USERGROUP = 'usergroup'
const makeUserOperation = makeOperation(USERGROUP)
const makeUserOperationWithAction = makeOperationWithAction(USERGROUP)

export const getUserCollectionFromGroup = makeUserOperation('GetUserCollectionFromGroup', 'directory/')
export const getGroupCollectionFromUser = makeUserOperation('GetGroupCollectionFromUser', 'directory/')
export const addUserCollectionToGroup = makeUserOperationWithAction('AddUserCollectionToGroup', 'directory/')
export const removeUserCollectionFromGroup = makeUserOperationWithAction('RemoveUserCollectionFromGroup', 'directory/')
export const addGroup = makeUserOperationWithAction('AddGroup', 'directory/')
export const removeGroup = makeUserOperationWithAction('RemoveGroup', 'directory/')

const getCurrentUserInfo = makeUserOperation('GetCurrentUserInfo', 'directory/')