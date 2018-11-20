import {connectToList} from './List'
import CamlBuilder from './camlBuilder/caml'

const User = siteUrl => {
    
    const getUserById = id =>
        connectToList(siteUrl)('UserInfo')
            .findById(
                id,
                ['ID AS id', 'Name AS account', 'Title AS displayName', 'EMail AS email']
            )

    const getCurrentUser = () => getUserById(CamlBuilder.Values.CURRENT_USER)

    return {
        getUserById,
        getCurrentUser
    }

}

export default User