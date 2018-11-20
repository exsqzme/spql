const AuthServices = User => {
    const isUserInGroup = (id, groupId) =>
        User.getUserById(id)
            .then(({ account }) =>
                User.getUserGroups(account)
                    .then(groups => groups && groups.some(g => g.id == groupId)))

    const isCurrentUserInGroup = groupId =>
        User.getCurrentUser()
            .then(({ account }) =>
                User.getUserGroups(account)
                    .then(groups => groups && groups.some(g => g.id == groupId)))

    return {
        isUserInGroup,
        isCurrentUserInGroup
    }
}

export default AuthServices
