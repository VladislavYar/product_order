<?php

include_once ('database/DataBase.php');

/**
 * Валидирует поля POST-запроса.
 */
function validatePost(): string
{
    if (!$_POST['names'] | !$_POST['counts']) {
        return 'Нет товаров или их кол-ва';
    } elseif (count($_POST['names']) != count($_POST['counts'])) {
        return 'Не совпадает длина массива товаров и длинна массива их кол-ва';
    }

    foreach (array_count_values($_POST['names'])
             as $count_coincidences) {
        if ($count_coincidences > 1) {
            return 'Присутсвуют повторяющиеся товары';
        }
    }

    foreach ($_POST['counts'] as $count) {
        if (!is_numeric($count)){
            return 'Кол-во не является числом';
        }
        elseif ($count <= 0) {
            return 'Кол-во равно или меньше нуля';
        }
    }
    return '';
}

/**
 * Формирует данные заказа для сохранения в БД.
 * Получает данные о товарах в БД.
 * Запускает цикл, кол-вом итераций с кол-вом имён.
 * Внутри цикла запускает цикл с проходом по продуктам из БД.
 * Проверяет совпадение имён товара в БД и
 * имён из запроса, при совпадении, проверяет кол-ва товара
 * из запроса и сравнивается с допустимым.
 * Проверяется больше или равно кол-во товара оптовому кол-ву,
 * если да, то цена меняется на оптовую.
 * Формируется массив с данными о заказе товара и добавляется
 * в массив с общим заказом.
 */
function formingDataSave($db): array {
    $products = $db->getProducts($_POST['names']);
    $order = [];
    $final_sum = 0;
    for ($i = 0; $i < count($_POST['names']); $i++) {
        foreach ($products as $product) {
            if ($product['product_name'] == $_POST['names'][$i]) {

                if ($_POST['counts'][$i] > $product['available_quantity']) {
                    echo 'Кол-во в заказе больше кол-ва в наличии';
                    return [];
                }

                $count = explode('.', $_POST['counts'][$i]);
                if (count($count) == 2 && strlen($count[1]) > 3) {
                    echo 'Дробная часть состоит более чем из трех цифр';
                    return [];
                }

                $price = $product['price'];
                if ($_POST['counts'][$i] >= $product['wholesale_quantity']) {
                    $price = $product['wholesale_price'];
                }
                $discount = 0;
                $sum = $_POST['counts'][$i] * $price - $discount;
                $final_sum += $sum;
                $order[] = ['product_name' => $_POST['names'][$i], 'price' => $price,
                            'discount' => $discount, 'quantity' => $_POST['counts'][$i],
                            'sum' => $sum];
            }
        }
    }
    return [$order, $final_sum];
}

/**
 * Запускает функцию валидации POST-данных, если вернулось сообщение, выводит его.
 * Иначе создаёт объект БД, запускает функцию формирования данных,
 * если вернулся массив данных для сохранения заказа, запускает метод объекта БД
 * с сохранением заказа.
 */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    if ($result_validate = validatePost()) {
        echo $result_validate;
    } else {
        $db = new DataBase();
        if($order_and_sum = formingDataSave($db)) {
            if ($db->saveOrder(...$order_and_sum)) {
                echo 'Заказ оформлен';
            } else {
                echo 'Ошибка при оформлении';
            }
        }
    }
}