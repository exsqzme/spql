import {connectToList} from './ListServices'
import {getGroupCollectionFromUser} from './operations/usergroup'
import CamlBuilder from './camlBuilder/caml'
import { makeSoap } from './makeSoap';
import {userGroupsXmlToJson} from './helpers/xml'

const UserServices = siteUrl => {
    
    const getUserById = id =>
        connectToList(siteUrl)('UserInfo')
            .findById(
                id,
                ['ID AS id', 'Name AS account', 'Title AS displayName', 'EMail AS email']
            )

    const getCurrentUser = () => getUserById(CamlBuilder.Values.CURRENT_USER)

    const getUserGroups = userLoginName =>
                makeSoap(siteUrl, getGroupCollectionFromUser, {userLoginName})
                    .then(userGroupsXmlToJson)

    return {
        getUserById,
        getCurrentUser,
        getUserGroups
    }

}

export default UserServices