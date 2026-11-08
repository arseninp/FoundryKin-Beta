# Передача — OLDCHAT26, OLDCHAT27 и исправления CI

Обновлено 2026-11-08. Начать с CONTEXT. Последний подтверждённый тестами SHA до текущей адресной правки: e07f9718fcd66c843d7e32d0a0c46906a9399584. Не выпуск. Полные модельные контракты ARCHITECTURE/3e503a8 и старый handoff на e07f971 сохраняются; ниже текущий статус вместо прежних 1177 и неподтверждённого bed.

## Подключения

Bed уже подключён: один настоящий source ID → 16 цветных записей; alias bed → red_bed, light_gray → silver. Base preview-config содержит 638 ID, включая bed/17 свечей/18 cake source IDs. Candles имеют lit; cake целый, candle-cake IDs aliases cake. Ранее сохранённые copper/indexed/sign/joinery/extra и механизмы не повторять.

Последний пакет OLDCHAT27: 73ca673, 22 ID в REMAINING_REVIEW_BLOCKS, включены в общую сборку REVIEW_IDS/TEXT. Полный сохранённый diff прочитан. Уплотнение таблиц/reviewRows не доказательство удаления моделей. Заявление 1275 source IDs ещё не означает полную приёмку ресурсов, состояний и карточек. Coverage 1277 включает два auxiliary источника; не смешивать с 1275.

## CI: факт, не обещание

73ca673: 694 tests, 8 fail; preview не дошёл до геометрии из-за сравнения с bed expansion. fa9800b/fd6b777/650da80/95c9777/d3a21c3 исправили VM test loader, mock normals, устаревшие metal/crafter ожидания, смещения групп и сравнение source/expanded IDs.

d3a21c3: validate 694/694, preview упал на down. e07f971 исправил grass_path: down=dirt по имени, coarse_dirt/варианты сохранены, добавлены три проверки в существующий файл. Новый присланный запуск e07f971: validate 697/697, fail 0/skipped 0; preview всё ещё красный, теперь Explicit face variant required: north. Полного успешного geometry sweep нет.

Текущая правка: mycelium получает именованные fixed bindings в существующем utility-parts: up mycelium_top/down dirt/side mycelium_side, indexed count 2. Snow-side ресурс сохраняется; переключатель снежного состояния не заявлен реализованным. Статически подтверждён конкретный дефект, но лог не называет ID. После правки результатов CI/новых тестов нет.

## Решение владельца и следующий шаг

Владелец попросил после этой правки сразу перейти к документам без дополнительных тестов/ручных прогонов. Не отключать автоматический workflow и не объявлять зелёный preview. Сначала обновить оставшиеся пять документов ARCHITECTURE, TODO, ROADMAP, README, review-principles по текущему CONTEXT; это ещё не выполнено данным пакетом.

При дальнейшем техническом продолжении — полный preview/ресурсная проверка с диагностикой source ID/model/face, затем конкретная editor integration/приёмка/чистка. Не повторять готовую геометрию и не подменять ошибку первым элементом текстур. PNG-TGA/WebGL/UV/Android, draw/history/reopen/export и runtime switch не приняты.

Только main, <25000 UTF-8 bytes/file. Каждая запись с точным подтверждением и проверкой saved diff. Владелец может не видеть отдельного prompt: понятную просьбу о подтверждении вынести в конец сообщения. После подтверждения продолжать подготовку без искусственных пауз. Новые permanent tests отдельно согласовать, сейчас новые тесты не добавлять. Packs/localStorage/backup/refactor-0.9 не трогать. Остальная сохранность и scope — CONTEXT/ARCHITECTURE.
