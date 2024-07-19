let knex = require("../database/connection");

class Equities {

    async getEquities(cpf) {
        try {
            let result = await knex.select("equeties").from("users").where("cpf", cpf);

            if (result.length > 0) {
                const formatedData = JSON.parse(result[0].equeties);
                return formatedData.date
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    }

    async update(cpf, data) {
        
        try {
            const date = data.date
            const dataEquities = data.data

            if(!date){
                return false;
            }

            


            console.log(date)
            console.log(typeof data)

        }catch (err) {
            console.log('Err!!!')
            console.log(err)
        }
        
        try {
            const dataString = JSON.stringify(data);

            await knex.update({ equeties: dataString }).where({ cpf: cpf }).table("users");

            return true;
        } catch (err) {
            console.log('Ouve um erro ao fazer o update');
            return false;
        }
    }
    async updateStocks(data) {
        try {
            const dataString = JSON.stringify(data);
            await knex("stocks").update({ stocks: dataString });
            return true;
        } catch (err) {
            console.log('Ouve um erro ao fazer o update das STOCKS');
            return false;
        }
    }

    async getStocks() {
        try {
            // Seleciona a coluna 'stocks' da tabela 'stocks'
            let result = await knex.select("stocks").from("stocks").limit(1);

            // Se houver resultados, result conterá um array com um objeto que tem a propriedade 'stocks'
            if (result.length > 0) {
                // Acessa o valor da coluna 'stocks'
                let stocksValue = result[0].stocks;
                stocksValue = JSON.parse(stocksValue)
                return stocksValue
            } else {
                console.log("Nenhum registro encontrado na tabela 'stocks'.");
            }
        } catch (error) {
            console.error("Ocorreu um erro ao tentar acessar o banco de dados:", error);
        }
    }

    async saveEquitiesHistory(cpf, data) {
        data = JSON.stringify(data);
        if (!data) {
            return false;
        }

        try {
            await knex.update({ equitiesHistory: data }).where({ cpf: cpf }).table("users");
            return true;
        } catch (err) {
            console.log(err);
        }
    }

    async getBrapiStocks(){
        try{

            //const data = await knex.select('*').from('stocks')
            let data = await knex.select(["stocks"]).table("stocks");
            if (data.length > 0) {
                
                const formatedData = JSON.parse(data[0].stocks);

                return formatedData;
            } else {
                return null;
            }
        }catch(err){

        }
    }
}

module.exports = new Equities();