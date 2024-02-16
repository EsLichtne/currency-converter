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

async function renderOptions() {
  try {
    const data = await fetchData(DATA_URL);

    const result = data
      .filter((country) => Object.keys(country.currencies).length > 0)
      .map((country) => ({
        name: Object.values(country.currencies)[0].name,
        code: Object.keys(country.currencies)[0],
        flag: country.flag,
      }))
      .sort((a, b) => a.code.localeCompare(b.code));

    fromCurrency.innerHTML = '';
    toCurrency.innerHTML = '';

    renderOptionsList(result, fromCurrency);
    renderOptionsList(result, toCurrency);

    setSelectOption(selectFrom, fieldValueFrom);
    setSelectOption(selectTo, fieldValueTo);

  } catch (error) {
    errorText.textContent = 'Произошла ошибка, повторите попытку позже';
  }
}

async function convertCurrency() {
  const fromCurrencyCode = selectFrom.dataset.value;
  const toCurrencyCode = selectTo.dataset.value;
  const amountValue = amount.value;
  const fieldValueFromValue = fieldValueFrom.value;
  const fieldValueToValue = fieldValueTo.value;

  try {
    if (amountValue && parseFloat(amountValue) > 0 && fieldValueFromValue && fieldValueToValue) {
      button.disabled = true;
      button.innerHTML = `<span class='loader'></span>`;
      const url = `${BASE_URL}/${API_KEY}/pair/${fromCurrencyCode}/${toCurrencyCode}`;
      const data = await fetchData(url);
      const conversionResult = (amountValue * data.conversion_rate).toFixed(2);

      resultText.innerHTML = `${amountValue} ${fromCurrencyCode} = ${conversionResult} ${toCurrencyCode}`;
      amount.value = '';
      errorText.innerHTML = '';
    } else {
      errorText.textContent = 'Введите значение';

      !amountValue ? amount.focus() :
        !fieldValueFromValue ? fieldValueFrom.focus() :
          !fieldValueToValue && fieldValueTo.focus();
    }
  } catch (error) {
    errorText.textContent = 'Произошла ошибка, повторите попытку позже';
  } finally {
    button.disabled = false;
    button.textContent = 'Конвертировать';
  }
}

function showSelect(select) {
  select.classList.add('select--shown');
  select.classList.remove('select--hide');
}

function hideSelect(select) {
  select.classList.remove('select--shown');
  select.classList.add('select--hide');
}

function toggleSelect(select) {
  select.classList.toggle('select--hide');
  select.classList.toggle('select--shown');
}

function createOption(currency, element) {
  const option = document.createElement('li');

  option.classList.add('select__option');
  option.tabIndex = '0';
  option.textContent = `${currency.flag} ${currency.code} - ${currency.name}`;
  option.dataset.value = currency.code;
  element.appendChild(option);
};

function setSelectState(select) {
  select.addEventListener('click', (event) => {
    if (event.target === select) {
      toggleSelect(select);
    }
  })

  select.addEventListener('keydown', (event) => {
    if (event.key && event.key.startsWith('Ent')) {
      toggleSelect(select);
    }
  })
}

function selectOption(select, field, option) {
  const container = select.children[1];

  for (let previousOption of container.children) {
    previousOption.classList.remove('select__option--selected');
    previousOption.removeAttribute('aria-selected');
  }

  select.dataset.value = option.dataset.value;
  field.value = option.textContent;
  option.classList.add('select__option--selected');
  option.setAttribute('aria-selected', true);
}

function setSelectOption(select, field) {
  const container = select.children[1];

  for (let option of container.children) {
    option.addEventListener('click', () => {
      selectOption(select, field, option);
      hideSelect(select);
    });
    option.addEventListener('keydown', (event) => {
      if (event.key && event.key.startsWith('Ent')) {
        selectOption(select, field, option);
      }
    })
  }
}

function sortSelect(select) {
  const container = select.children[1];
  const fragment = document.createDocumentFragment();
  const options = Array.from(container.children);

  options.sort((a, b) => a.dataset.value.localeCompare(b.dataset.value));

  for (let option of options) {
    fragment.appendChild(option);
  }

  container.appendChild(fragment);
}
