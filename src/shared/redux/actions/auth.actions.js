export const SET_TOKEN = 'SET_TOKEN'
export const SET_USER = 'SET_USER'
export const SET_ROLES = 'SET_ROLES'



export const setToken = (value) => ({
    type: SET_TOKEN,
    payload: value
})

export const setUser = (value) => ({
    type: SET_USER,
    payload: value
})

export const setRoles = (value) => ({
    type: SET_ROLES,
    payload: value
})