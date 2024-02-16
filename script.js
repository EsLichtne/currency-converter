const API_KEY = '0fe8718ffa0095832e20cc9e';
const BASE_URL = 'https://v6.exchangerate-api.com/v6';
const DATA_URL = 'https://restcountries.com/v3.1/all?fields=name,currencies,flag';

const amount = document.querySelector('.currency-converter__amount'); // поле для ввода значения
const fieldValueFrom = document.querySelector('#field-value-from'); // поле для валюты, из которой переводим
const fieldValueTo = document.querySelector('#field-value-to'); // поле для валюты, в которую переводим
const selectFrom = document.querySelector('.select--from'); // селект для валют, из которых переводим
const selectTo = document.querySelector('.select--to'); // селект для валют, в которые переводим
const fromCurrency = selectFrom.querySelector('#from-currency'); // список валют, из которых переводим
const toCurrency = selectTo.querySelector('#to-currency'); // список валют, в которые переводим
const button = document.querySelector('.currency-converter__button');
const resultText = document.querySelector('.currency-converter__result');
const errorText = document.querySelector('.currency-converter__error');
