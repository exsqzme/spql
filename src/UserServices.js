import { connectToList } from "./ListServices"
import {
  getGroupCollectionFromUser,
  getUserCollectionFromGroup,
  addGroup,
  removeGroup,
  addUserCollectionToGroup,
  removeUserCollectionFromGroup
} from "./soap/web-services/usergroup"
import { makeSoap } from "./soap/makeSoap"
import {
  encodeXml,
  usersXmlToJson,
  groupsXmlToJson,
  checkXmlForErrors
} from "./utils/xml"
import Caml from "./caml"

const buildUserXml = users => {
  const mapUsersToXml = userLogin => `<User LoginName="${userLogin}" />`
  return `<Users>${users.map(mapUsersToXml)}</Users>`
}

const UserServices = siteUrl => {
  const getUserById = id =>
    connectToList(siteUrl)("UserInfo").findById({
      id,
      select: [
        {
          staticName: "ID",
          alias: "id"
        },
        {
          staticName: "Name",
          alias: "account"
        },
        {
          staticName: "Title",
          alias: "displayName"
        },
        {
          staticName: "EMail",
          alias: "email"
        }
      ]
    })

  const getCurrentUser = () => getUserById(Caml.Values.CURRENT_USER)

  const getGroupsFromUser = userLoginName =>
    makeSoap(siteUrl, getGroupCollectionFromUser, { userLoginName }).then(
      groupsXmlToJson
    )

  const getUsersInGroup = groupName =>
    makeSoap(siteUrl, getUserCollectionFromGroup, {
      groupName: encodeXml(groupName)
    }).then(usersXmlToJson)

  const createGroup = ({
    name,
    description = "",
    ownerLoginName,
    ownerIsGroup = false,
    defaultUserLoginName
  }) => {
    const groupInfo = {
      groupName: encodeXml(name),
      description: encodeXml(description),
      ownerIdentifier: ownerLoginName,
      ownerType: ownerIsGroup ? "group" : "user",
      defaultUserLoginName
    }

    return makeSoap(siteUrl, addGroup, groupInfo).then(checkXmlForErrors)
  }

  const deleteGroup = groupName =>
    makeSoap(siteUrl, removeGroup, { groupName }).then(checkXmlForErrors)

  const addUsersToGroup = (userLoginName, groupName) => {
    if (typeof userLoginName === "string") {
      userLoginName = [userLoginName]
    }
    return makeSoap(siteUrl, addUserCollectionToGroup, {
      groupName,
      usersInfoXml: buildUserXml(userLoginName)
    }).then(checkXmlForErrors)
  }

  const deleteUsersFromGroup = (userLoginName, groupName) => {
    if (typeof userLoginName === "string") {
      userLoginName = [userLoginName]
    }
    return makeSoap(siteUrl, removeUserCollectionFromGroup, {
      groupName,
      userLoginNamesXml: buildUserXml(userLoginName)
    }).then(checkXmlForErrors)
  }

  const isUserInGroup = (userId, groupId) => {
    const groupIds = Array.isArray(groupId) ? groupId : [groupId]
    return getUserById(userId).then(({ account }) =>
      getGroupsFromUser(account).then(
        groups => groups && groups.some(g => groupIds.indexOf(g.id) > -1)
      )
    )
  }

  const isCurrentUserInGroup = groupId => {
    const groupIds = Array.isArray(groupId) ? groupId : [groupId]
    return getCurrentUser().then(({ account }) =>
      getGroupsFromUser(account).then(
        groups => groups && groups.some(g => groupIds.indexOf(g.id) > -1)
      )
    )
  }

  return {
    getUserById,
    getCurrentUser,
    getGroupsFromUser,
    getUsersInGroup,
    createGroup,
    deleteGroup,
    addUsersToGroup,
    deleteUsersFromGroup,
    isUserInGroup,
    isCurrentUserInGroup
  }
}

export default UserServices
