// Portfolio Management
class Portfolio {
	constructor() {
		this._positions = {};
	}

	// Getter
	get positions() {
		return this._positions;
	}

	// Method
	addPosition(currency) {
		const existingPosition = this._positions[currency.code];
		if (existingPosition) {
			existingPosition.amount += 1;
		} else {
			this._positions[currency.code] = { currency: currency, amount: 1 };
		}
        return this;
	}

	deletePosition(key) {
		delete this._positions[key];
		return this;
	}
}

// Portfolio Management
class Converter {
	constructor(exchangeRate) {
		this._exchangeRate = exchangeRate;
	}

	// Getter / Setter
	get exchangeRate() {
		return this._exchangeRate;
	}

	set exchangeRate(exchangeRate) {
		this._exchangeRate = exchangeRate;
	}

	// Method
	convert(crypto) {
		return crypto.valeurEUR * this._exchangeRate.rate;
	}
}

class Currency {
	//{"code":"BTC","nom":"Bitcoin","valeurEUR":"17724.080"}
	constructor(code, nom, valeurEUR) {
		this._code = code;
		this._nom = nom;
		this._valeurEUR = valeurEUR;
	}

	// Getter / Setter
	get code() {
		return this._code;
	}

	set code(code) {
		this._code = code;
	}

	get nom() {
		return this._nom;
	}

	set nom(nom) {
		this._nom = nom;
	}

	get valeurEUR() {
		return this._valeurEUR;
	}

	set valeurEUR(valeurEUR) {
		this._valeurEUR = valeurEUR;
	}

	// Methods
	toString() {
		return this._code + " - " + this._nom + " - " + this._valeurEUR;
	}
}

class ExchangeRate {
	//{"CHF":"1.151","USD":"1.124","YEN":"163.520","BRL":"6.509","GPB":"1.014"}
	constructor(currencyCode, rate) {
		this._currencyCode = currencyCode;
		this._rate = rate;
	}

	get currencyCode() {
		return this._currencyCode;
	}

	set currencyCode(x) {
		this._currencyCode = x;
	}

	get rate() {
		return this._rate;
	}

	set rate(x) {
		this._rate = x;
	}
}

async function fetchCryptoCurrenciesList() {
	const endpoint_currencies = "https://gabana.ch/cc/cryptos";

	// Fetch the Crypto List
	try {
		const res = await axios.get(endpoint_currencies);
		console.log(res);
		return res;
	} catch (error) {
		console.error(error);
	}
}

function deserializeCurrenciesList(data) {
	let cryptosCurrencies = {};
	for (const key in data) {
		if (Object.hasOwnProperty.call(data, key)) {
			const value = data[key];
			// Deserialize it into exchange Rates Object
			const currency = new Currency(
				value["code"],
				value["nom"],
				value["valeurEUR"]
			);
			cryptosCurrencies[value["code"]] = currency;
		}
	}

	return cryptosCurrencies;
}

async function fetchExchangeRates() {
	const endpoint_exchange_rate = "https://gabana.ch/cc/taux";
	// Fetch the Exchanges Rates
	try {
		const res = await axios.get(endpoint_exchange_rate);
		console.log(res);
		return res;
	} catch (error) {
		console.error(error);
		return null;
	}
}

function deserializeExchangeRates(data) {
	let exchangeRates = {};
	for (const key in data) {
		if (Object.hasOwnProperty.call(data, key)) {
			const value = data[key];
			// Deserialize it into exchange Rates Object
			const exchangeRate = new ExchangeRate(key, value);
			exchangeRates[key] = exchangeRate;
		}
	}

	exchangeRates["EUR"] = new ExchangeRate("EUR", 1.0);
	return exchangeRates;
}

const loadData = async (_) => {
	try {
		const p1 = fetchCryptoCurrenciesList();
		const p2 = fetchExchangeRates();

		const [currRes, exRateRes] = await Promise.all([p1, p2]);

		const currencies = deserializeCurrenciesList(currRes.data);
		const exchangeRates = deserializeExchangeRates(exRateRes.data);

		return [currencies, exchangeRates];
	} catch (error) {
		console.error(error);
	}
};

const lstCurrencies = document.getElementById("lstCurrencies");
const cboRates = document.getElementById("cboRates");
const lstPortfolio = document.getElementById("lstPortfolio");
const userPorfolio = new Portfolio();

async function displayAvailableCurrenciesWithExchangeRates() {
	const [currencies, exchangeRates] = await loadData();
	const convertor = new Converter(exchangeRates[cboRates.value]);
	loadCurrenciesToDOMList(currencies, convertor, lstCurrencies);
}

function displayPortfolio(portfolio, domlist) {
    let positions = portfolio.positions;
    for (const key of Object.keys(positions)) {
        let pos = positions[key];
        const li = document.createElement("li");
			li.id = key;
			li.textContent = `${pos.amount} ${key} ${pos.amount * pos.currency.valeurEUR}`;
			li.addEventListener("click", () =>{
                lstPortfolio.innerHTML = "";
				displayPortfolio(userPorfolio.deletePosition(key), lstPortfolio);
            });
			domlist.appendChild(li);
        console.log();
    }
}

function loadCurrenciesToDOMList(currencies, convertor, domlist) {
	for (const key in currencies) {
		if (Object.hasOwnProperty.call(currencies, key)) {
			const li = document.createElement("li");
			li.id = key;
			li.textContent = `${currencies[key].toString()} - (${convertor.convert(
				currencies[key]
			)})`;
			li.addEventListener("click", () =>{
                lstPortfolio.innerHTML = "";
				displayPortfolio(userPorfolio.addPosition(currencies[key]), lstPortfolio);
            });
			domlist.appendChild(li);
		}
	}
}

displayAvailableCurrenciesWithExchangeRates();

cboRates.addEventListener("change", () => {
	lstCurrencies.innerHTML = "";
	displayAvailableCurrenciesWithExchangeRates();
});

