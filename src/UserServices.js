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
import { encodeXml, usersXmlToJson, groupsXmlToJson } from "./utils/xml"
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
        "ID AS id",
        "Name AS account",
        "Title AS displayName",
        "EMail AS email"
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
    owner,
    ownerIsGroup = false,
    defaultUserLoginName
  }) => {
    const groupInfo = {
      groupName: encodeXml(name),
      description: encodeXml(description),
      ownerIdentifier: owner,
      ownerType: ownerIsGroup ? "group" : "user",
      defaultUserLoginName
    }

    return makeSoap(siteUrl, addGroup, groupInfo)
  }

  const deleteGroup = groupName => makeSoap(siteUrl, removeGroup, { groupName })

  const addUserToGroup = (groupName, userLogin) => {
    if (typeof userLogin === "string") {
      userLogin = [userLogin]
    }
    return (
      makeSoap(siteUrl, addUserCollectionToGroup, {
        groupName,
        usersInfoXml: buildUserXml(userLogin)
      })
        .then(() => true)
        // TODO: errors & return values
        .catch(() => false)
    )
  }

  const deleteUserFromGroup = (groupName, userLogin) => {
    if (typeof userLogin === "string") userLogin = [userLogin]
    return makeSoap(siteUrl, removeUserCollectionFromGroup, {
      groupName,
      userLoginNamesXml: buildUserXml(userLogin)
    })
  }

  return {
    getUserById,
    getCurrentUser,
    getGroupsFromUser,
    getUsersInGroup,
    createGroup,
    deleteGroup,
    addUserToGroup,
    deleteUserFromGroup
  }
}

export default UserServices
