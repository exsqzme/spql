import { connectToList } from "./ListServices"
import SiteServices from "./SiteServices"
import UserServices from "./UserServices"
import Caml from "./caml"

const spql = {
  connect: siteUrl => {
    const User = UserServices(siteUrl)
    const List = connectToList(siteUrl)
    const Site = SiteServices(siteUrl)

    return {
      List,
      ...Site,
      ...User
    }
  },
  Caml
}

export default spql
