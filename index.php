<!DOCTYPE html>
<html lang="ru-RU">
  <head>
      <title>Составление заказа</title>
      <link rel="stylesheet" href="/static/css/static.css">
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <main>
      <label for="products">Выберите товар:</label>
      <select id="products">
        <option></option>
      </select>
      <label for="count">Введите количество:</label>
      <input type="input" id="count" min="1" disabled>
      <button id="set-product"  disabled>Добавить товар</button>
      <button id="place-order"  disabled>Оформить заказ</button>
      <div id="message-error"></div>
      <hr>
      <table>
        <thead>
          <tr>
            <th>Товар</th>
            <th>Количество</th>
            <th>Ед. измерения</th>
            <th>Цена</th>
            <th> Сумма</th>
            <th></th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
      <div id="message-save-order"><p>Заказ оформлен</p></div>
      <article>
        <p id="price">Цена:</p>
        <p id="wholesale-price">Цена оптом:</p>
      </article>
    </main>
    <footer>
      © <?= date('Y')?> Copyright Vladislav<span style="color: red;">Yar</span>
    </footer>
    <script src="/static/js/jquery-3.6.4.min.js"></script>
    <script src="/static/js/static.js"></script>
  </body>
</html>
