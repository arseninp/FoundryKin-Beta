# Передача: карточки, подключение моделей и удаление лишнего facing

Обновлено 2026-11-04. Проверенный HEAD до документации: 6ccafe6d7b9e8d277fd513e70bca3a8d5d1b5105, main. Читать после CONTEXT. Предыдущая подробная передача — 3fe2d82, старые этапы — d41f384/40c82f0/aae3661.

## Где остановились

Конкретная чистка лишних направлений сундуков/шалкеров завершена в 4d99f7b/c2b7384/6ccafe6: удалены чтение facing/таблицы/whole-block transforms из builders, defaults/checks из resolver, поле из меню сундука, его тестовые циклы/ожидания и две подписи. Не только спрятана кнопка. Вращение жестом и относительные движения крышек сохранены, как и UV/размеры/sheets/double. Это не завершение всего рефакторинга/приёмки.

Владелец требует не возвращать лишние повороты в меню под словами направление/положение крышки. Сундук: open/double; ender без double. Шалкер: open. Stem direction/грань нароста/UV стороны — другие обязанности; не удалять их вслепую. Макет отложен на другой чат.

Следующий участок при продолжении: подключить УЖЕ СУЩЕСТВУЮЩИЕ шалкеры к preview/common picker только с open и независимой PNG, цвета отдельно. Геометрию/источники заново не создавать. 44f7d6e facing-нормализация отменена последующей чисткой. Черновик 17 shulkers/61 IDs с направлением НЕ записан. Не восстанавливать его.

## Что подключено

Срез сейчас 44 source IDs, не число cards/весь каталог: прежние 29 + 4 liquids + 11 chest sources. b165cfc подключил воду/лаву с level 0..7/default 0, ef08f4f/759666f — листы/меню сундуков, включая 4 unwaxed+4 waxed copper stages и chest/trapped/ender. 17fe666/c2b7384 учитывают canonical aliases; waxed ID открывает обычный объект при сохранении source record/resources. Шалкеров в срезе пока нет.

Готовые головы/черепа skeleton/wither_skeleton/creeper/zombie/piglin/dragon и 4 стадии статуи/4 позы уже в parent cards. Eyeblossom одна card closed/open/cross-emissive_cross/glow. Общие FKModelState/FKM/CSS и preview-controls.mjs, реальные source records/familyDefaults, independent form/slot/state. Source IDs/reopen/resources не терять, sheets без копий/обрезки.

Dragon: textures/entity/dragon/dragon 256x256, 6 head cubes+jaw/mirror UV/static closed jaw через skull; без полного тела/новой PNG. Полные mobs отложены, не недоделка голов. Недоступный Mob не показывать готовым; статуе не добавлять автоматически глаза/цветок, oxidation отдельно.

Pot: 23 узора+ordinary/4 стороны/common picker, корпус/UV сохранены. Conduit: 6 resources/default inactive/static active reference/eye-wind picker, без animation/eye tracking. Liquids: ровный уровень, не simulator/tint/timing. Всё это записанный код, не Bedrock appearance acceptance.

## Доказательства и границы

Записанные workflow pot/conduit/liquids/chest не доказывают успешный Actions. Локальные targeted/synthetic/mock/recording-painter checks не full PIN compile/реальные PNG-TGA/WebGL/Android/export; числа не суммировать. Опечатка record.paths в черновике controls до записи устранена новым подтверждением: исходное plan.paths сохранено, баг в main не попадал.

Предварительный bell/player_head/bubble_column остаток — архивная сверка, не свежий coverage/новый scope. Исторические проблемы OLDCHAT17 — гипотезы; excluded reply OLDCHAT19 не источник задач. Только main/точное подтверждение/saved diff, <25000 bytes/file, новые test files отдельно согласовать, backup/fk070_packs не трогать. Остальные контракты — CONTEXT/ARCHITECTURE/review-principles.
