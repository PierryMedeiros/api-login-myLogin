require('dotenv').config()

const path = require('path');
let Equities = require("../models/Equities");
const https = require('https');
const fs = require('fs')
const axios = require('axios');
const { exit } = require('process');

const dirOneLevelUp = path.resolve(__dirname, '..');

const httpsAgent = new https.Agent({
    key: fs.readFileSync(dirOneLevelUp + '/b3/10265994000121.key'),
    cert: fs.readFileSync(dirOneLevelUp + '/b3/10265994000121.cer'),
    passphrase: process.env.PASSWORD,
    rejectUnauthorized: false,
    keepAlive: true
})

const authenticate = async (cpf) => {
    const authorizationUrl = 'https://login.microsoftonline.com/4bee639f-5388-44c7-bbac-cb92a93911e6/oauth2/v2.0/token';

    const body = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        scope: '0c991613-4c90-454d-8685-d466a47669cb/.default',
    }).toString()

    const options = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }

    const response = await axios.post(authorizationUrl, body, options)

    const accessToken = response.data.access_token

    return accessToken
}

const validateAuth = async (accessToken) => {
    const authValidationUrl = `${process.env.URLB3}/api/acesso/healthcheck`

    const options = {
        httpsAgent,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
    }

    const response = await axios.get(authValidationUrl, options)
}

class b3Controller { 
    async index(req, res) {
        const cpf = req.body.cpf
        function getSharesInfo(cpf) {

            async function getLastSystemUpload() {
                const options = {
                    httpsAgent,
                    headers: {
                        'Authorization': `Bearer ${await authenticate()}`
                    },
                }

                try {

                    const response = await axios.get(`${process.env.URLB3}/api/system/v1/last-load-update`, options);

                    const formatedResponse = response.data.data.lastLoadedDate.split('T')[0];

                    if (response.status === 200) {

                        return formatedResponse;
                    }else if(response.status === 204){
                        return '2001-01-01'
                    }
                } catch (err) {
                    console.log(err)
                    return '2001-01-01'
                }
            }

            async function getLastDbEquitiesUpload(cpf) {
                let equitiesDate = await Equities.getEquities(cpf); //null | undefinded | data

                return equitiesDate;
            }


            async function getEquities(accessToken, documentNumber, referenceStartDate, referenceEndDate, page) {
                const equitiesUrl = `${process.env.URLB3}/api/position/v3/equities/investors/${documentNumber}`


                const options = {
                    httpsAgent,
                    params: {
                        referenceStartDate,
                        referenceEndDate,
                        page
                    },
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }

                try {
                    const response = await axios.get(equitiesUrl, options);
                    if (response.status == 200) {
                        const data = {
                            status: response.status,
                            data: response.data.data.equitiesPositions
                        }

                        return data
                    } else if (response.status == 204) {
                        const data = {
                            status: 204,
                            data: null
                        }

                        return data
                    }


                } catch (error) {
                    if (error.response) {
                        console.log('Erro na resposta da requisição da api:', error.response.data);

                        res.status(405)
                        res.send("CPF Inválido!!!")
                        return
                    } else if (error.request) {
                        console.log('Erro na requisição:', error.request);
                        res.status(404)
                        res.send("Ouve um erro")
                        return
                    } else {
                        console.log('Erro inesperado:', error.message);
                        res.status(400)
                        res.send("Ouve um erro")
                        return
                    }
                    return null;
                }
            }

            async function main(cpf, date, page) {
                const accessToken = await authenticate()

                await validateAuth(accessToken)

                let equities = await getEquities(
                    accessToken,
                    cpf,
                    date,
                    date,
                    page,
                    res
                )

                return equities;
            }
            async function updateEquities(cpf) {
                let data = [];
                let status = 200;
                const dateB3 = await getLastSystemUpload();
                //const dateDb = await getLastDbEquitiesUpload(cpf);
                const dateDb = '2000/08/11';

                let dataDbObj = new Date(dateDb);
                let dateB3Obj = new Date(dateB3);

                console.log('Data sistema b3:' + dateB3);
                console.log('Data DB ' + dateDb);

                if (dateB3 === dateDb || dataDbObj > dateB3Obj) {
                    res.status(204);
                    res.send('Dados das ações já atualizados');
                    return;
                } else {
                    try {
                        for (let page = 1; status === 200; page++) {
                            let step = await main(cpf, dateB3, page);
                            if (!step) {
                                return
                            }
                            if (step.status && step.data) {
                                data = data.concat(step.data);
                            }
                            status = step.status;

                            console.log(page);
                        }
                    } catch (err) {
                        if (err.response) {
                            res.status(400)
                            //console.error(err.response.data)
                            console.error('Erro na requisição da b3. Status: ' + err.response.status)
                        } else {
                            res.status(400)
                            console.error(err.message)
                        }

                        process.exit(1)
                    }
                }

                if (data.length > 0) {

                    const formatedData = {
                        date: dateB3,
                        data: data
                    }
                    
                    //Aqui vai ser o calculo para incluir o preço médio

                    try {
                        const request = await Equities.update(cpf, formatedData);
                        if (request) {
                            res.status(200)
                            res.json(formatedData);
                        } else {
                            throw new Error('Falha ao atualizar as equities');
                        }
                    } catch (err) {
                        console.log(err)
                        res.status(502)
                        res.send('Ouve um erro inesperado!!!')
                    }

                } else {
                    res.status(204)
                    res.send('No content')
                }
            }
            updateEquities(cpf)
        }
        getSharesInfo(cpf);

    }

    async getCurrentStocks(req, res) {
        let tickerData
        try {
            const ticker = await axios.get(`${process.env.URLBRAPI}/available?token=${process.env.BRAPITOKEN}`)
            tickerData = ticker.data.stocks
        } catch (err) {
            console.log('Erro ao buscar os tickers')
            console.log(err)
        }
        let results = []


        for (let i = 0; i < tickerData.length; i++) {
            try {
                let stocks = await axios.get(`${process.env.URLBRAPI}/quote/${tickerData[i]}?token=${process.env.BRAPITOKEN}`);

                results = results.concat(stocks.data.results)
                console.log(i)
            } catch (err) {
                console.log(err)
            }
        }


        try {
            const request = await Equities.updateStocks(results);
            if (request) {

                res.status(200)
                res.send("Dados atualizados");
            } else {
                throw new Error('Falha ao atualizar as STOCKS');
            }
        } catch (err) {
            console.log(err)
            res.status(502)
            res.send('Ouve um erro inesperado ao atualizar as stocks!!!')
        }
    }

    async saveHistoryStocks(req, res) {
        const cpf = req.body.cpf

        let referenceStartDate = process.env.STARTDATEB3
        let referenceEndDate = "2021-05-20"

        const historyUrl = `${process.env.URLB3}/api/movement/v2/equities/investors/${cpf}`

        const accessToken = await authenticate()

        let data = [];

        let status = 200;

        try {
            for (let page = 1; status === 200; page++) {
                let step = await axios.get(historyUrl, {
                    httpsAgent,
                    params: {
                        referenceStartDate,
                        referenceEndDate,
                        page
                    },
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (!step) {
                    return
                }

                if (step.status && step.data) {
                    data = data.concat(step.data.data.equitiesPeriods.equitiesMovements);
                }

                status = step.status;

                console.log(page);
            }

            try {
                
                
                const request = await Equities.saveEquitiesHistory(cpf, data);

                if (request) {
                    res.status(200)
                    res.send("ok")
                }
                else {
                    res.status(502)
                    res.send('Ouve algum problema ao salvar o historico das ações!!!')
                }
            } catch (err) {
                console.log(err)
            }
        } catch (err) {
            if (err.response) {
                res.status(400)
                //console.error(err.response.data)
                console.error('Erro na requisição da b3. Status: ' + err.response.status)
            } else {
                res.status(400)
                console.error(err.message)
            }

            process.exit(1)
        }
    }

    async getBrapiStocks(req, res) {
        try {
            const request = await Equities.getBrapiStocks();
            if (request) {
                
                console.log(request)
                
                res.status(200)
                res.json(request);


            } else {
                throw new Error('Falha ao buscar dados da BRAPI');
            }
        } catch (err) {
            console.log(err)
            res.status(502)
            res.send('Ouve um erro inesperado ao buscar as ações da brapi!!!')
        }
    }
    

}
module.exports = new b3Controller();