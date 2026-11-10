# Принципы ревью и безопасной передачи

Обновлено2026-11-10 по OLDCHAT32, семи документам и main до3f2cf4fc785c171a58036bee06ddd8df4f93dab5. CONTEXT/handoff первыми. Прежние технические/модельные контракты сохраняются, кроме прямо обновлённого статуса.

## Доказательства и неоднозначный обрыв

Различать план, согласованный пакет, write, saved diff/content, локальные тесты, полный CI, пользовательскую и побайтовую приёмку. Результат одного SHA не переносить на другой, исторические изолированные проверки не суммировать.

После сбоя сначала читать GitHub. eec565b удаления слоёв действительно записан, несмотря на неполный ответ OLDCHAT32; так же observer b7bf780/6b649d4/items3e698c4/bubble337f753 не потеряны. Два ошибочных финальных ответа OLDCHAT31 не источник статуса; нормализацию пузырей не повторять.

Сохранённый код приоритетнее пересказа:41bf23b меняет ANGLE_Y внешней stage.group при reset/выходе из flat, а не геометрию до bounds. Не переносить неточную формулировку чата в новый план.

Текущий docs-проход: OLDCHAT32, семь документов, история main, editor-selection/resource-usage/banner-controls/cauldron-controls/fk-core и полные diff a804a64/41bf23b. Не полный аудит всех файлов/diff. Приложение/Node/CI/браузер/WebGL здесь не запускались, screenshots/log attachments повторно не исследованы.

Владелец сообщил «я проверил все ок вроде», отметив сложность UI; это ограниченная проверка тогдашнего интерфейса, не позднейших коммитов/full round trip. Conduit/MERS подтверждены пользователем ранее, не просить повтор без новой причины. RGBA/subsurface alpha/draw-history/Add/reopen/export отдельно. Не требовать оригинальный TGA через чат повторно: передача преобразовывала вложения. CI decoding diagnostic и browser save — разные проверки.

## Исправлять причину в её слое

Один каталог/runtime/picker/menu/index. Не вторые таблицы/адаптеры вокруг адаптеров/фильтры для сокрытия дефекта. Unknown не cube, неоднозначность не первая PNG. UV чинить в builder, начальный ракурс в общем view; готовую геометрию без дефекта не переписывать.

Aliases только при полной editor equivalence; отличающиеся double slabs — family forms, smooth stone side сохранить, b82838b не ослаблять. Families явно объявлены, частично общая PNG не auto-merge. Oxidation раздельно; infested/waxed не разъединять ради повторного объединения. Source records/IDs/reopen/owned/carried/icons/indexed repeats/dependencies сохранять без ownership transfer. Sheets без незапрошенных copies/crops. PNG/form/slot/state/pose независимы.

Chest/shulker open/lid/double и ender без double, whole-block facing не возвращать. Player head/hat/full sheets/routes и прежние model contracts сохранить. Java reference не доказательство всего resource→build→render. Materials/GPU ownership, async/history/storage rollback/cleanup/limits/cache/retry не ломать ради скорости.

## Текущие границы

Groups по declared roles, не filenames/ручные lists. Toggle не selection/rebuild. Buttons создаются сразу, не lazy/измеренный benchmark. Ghast ровно4 стадии; общий файл не пятая стадия. Bubble18 без pumpkin_side уже нормализован, groups уже подключены, provenance/icons/carried сохранены.

Shared-плашка уже над stage, active file отдельно от borrowed dependencies; visible cards/forms/states/roles сохраняются, ownership не передавать. Прежние lists из справки не возвращать. Один обход зависимостей/usage reuse не постоянный cache и не телефонный benchmark.

Banner layers/move/remove уже есть; миниатюры нет. Ominous готовый sheet, pattern_illager другой ресурс. Цвет preview не отдельный PNG, новую палитру не добавлять. Edited PNG не меняет color/layers/form. Item note по declared icon, не всем carried; бамбук требует сверки.

Bubble/end — source texture preview, не Minecraft simulation/no-preview/empty builder/новый renderer. MERS уже editable без PBR; canvas loss не доказанная порча/безопасность. Conduit UV уже исправлен. Alpha/inflate/UV пока гипотезы surfaces, не global opaque/DoubleSide/alpha255. Не повторно компенсировать shelves/sunflower, scale пока не менять. Чтение builders не приёмка каталога; владелец дошёл до D.

## Следующий проигрыватель

Один физический кадр вертикального PNG в секунду сверху вниз, после последнего первый. Без timing/order из JSON, раннюю metadata preparation не делать обязательной зависимостью. fr/fi/setFrame и история остаются; экспорт полного вертикального PNG. Остановка при смене объекта/ресурса, рисовании, выходе/скрытии и pack reset; проверить hooks/async/устаревшие callbacks. Без постоянного render loop.

Код проигрывателя НЕ записан. Последняя проверка OLDCHAT32 оборвалась в тестовой обвязке; не выдавать за успешные тесты. Перед записью законченный пакет и точное подтверждение.

## Понятная непрерывная работа

Кратко по-русски, не перекладывать проектирование/отладку на владельца. Всегда явно: ничего проверять/присылать не нужно либо конкретная короткая проверка/лог с основанием. Ожидание CI не просьба открыть приложение. При плохом интернете проверки отложены, не просить повтор без новой причины. Не обещать фон/Node/WebGL/Actions без инструмента.

Каждый внешний write — точное подтверждение файлов/полного содержимого, затем ровно одобренный write и saved diff/content. Общее «продолжай» не универсальное одобрение. После записи продолжать до следующего подтверждения/решения/блокера, не ждать отдельного «продолжай».

Только main, <25000 UTF-8 bytes/file. Новые permanent tests отдельно согласовать; существующие assertions не удалять массово/не ослаблять. Удаление main dependencies только после проверки, backup — нет. FKCatalog.loadAny нужен PNG/TGA, physical cleanup не завершена.

Бэкап/refactor-0.9/fk070_packs/localStorage не менять/не переносить/не очищать, не требовать чистки кэша. PIN46ba6ea985fb5a92d79a9419198f10dda14c199d не смешивать с другими версиями.

## Отложенное

Runtime/cache versions и архивирование истории не задерживают блоки/макет;1.0.0 не автоматически релиз и не установлена docs-only. Старые логи не удалять; перед архивом проверить ссылки/CI и сохранить текущие contracts. После блоков перед дальнейшей догрузкой items планируется глубокий аудит безопасности, ещё не выполненный; docs/code-map.md пока не создана. Full mobs/skin/body/armor/tablet-desktop layout и прочие будущие этапы отдельно.
