# TODO — продолжение переноса и интеграции

Передача 2026-10-30, проверенный HEAD 2a109dc. [x] означает записанную реализацию по истории и текущим подключениям, не визуальную приёмку. Документацию обновлять по запросу в конце сессии.

## Следующий рабочий проход

- [ ] Сверить HEAD и нужные исходники; не перечитывать весь архив и не повторять сделанные модели.
- [ ] Выполнить существующие validate/tests и полный coverage на PIN 46ba6ea в доступной среде; не заявлять запуск без результата и не поручать его владельцу.
- [ ] Пересчитать актуальный остаток после workshop. 1066/39/170 — старый арифметический ориентир до последнего пакета, не текущий compile.
- [ ] Продолжать законченными семействами из принятого legacy кода, с assignments/resources/states/tests вместе. Разделять неполное покрытие, синтаксис, потери ресурсов, CI и визуальные дефекты. Не создавать дубли отчётных helpers.

## Перенесено, но не подключено к рабочему UI

- [x] Potted azalea, объявленные общие зависимости и переключение potted в preview.
- [x] Взрослый bamboo, bamboo fence/gate, pale moss carpet.
- [x] Поршни, redstone torch, repeater/comparator из принятой модели.
- [x] Ladder/lectern/lever/shelf, высокие цветы; path/enchanting table/stonecutter_block/sea pickle.
- [x] Посевы и turtle egg с сохранением повторяющихся индексов; лозы, порталы, tripwire/hook.
- [x] Spore blossom, flowerbeds, sunflower, sniffer egg, pitcher crop/plant, redstone wire.
- [x] Восемь простых растений через cross; четыре рельса; bars/lightning rods/end rod/heavy core.
- [x] Hopper, grindstone, frame/glow_frame — последний workshop пакет 2a109dc.
- [ ] Подтвердить выполнение библиотечного теста с ожидаемыми 69 типами и остальных новых интеграционных тестов без подмены импортов.

## Остаток моделей и данных

- [ ] Связать bamboo_sapling и взрослый bamboo как формы семейства; иконка независима, bamboo block и ограды отдельно.
- [ ] Bedrock PNG/UV review горшечной азалии и полный вход dependencies: pot/soil, torch_on/off, pitcher pod.
- [ ] Классифицировать реальный unresolved список семействами: специальные формы, растения/стадии, устройства, жидкости/технические объекты и источники entity-ресурсов. Старый список 243 больше не актуален.
- [ ] Для табличек и других block entities подготовить общий source adapter с inventory/ownership/geometry/materials. 39 sign пока без построителя; не делать cube или отдельную временную архитектуру. В OLDCHAT11 они отложены до общего источника; перед основным переключением явно согласовать scope этих блоков.
- [ ] Проверить aliases/forms/states/icons/carried, old-ID open и все повторы вариантов. Waxed/infested скрывать только при эквивалентности; степени окисления сохранять.
- [ ] Не возвращать устаревший stonecutter; нужен stonecutter_block. По поздней поправке истории старый уже исключён из candidate.
- [ ] Нормализовать фронт lit blast furnace; проверить auxiliary end_gateway/lava_cauldron, hashes и совместимость family plan/state groups.
- [ ] Проверить PNG inventory и block↔item icon links; путь не доказывает правильность UV/роли.

## Интеграция и приёмка

- [ ] Сделать отдельную страницу проверки нового пути, сохранив рабочий legacy app. Явно решить admission ограниченного среза: compileModelCatalog сейчас строго отвергает неполное покрытие. Unsupported не превращать в кубы.
- [ ] Закрыть согласованный полный scope и цепочку normalize→compile→access→preview→registry до замены основного приложения.
- [ ] Новый Find/editor/loader: snapshot и editor одной модели; общий материал обновляется корректно.
- [ ] State panel, формы, стадии, role-based icon badges, Shared textures, EN/RU и растущие подписи. Сохранить бумажный макет; централизовать design tokens без редизайна.
- [ ] Плеер отдельно от состояний: timing/order, пауза при рисовании, экспорт всей ленты.
- [ ] Saved-ID openTexture, storage transactions, async target, dimensions/alpha и import limits.
- [ ] Настоящие Three/WebGL и Android: draw/undo/redo→Add→reopen→PNG→mcpack, Back, язык/тема, pack/slot/frame switching.
- [ ] После приёмки переключить HTML, синхронизировать FK_V/cache versions, удалить заменённый legacy runtime.

## Дальнейшие разделы

Полные items и entities требуют отдельных adapters; dependencies и named bindings только точки расширения. IndexedDB, большие паки, backup пользовательских данных, PWA/offline и права на ресурсы — отдельные задачи. Backup автоматически не обновлять; fk070_packs не очищать.
