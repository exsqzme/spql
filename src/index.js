import { connectToList } from './ListServices'
import SiteServices from './SiteServices'
import UserServices from './UserServices'
import AuthServices from './AuthServices'
import Caml from './caml'

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
    Caml

}

export default spql