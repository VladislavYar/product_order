<?php

include_once ('database/DataBase.php');

// Создаёт объек БД, делает запрос на получение товаров и выводи в виде JSON
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $products = new DataBase();
    $products = $products->getProducts();
    echo json_encode($products);
}
