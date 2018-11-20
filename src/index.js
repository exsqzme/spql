import {connectToList} from './ListServices'
import SiteServices from './SiteServices'
import UserServices from './UserServices'
import AuthServices from './AuthServices'
import CamlBuilder from './camlBuilder/caml'

const spql = {
    connect: siteUrl => {
        const User = UserServices(siteUrl)
        const List = connectToList(siteUrl)
        const Auth = AuthServices(User)
        const Site = SiteServices(siteUrl)

        return {
            List,            
            Auth,
            ...Site,
            ...User
        }
    },
    CamlBuilder
}

export default spql