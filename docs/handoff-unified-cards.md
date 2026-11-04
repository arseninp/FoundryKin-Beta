# Передача: карточки, подключение моделей и удаление лишнего facing

Обновлено 2026-11-04. Проверенный HEAD до документации: f77e3c5ea585b28837697d4f4d4416f01fa0f6a5, main. Читать после CONTEXT. Предыдущая подробная передача — 3fe2d82, старые этапы — d41f384/40c82f0/aae3661.

## Где остановились

Конкретная чистка лишних направлений сундуков/шалкеров завершена в 4d99f7b/c2b7384/6ccafe6: удалены чтение facing/таблицы/whole-block transforms из builders, defaults/checks из resolver, поле из меню сундука, его тестовые циклы/ожидания и две подписи. Не только спрятана кнопка. Вращение жестом и относительные движения крышек сохранены, как и UV/размеры/sheets/double. Это не завершение всего рефакторинга/приёмки.

Владелец требует не возвращать лишние повороты в меню под словами направление/положение крышки. Сундук: open/double; ender без double. Шалкер: open. Stem direction/грань нароста/UV стороны — другие обязанности; не удалять их вслепую. Макет отложен на другой чат.

Подключение существующих шалкеров к preview/common picker завершено: e4db3d6 — только open schema, 196fc69 — 17 раздельных source IDs, EN/RU, подписи крышки и независимая PNG. Геометрия/источники/resolver не переделывались. SHULKER_BOXES в preview.mjs, light_gray→silver sheet, без отдельной silver card. 44f7d6e facing-нормализация отменена; отклонённый черновик с направлением не возвращать. Новый сохранённый вариант направления НЕ содержит.

## Что подключено

Срез сейчас 61 source ID, не число cards/весь каталог: прежние 29 + 4 liquids + 11 chest sources + 17 shulkers. Вода/лава level 0..7/default 0 и сундуки уже подключены. Chest/trapped/ender + 4 unwaxed/4 waxed copper stages сохранены; waxed ID открывает canonical ordinary object при сохранении source record/resources. Четыре golem IDs среза невощёные, не приёмка всех waxed routes.

Готовые головы/черепа skeleton/wither_skeleton/creeper/zombie/piglin/dragon и 4 стадии статуи/4 позы уже в parent cards. Eyeblossom одна card closed/open/cross-emissive_cross/glow. Общие FKModelState/FKM/CSS и preview-controls.mjs, реальные source records/familyDefaults, independent form/slot/state. Source IDs/reopen/resources не терять, sheets без копий/обрезки.

Dragon: textures/entity/dragon/dragon 256x256, 6 head cubes+jaw/mirror UV/static closed jaw через skull; без полного тела/новой PNG. Полные mobs отложены, не недоделка голов. Недоступный Mob не показывать готовым; статуе не добавлять автоматически глаза/цветок, oxidation отдельно.

Pot: 23 узора+ordinary/4 стороны/common picker, корпус/UV сохранены. Conduit: 6 resources/default inactive/static active reference/eye-wind picker, без animation/eye tracking. Liquids: ровный уровень, не simulator/tint/timing. Всё это записанный код, не Bedrock appearance acceptance.

## Доказательства и границы

e255fc2 дополнил existing model-library.test.mjs двумя shulker tests: source/geometry fixture и pinned compile → resolver → picker → builder. Локально прошёл fixture на существующих sources/builder/painter и Three-mock для 17 цветов; тест ловит намеренные ошибки lid lift/whole-block turn/silver mapping. Новый pinned integration только записан, успешного выполнения не подтверждено. Ранее прошли syntax/272 изолированных state-PNG checks с compiler stub; не pinned compile. Workflow pot/conduit/liquids/chest не менялся и не доказывает успешный Actions. Это не реальные PNG-TGA/WebGL/Android/export; числа не суммировать.

f77e3c5 исправил только устаревшие model-policy tests: 24 copper variants, 3 обычных chest IDs и 4 unknown; production policy не менялась. Локальный полный прогон этого файла: до 7 pass/2 fail, после 9 pass/0 fail, плюс проверки чувствительности к cube-регрессиям. Все записи проверены по полному saved diff и ожидаемым blob SHA. Опечатка record.paths была только в старом отклонённом черновике; plan.paths в main сохранено.

Дальше — подтвердить результат pinned integration и existing coverage/inputValidation/full compile, затем выбрать следующий согласованный кодовый участок. Не повторять подключение шалкеров и не считать mocks приёмкой приложения.

Предварительный bell/player_head/bubble_column остаток — архивная сверка, не свежий coverage/новый scope. Исторические проблемы OLDCHAT17 — гипотезы; excluded reply OLDCHAT19 не источник задач. Только main/точное подтверждение/saved diff, <25000 bytes/file, новые test files отдельно согласовать, backup/fk070_packs не трогать. Остальные контракты — CONTEXT/ARCHITECTURE/review-principles.
