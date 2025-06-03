import bcrypt from "bcrypt"

export const encryptPassword = (password: string): string => {
    return bcrypt.hashSync(password, 10)
}

export const comparePassword = (password: string, hashPassword: string): boolean => {
    return bcrypt.compareSync(password, hashPassword)
}