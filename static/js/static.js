/**
 * Выводит сообщение по средствам смены класса,
 * меняет класс по таймеру, таким образом сообщение ичезает
 *
 * @param {string} id - id блока с сообщением
 * @param {string} message - текст сообщения
 * @returns {void}
 */
function outputMessage(id, message) {
    if ($(id).attr('class') != 'output-message') {
        $(id).html('<p>'+message+'</p>');
        $(id).attr('class', 'output-message')
        setTimeout(() => $(id).attr('class', 'disappearing-message'),
            5000);
    }
}

/**
 * При проблемах с сервером, выводит сообщение с ошибкой(через другую функцию)
 *
 * @returns {void}
 */
function outputErrorServer() {
    var message = 'Ошибка сервера, попробуйте позже',
        id = '#message-error';
    $('select').attr('disabled', true);
    outputMessage(id, message);
}

/**
 * Берёт у кнопки удаления атрибут имени, который равен
 * id поля и удаляет поле по этому значению.
 * Если полей больше нет, деактивирует кнопку оформления заказа
 *
 * @returns {void}
 */
function deleteLine() {
    var lineId = $(this).attr('name');
    $('#'+lineId+'').remove();
    if (!$('td').length){
        $('#place-order').attr('disabled', true);
    }
}

/**
 * Если заказ оформлен, выводит в зелёном стиле сообщение
 * об удачном сохранении(через другую функцию),
 * иначе выводит сообщение с ошибкой(через другую функцию)
 *
 * @param {string} data - сообщение итога сохранения заказа
 * @returns {void}
 */
function outputResultSaveOrder(data) {
    if (data == 'Заказ оформлен') {
        $('#place-order').attr('disabled', true);
        $('tbody').html('');
        var id = '#message-save-order';
        outputMessage(id, data);
    }
    else {
        var id = '#message-error';
        outputMessage(id, data);
    }
}

/**
 * Получает список имён товаров и список их кол-ва,
 * делает AJAX-запрос к серверу, для сохранения заказа.
 *
 * @returns {void}
 */
function saveOrder() {
    var names = [],
        counts = [];

    $('tr').find('[name="name"]').each(function() {
                 names.push($(this).text());});
    $('tr').find('[name="count"]').each(function() {
                 counts.push($(this).text());});
    $.ajax({
        url: window.location.origin+'/save_order.php',
        method: 'post',
        data: {names: names, counts: counts},
        success: outputResultSaveOrder,
        error: outputErrorServer
    });
}

/**
 * Получает значение из поля ввода кол-ва,
 * получает розничную цену, если кол-во больше или равно
 * кол-ву оптовой закупки, обновляет цена по опту.
 * Добавляет новое поле в таблицу.
 *
 * @param {array} data - хранит информацию о товарах
 * @param {number} val - id нового поля
 * @returns {void}
 */
function addLine(val, data) {
    var count = Number($('#count').val()),
        price = Number(data['price']),
        name = data['product_name'];
    if (count >= Number(data['wholesale_quantity'])) {
        price = Number(data['wholesale_price']);
    }

    var html =
        `<tr id="`+val+`">
               <td name="name">`+name+`</td>
               <td name="count">`+count+`</td>
               <td name="unit">`+data['unit']+`</td>
               <td name="price">`+price+`</td>
               <td name="sum">`+Number((price * count).toFixed(2))+`</td>
               <td>
                 <button name="`+val+`" class="delete">X</button>
               </td>
            </tr>`;
    $('tbody').append(html);
}

/**
 * Получает старое значение из поля, суммирует.
 * Проверяет привысило ли значение оптовую закупку,
 * если привысило, выставляет оптовую цену.
 * Обновляет поле.
 *
 * @param {array} data - хранит информацию о товарах
 * @param {number} val - id поля с таким же товаром
 * @returns {void}
 */
function updateLine(val, data) {
    var count = Number($('#count').val()),
        price = Number(data['price']),
        old_count = Number($('#' + val +
                                      ' td[name="count"]').text()),
        sum_count = Number((count + old_count).toFixed(3));
    if (sum_count >= Number(data['wholesale_quantity'])) {
        price = Number(data['wholesale_price']);
        $('#' + val + ' td[name="price"]').text(price);
    }
    $('#' + val + ' td[name="count"]').text(sum_count);
    $('#' + val + ' td[name="sum"]').text(Number((price * sum_count).toFixed(2)));
}

/**
 * Добавляет(обнавляет) поле в таблице.
 * Ищет по id такое же поле, если находит,
 * запускает функцию обновления, иначе добавления.
 * Очищает поле ввода кол-ва, деактивирует кнопку
 * добавления товара, активирует кнопку оформления заказа.
 *
 * @param {array} data - хранит информацию о товарах
 * @returns {void}
 */
function setDataTable(data) {
    var val = Number($('select').val()),
        data = data[val],
        old_element = $('#'+val+'');
    if (old_element.length) {
        updateLine(val, data);
    }
    else {
        addLine(val, data);
    }
    $('#count').val('');
    $('#set-product').attr('disabled', true);
    $('#place-order').removeAttr('disabled');
}

/**
 * Удаляет последний символ в поле ввода и запускает
 * повторную проверку на валидацию
 *
 * @param {array} data - хранит информацию о товарах
 * @returns {void}
 */
function deleteLastChar(data) {
    $('#count').val($('#count').val().slice(0, -1));
    validateCount(data);
}

/**
 * Валидирует поле ввода кол-ва товара.
 * Приводит значение поля к числу, если получилось,
 * проверяет дробную часть, если пользователь пытается
 * ввести больше 3 цифр, вызывает функцию удаления последнего символа, после
 * складывает общее кол-во в поле с кол-вом товара в таблице и
 * проверяет с допустимым максимальным значением. При переполнении
 * вызывает функцию удаления последнего символа и выводит сообщение.
 * Проверяет число на отсутвие чисел после плавающей точки, наличие самой
 * точки и если ед. измерения в штуках,
 * вызывает функцию удаления последнего символа.
 *
 * Если значение поля ввода не получилось преобразовать к числу,
 * поле проверяется на присутсвие символов и запускает функцию
 * удаления последнего символа.
 *
 * @param {array} data - хранит информацию о товарах
 * @returns {void}
 */
function validateCount(data) {
    var val_count_str = $('#count').val(),
        val_count = Number(val_count_str);
    if (val_count) {
        var parts_number = val_count_str.split('.');
        if (parts_number.length == 2 && parts_number[1].length > 3) {
            val_count = Number(val_count.toFixed(3));
            deleteLastChar(data);
        }

        var val_select = $('select').val(),
            data = data[Number(val_select)],
            available_quantity = Number(data['available_quantity']),
            table_count = Number($('#' + val_select +
                ' td[name="count"]').text()),
            unit = data['unit'],
            sum_count = val_count + table_count;
        if (sum_count > available_quantity) {
            var message = 'Вводимое количество больше допустимого',
                id = '#message-error';
            outputMessage(id, message);
            deleteLastChar(data);
        }
        if (unit == 'шт' &
            (!Number.isInteger(val_count) | val_count_str[val_count_str.length - 1] == '.')) {
            deleteLastChar(data);
        }
    }
    else if($('#count').val()) {
        deleteLastChar(data);
    }
}

/**
 * Проверяет поле ввода кол-ва товара.
 * Запускает функцию валидации, при наличии значения в поле
 * активирует кнопку добавления товара, иначе деактивирует.
 *
 * @param {array} data - хранит информацию о товарах
 * @returns {void}
 */
function checkValCount(data) {
    validateCount(data);
    if ($('#count').val()) {
        $('#set-product').removeAttr('disabled');
    } else {
        $('#set-product').attr('disabled', true);
    }
}

/**
 * Проверяет выбранное значение в "select".
 * Если значение "не пустое", активирует поле ввода кол-ва,
 * выводит в поле ввода подсказку с ед. измерения и очищает от
 * прошлого значения, меняет стили,
 * иначе деактивирует поле ввода кол-ва и кнопку добавления товара,
 * меняет стили.
 *
 * @param {array} data - хранит информацию о товарах
 * @returns {void}
 */
function checkValSelect(data) {
    var val = $('select').val();
    if (val) {
        data = data[Number(val)];
        var info = data['unit'];
        $('article').removeAttr('class');
        $('article').attr('class', 'active');

        $('#count').removeAttr('disabled');
        $('#count').attr('placeholder', info);
        $('#count').val('');

        $('#price').text('Цена: '+data['price']+'p');
        $('#wholesale-price').text('Цена оптом: '+
            data['wholesale_price']+'p')
    }
    else {
        $('article').removeAttr('class');
        $('article').attr('class', 'deactivate');

        $('#count').attr('disabled', true);
        $('#count').removeAttr('placeholder');
        $('#count').val('');

        $('#set-product').attr('disabled', true);
    }
}

/**
 * Создаёт элементы "option" в элемете "select" с названиями товаров.
 * Если товаров нет, выводит сообщение.
 *
 * @param {array} data - хранит информацию о товарах
 * @returns {void}
 */
function putDataSelect(data) {
    if (data.length) {
        for (var i = 0; i < data.length; i++) {
            $('select').append('<option value=' + i + '>'
                + data[i]['product_name'] +
                '</option>');
        }
    } else {
        var message = 'Пока что товары отсутсвуют',
            id = '#message-error';
        $('select').attr('disabled', true);
        outputMessage(id, message);
    }
}

/**
 * Главная функция
 *
 * @returns {void}
 */
function main(data) {
    putDataSelect(data);
    $('select').on('change', function () {checkValSelect(data)});
    $('#count').on('input', function () {checkValCount(data)});
    $('#set-product').on('click', function () {setDataTable(data)});
    $('#place-order').on('click', saveOrder);
    $(document).on('click', '.delete', deleteLine);
}

// делает AJAX-запрос к серверу с получением данных о товарах
$.ajax({
    url: window.location.origin+'/get_products.php',
    dataType: 'json',
    success: main,
    error: outputErrorServer
    });
