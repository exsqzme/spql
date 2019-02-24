import { createWebService } from "../../utils/soap"

const webService = "usergroup"
const additionalHeader = "directory/"
const createWebServiceOperation = createWebService(webService, additionalHeader)

export const getUserCollectionFromGroup = createWebServiceOperation({
  name: "GetUserCollectionFromGroup",
  action: true
})
export const getGroupCollectionFromUser = createWebServiceOperation({
  name: "GetGroupCollectionFromUser",
  action: false
})
export const addUserCollectionToGroup = createWebServiceOperation({
  name: "AddUserCollectionToGroup",
  action: true
})
export const removeUserCollectionFromGroup = createWebServiceOperation({
  name: "RemoveUserCollectionFromGroup",
  action: true
})
export const addGroup = createWebServiceOperation({
  name: "AddGroup",
  action: true
})
export const removeGroup = createWebServiceOperation({
  name: "RemoveGroup",
  action: true
})
export const getCurrentUserInfo = createWebServiceOperation({
  name: "GetCurrentUserInfo",
  action: false
})
