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

// Ограничивает частоту вызова функции
function throttle(callback, delayBetweenFrames = 1000) {
  let timeoutId, lastCallTime;

  return (...rest) => {
    const elapsedTime = Date.now() - lastCallTime;
    const delay = Math.max(delayBetweenFrames - elapsedTime, 0);

    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(...rest);
      lastCallTime = Date.now();
    }, delay);
  };
};

// Получает данные
async function fetchData(url) {
  try {
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    throw new Error('Произошла ошибка, повторите попытку позже');
  }
}

// Создаёт список валют
function renderOptionsList(options, element) {
  const fragment = document.createDocumentFragment();

  options.forEach((currency) => {
    createOption(currency, fragment);
  });

  element.innerHTML = '';
  element.appendChild(fragment);
}

// Отрисовывает список валют
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

// Выполняет конвертацию валют
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

// Показывает выпадающий список
function showSelect(select) {
  select.classList.add('select--shown');
  select.classList.remove('select--hide');
}

// Скрывает выпадающий список
function hideSelect(select) {
  select.classList.remove('select--shown');
  select.classList.add('select--hide');
}

// Переключает видимость выпадающего списка
function toggleSelect(select) {
  select.classList.toggle('select--hide');
  select.classList.toggle('select--shown');
}

// Создаёт элемент валюты
function createOption(currency, element) {
  const option = document.createElement('li');

  option.classList.add('select__option');
  option.tabIndex = '0';
  option.textContent = `${currency.flag} ${currency.code} - ${currency.name}`;
  option.dataset.value = currency.code;
  element.appendChild(option);
};

// Устанавливает обработчики событий для выпадающего списка
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

// Отмечает элемент в выпадающем списке как выбранный
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

// Устанавливает обработчики событий для элементов выпадающего списка
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

// Устанавливает значение выпадающего списка по значению в поле ввода
function setOptionValue(field, select) {
  const container = select.children[1];

  field.addEventListener('input', throttle(() => {
    showSelect(select);

    for (let option of container.children) {
      if (option.textContent.toLowerCase().includes(field.value.toLowerCase())) {
        container.insertBefore(option, container.firstChild);
      }
    }

    if (!field.value) {
      sortSelect(select);
    }

    container.scrollTop = 0;
  }, 1000));
}

// Сортирует валюты по коду
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

// Скрывает выпадающие списки
function onDocumentClick(event) {
  const isFromCurrency = fromCurrency.contains(event.target);
  const isToCurrency = toCurrency.contains(event.target);
  const isSelectFrom = selectFrom.contains(event.target);
  const isSelectTo = selectTo.contains(event.target);

  if (!isFromCurrency && !isToCurrency && !isSelectFrom && !isSelectTo) {
    hideSelect(selectFrom);
    hideSelect(selectTo);
  }
}

// Выполняет конвертацию / скрывает выпадающие списки
function onDocumentKeydown(event) {
  if (event.key && event.target === amount && event.key.startsWith('Ent')) {
    convertCurrency();
  }

  if (event.key && event.key.startsWith('Esc')) {
    hideSelect(selectFrom);
    hideSelect(selectTo);
  }
}

renderOptions();

setSelectState(selectFrom);

setSelectState(selectTo);

setOptionValue(fieldValueFrom, selectFrom);

setOptionValue(fieldValueTo, selectTo);

document.addEventListener('click', onDocumentClick);

document.addEventListener('keydown', onDocumentKeydown);

button.addEventListener('click', () => {
  convertCurrency();
})
