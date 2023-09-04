<?php

class DataBase
{
    private object $db;

    /**
     * Подключается к БД.
     */
    public function __construct()
    {
        $db_name = 'YouDB';
        $db_host = 'YouHost';
        $db_user = 'YouName';
        $db_pass = 'YouPassword';
        try {
            $this->db = new PDO("mysql:host=$db_host;dbname=$db_name;",
                                $db_user, $db_pass);
        } catch (PDOException $e) {
            echo false;
        }
    }

    /**
     * Создаёт таблицы
     */
    public function createTable(): void
    {
        $sql = 'CREATE TABLE IF NOT EXISTS products
                (id MEDIUMINT UNSIGNED PRIMARY KEY AUTO_INCREMENT, 
                 product_name CHAR(100) NOT NULL UNIQUE,
                 available_quantity MEDIUMINT UNSIGNED NOT NULL, 
                 unit CHAR(5) NOT NULL, price MEDIUMINT UNSIGNED NOT NULL,
                 wholesale_price MEDIUMINT UNSIGNED NOT NULL,
                 wholesale_quantity MEDIUMINT UNSIGNED NOT NULL);

                 CREATE TABLE IF NOT EXISTS orders
                 (id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
                  quantity_positions TINYINT UNSIGNED NOT NULL,
                  sum FLOAT UNSIGNED NOT NULL,
                  order_date DATETIME NOT NULL);

                  CREATE TABLE IF NOT EXISTS products_order
                  (id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
                  order_id INT UNSIGNED NOT NULL, product_name CHAR(100) NOT NULL,
                  quantity FLOAT UNSIGNED NOT NULL,
                  price MEDIUMINT UNSIGNED NOT NULL,
                  discount MEDIUMINT UNSIGNED NOT NULL,
                  sum FLOAT UNSIGNED NOT NULL,
                  FOREIGN KEY (order_id)  REFERENCES orders (id));';
        try {
            $this->db->exec($sql);
        } catch (PDOException $e) {
            echo $e;
        }
    }

    /**
     * Получает товары из БД. Если имеется массив
     * с необходимыми полями, делает запрос с выборкой
     */
    public function getProducts(array $where = []): array|bool
    {
        try {
            if ($where)
            {
                $in = str_repeat('?,', count($where) - 1) . '?';
                $sql = "SELECT * FROM products WHERE product_name IN ($in)";
                $stm = $this->db->prepare($sql);
                $stm->execute($where);
                $products = $stm->fetchAll();
            } else {
                $sql = 'SELECT * FROM products';
                $products = $this->db->query($sql)->fetchAll();
            }
            return $products;
        } catch (PDOException) {
            return false;
        }
    }

    /**
     * Сохраняет новый заказ в БД.
     * Формирует строку из значений, добавляет её к
     * запросу и делает запрос.
     */
    public function saveOrder(array $order, float|int $final_sum): bool
    {
        $values = '';
        $order_date = date('Y-m-d H:i:s');
        $quantity_positions = count($order);
        $sql = "INSERT INTO orders (quantity_positions, sum, order_date)
                VALUES ($quantity_positions, $final_sum, '$order_date');";
        try {
            $this->db->exec($sql);
            $order_id = $this->db->lastInsertId();
        } catch (PDOException $e) {
            return false;
        }
        foreach ($order as $product) {
            $values .= "($order_id, '$product[product_name]', $product[quantity],  
                          $product[price], $product[discount], $product[sum]),";
        }
        $values = substr($values, 0, -1);
        $sql = "INSERT INTO products_order (order_id, product_name, 
                quantity, price, discount, sum) VALUES $values;";
        try {
            $this->db->exec($sql);
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }
}