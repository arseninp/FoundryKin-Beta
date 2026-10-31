# TODO — проверка реальных данных и интеграция

Обновлено 2026-10-31. Проверенный кодовый HEAD 4c52b9d. [x] обозначает записанную реализацию по исходникам/истории, а не запуск, интеграцию или визуальную приёмку. Границы доказательств — CONTEXT.

## Следующий цельный проход

- [ ] Сверить HEAD и нужные исходники; не повторять уже записанные назначения slime/honey_block/farmland/snow_layer. Имена мёда в проверенных назначениях и gels совпадают: honey_block.
- [ ] Использовать существующий tools/model-coverage.mjs на полном PIN candidate с проверкой контрольных сумм и inputValidation; получить фактические ошибки нормализации/ресурсов/зависимостей, unresolved и missing builders. Не создавать параллельный аудит.
- [ ] Выполнить validate и существующий набор tests без упрощённой подмены проектных зависимостей. Проверить полный CI отдельно. Не заявлять запуск без результата и не поручать отладку владельцу.
- [ ] Выбрать следующий средний законченный пакет по проверенному остатку; geometry/assignments/bindings/states/tests вместе.

Последнее историческое основание: отчёт OLDCHAT12 1275/1112 assigned/39 sign missing/124 unresolved/0 invalid; после последующих локальных пересчётов политики заявлено 78 unresolved. Сам отчёт этой передачей не перепроверен. Эти числа не свежий compile, не число карточек и не процент готовности.

## Записано, но не принято в новом рабочем UI

- [x] Potted azalea, pot/soil dependencies, potted preview; взрослый bamboo и ограды, moss.
- [x] Поршни/redstone, fittings, высокие цветы, path/enchanting table/stonecutter/sea pickle.
- [x] Growth stages с повторами, vines/portals/tripwire, flowerbeds/sunflower/sniffer egg/pitcher/wires, tracks/metals/workshop.
- [x] Cauldron/cocoa/daylight; flower pot/decorated pot/conduit; fire/soul fire.
- [x] Dripleaf, sculk/cactus, pointed dripstone, dried ghast, barrel.
- [x] Простые/высокие растения, stage_cross для nether wart/torchflower crop/berry bush; сведения о количестве стадий в preview.
- [x] Fence_gate на gate; десять пар вееров с настенными aliases и тестами без отдельной настенной формы; 17 candle_cake на cake с правилами aliases; пять явных technical cube ID.
- [x] Изменение альфа-политики общего FKView; двухобъёмные slime/honey_block и их назначения.
- [x] Farmland 15/16 с wet и snow_layer с layers 1..8; назначения и ресурсные роли пашни в 4c52b9d.
- [x] Расширение существующего отчёта inputValidation; coverage artifact workflow; исправление синтаксиса strands.test.mjs.
- [ ] Подтвердить актуальный полный библиотечный и интеграционный прогон; исторические целевые тесты не заменяют его.

## Данные и незавершённые контракты

- [ ] Проверить текущие bindings/stages всех назначенных объектов на настоящем входе, включая повторы и общие зависимости. Наличие registry ID недостаточно.
- [ ] Грибы: проверить исходные определения и согласованный индекс вариантов шести граней; не менять общий cube/UV на основе неподтверждённых предположений. Отдельный грибной пакет не записан.
- [ ] Связать bamboo_sapling/adult как формы семейства. Проверить crop/adult torchflower relationship; не считать её сделанной по наличию stage_cross.
- [ ] Bedrock PNG/UV potted azalea; полный вход pot/soil, torch_on/off, pitcher pod.
- [ ] Проверить реальные PNG alpha и WebGL порядок ядра/оболочки slime/honey; не объявлять визуальный дефект закрытым по коду.
- [ ] Проверить aliases/forms/states/icons/carried и saved-ID routes. Waxed/infested — только эквивалентные, oxidation сохранить; normal/deepslate не сливать.
- [ ] Нормализовать lit blast furnace front; проверить auxiliary end_gateway/lava_cauldron, hashes, PNG inventory и block↔item icon links.
- [ ] Не возвращать obsolete stonecutter или отдельные настенные веера. Не добавлять cushion по одному найденному пути.
- [ ] Общий entity source/inventory/geometry/material adapter: sign, bed, bell и другие block entities. Entities отложены владельцем; перед основным переключением явно согласовать scope. Sign не подменять cube.

## Интеграция и приёмка

- [ ] Перепроверить HTML и сохранить рабочий legacy путь до приёмки нового. По истории он остаётся 0.9.1.
- [ ] Отдельная проверяемая страница normalize→compile→access→preview→registry с настоящими PNG/Three. Явно решить admission среза: compileModelCatalog сейчас строгий; unsupported обозначать, не превращать в cube и не скрывать сокращение конечного scope.
- [ ] Новый Find/editor/loader: один объект и общий материал для snapshot/editor, корректное обновление текстур.
- [ ] Панели state/forms/stages, role-based icon badges, Shared textures, EN/RU, растущие подписи, design tokens без редизайна бумажного макета. UX поиска item icon согласовать отдельно.
- [ ] Плеер отдельно от state: timing/order, пауза при рисовании, экспорт всей ленты; часы/компас — демонстрационный цикл.
- [ ] Saved-ID openTexture, transactions, async targets, PNG dimensions/alpha, import limits, URL/cache lifecycle.
- [ ] Настоящие WebGL и Android: draw/undo/redo→Add→reopen→PNG→mcpack, Back, язык/тема, pack/slot/frame switching.
- [ ] После приёмки согласованного scope переключить HTML, синхронизировать FK_V/cache versions, удалить заменённый legacy runtime.

## После основного этапа

Полные items/entities через adapters; IndexedDB, большие паки, пользовательский backup, PWA/offline и права на ресурсы — отдельные задачи. Backup кода автоматически не обновлять; fk070_packs не очищать. Документы обновлять по запросу, не после каждого объекта.
