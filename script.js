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

async function fetchData(url) {
  try {
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    throw new Error('Произошла ошибка, повторите попытку позже');
  }
}

function renderOptionsList(options, element) {
  const fragment = document.createDocumentFragment();

  options.forEach((currency) => {
    createOption(currency, fragment);
  });

  element.innerHTML = '';
  element.appendChild(fragment);
}

function showSelect(select) {
  select.classList.add('select--shown');
  select.classList.remove('select--hide');
}
