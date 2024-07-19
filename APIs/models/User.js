let knex = require("../database/connection");
let bcrypt = require("bcrypt");
const PasswordToken = require("./PasswordToken");

class User {

    async findAll() {
        try {
            let result = await knex.select(["*"]).table("users");
            return result;
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    async findById(id) {
        try {
            let result = await knex.select(["id", "email", "role", "name"]).where({ id: id }).table("users");

            if (result.length > 0) {
                return result[0];
            } else {
                return undefined;
            }

        } catch (err) {
            console.log(err);
            return undefined;
        }
    } 
    
    async findEquitiesById(id) {
        try {
            let result = await knex.select(["equeties"]).where({ id: id }).table("users");

            if (result.length > 0) {
                return result[0];
            } else {
                return undefined;
            }

        } catch (err) {
            console.log(err);
            return undefined;
        }
    }

    async findByEmail(email) {
        try {
            let result = await knex.select(["avatar", "cpf", "password","email", "fullName", "id", "role", "username", "abilityRules"]).where({ email: email }).table("users");

            if (result.length > 0) {
                return result[0];
            } else {
                return undefined;
            }

        } catch (err) {
            console.log(err);
            return undefined;
        }
    }

    async new(email, password, username, fullname, role, abilityRules, avatar, birth, phone, cpf, plan, equeties) {
        try {
            let hash = await bcrypt.hash(password, 10);
            await knex.insert({ email, password: hash, username, fullname, role, abilityRules, avatar, birth, phone, cpf, plan, equeties }).table("users");
        } catch (err) {
            console.log(err);
        }
    }

    async findEmail(email) {
        try {
            let result = await knex.select("*").from("users").where({ email: email });

            if (result.length > 0) {
                return true;
            } else {
                return false;
            }

        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async findCpf(cpf) {
        try {
            let result = await knex.select("*").from("users").where({ cpf: cpf });

            if (result.length > 0) {
                return true;
            } else {
                return false;
            }

        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async update(id, email, name, role) {

        let user = await this.findById(id);

        if (user != undefined) {

            let editUser = {};

            if (email != undefined) {
                if (email != user.email) {
                    let result = await this.findEmail(email);
                    if (result == false) {
                        editUser.email = email;
                    } else {
                        return { status: false, err: "O e-mail já está cadastrado" }
                    }
                }
            }

            if (name != undefined) {
                editUser.name = name;
            }

            if (role != undefined) {
                editUser.role = role;
            }

            try {
                await knex.update(editUser).where({ id: id }).table("users");
                return { status: true }
            } catch (err) {
                return { status: false, err: err }
            }

        } else {
            return { status: false, err: "O usuário não existe!" }
        }
    }

    async delete(id) {
        let user = await this.findById(id);
        if (user != undefined) {

            try {
                await knex.delete().where({ id: id }).table("users");
                return { status: true }
            } catch (err) {
                return { status: false, err: err }
            }

        } else {
            return { status: false, err: "O usuário não existe, portanto não pode ser deletado." }
        }
    }

    async changePassword(newPassword, id, token) {
        let hash = await bcrypt.hash(newPassword, 10);
        await knex.update({ password: hash }).where({ id: id }).table("users");
        await PasswordToken.setUsed(token);
    }

    async findEquitiesHistoryByCpf(cpf){
        try {
            let result = await knex.select(["equitiesHistory"]).where({ cpf: cpf }).table("users");

            
            if (result.length > 0) {
                
                const formatedData = JSON.parse(result[0].equitiesHistory)
                return formatedData;
            } else {
                return undefined;
            }

        } catch (err) {
            console.log(err);
            return undefined;
        }
    }
}

module.exports = new User();