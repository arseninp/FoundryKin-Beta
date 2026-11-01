# TODO — модели, плод со стеблем и интеграция

Обновлено 2026-11-01. Проверенный кодовый HEAD: 62c8af15ec1fb4d9c4cc1c96caec9e349141df6a. [x] означает записанную реализацию, не визуальную приёмку. Доказательства и исторические проверки — CONTEXT.

## Следующая согласованная задача: плод со стеблем

- [ ] Подготовить в новом catalog/models компонент совместного просмотра: без стебля — плод; со стеблем — тот же плод и направленный к нему стебель рядом. Переиспользовать существующие builders, не дублировать принятую геометрию/UV.
- [ ] Проверить материалы/UV, направления/стык, границы сцены и масштаб камеры, cleanup при ошибках и независимость от edit PNG. Локальный компонент из OLDCHAT14 не считать доступным: код/журнал здесь не получены.
- [ ] Связать pumpkin с pumpkin_stem, melon с melon_stem в две соответствующие карточки и явный вариант «Без стебля / Со стеблем». Не объединять тыкву с арбузом и не подменять совместный вид отдельным стеблем.
- [ ] Сохранить исходные ID, owned PNG, stage 0..7, attached/facing и варианты обычной/вырезанной/светящейся тыквы. Проверить saved-ID маршруты и обратное открытие стеблей.
- [ ] Проверить compile→access→preview→registry и тесты существующих forms/states/aliases, без регрессии bamboo/torchflower.

Владелец разрешил небольшие последовательные пакеты: компонент с тестами → подключение карточек/состояния/маршрутов → интеграция. Не выдавать первый пакет за всю функцию. Рабочий legacy редактор не менять. Текущий forms.mjs связывает только bamboo/shoot и torchflower/crop.

## Уже записано в OLDCHAT14

- [x] 86b6d8f: исправлены границы utility-parts/dependencies и chorus_flower/stem; добавлены тесты хоруса и исправлено ожидание политики. Старый синтаксический дефект 5c5f9f4 больше не текущий P0.
- [x] e537ecc: cave vines, целый столбик и отдельные части, berries, ресурсы/регистрация/тесты.
- [x] 71d4501: copper bulb modes, frosted ice 0..3, respawn anchor 0..4 с сохранением индексов/повторов.
- [x] c6a70d5: front lit furnace/blast furnace/smoker нормализуется к обычному состоянию по ограниченному проверенному правилу.
- [x] aab86e1: специализированное dragon egg, назначения/регистрация/тесты; Bedrock PNG/WebGL ещё не приняты.
- [x] 6aa8a0f: bamboo_sapling/adult forms без превращения ростка в alias взрослого.
- [x] b9df7be: torchflower crop/adult relationship с сохранением стадий посева.
- [x] 62c8af1: общий stem для pumpkin_stem/melon_stem, stage/attached/facing, роли stem/upperstem, регистрация и тесты. Не включает карточки плод+стебель, составной просмотр, UI или игровую возрастную окраску.

## Предыдущий прогресс не начинать заново

- [x] Potted azalea/pot/soil; adult bamboo/ограды/moss; поршни/redstone/fittings; растения/utility/workshop прежних проходов.
- [x] Cauldron/cocoa/daylight, pots/conduit/fire, dripleaf/sculk/cactus, dripstone/dried ghast/barrel/stage_cross.
- [x] Slime/honey, farmland/snow assignments; coral wall fan/candle cake aliases и явные technical cubes.
- [x] Planar cleanup, nether roots→cross, общий индексированный cube preview hives/crafter/suspicious/bookshelf/heart/mushrooms.
- [x] Composter/scaffolding, head_back обоих поршней через dependency, cage spawner/vault без внутренних entities.

## Общие проверки данных и моделей

- [ ] Использовать существующий tools/model-coverage.mjs на полном PIN candidate с hashes/inputValidation. Разделять unresolved, missing builders, normalization, inventory/dependencies и rendering. Не создавать второй аудит.
- [ ] Выполнить node tools/validate.mjs и node --test tools/*.test.mjs; полный compileModelCatalog и CI подтвердить отдельно. Запуск владельцу не поручать.
- [ ] Проверить bindings/stages/variants/dependencies на реальном входе, сохраняя повторы. Целевые фикстуры не заменяют полный candidate.
- [ ] Bedrock PNG/UV potted azalea; общие pot/soil/torch/pitcher/chorus/piston ресурсы.
- [ ] Реальные PNG alpha и WebGL сортировка гелей; stem age tint и PNG/UV dragon egg отдельно.
- [ ] Aliases/forms/states/icons/carried/saved-ID; waxed/infested equivalence, oxidation сохранять, normal/deepslate не сливать.
- [ ] Auxiliary end_gateway/lava_cauldron и block↔item icons.
- [ ] Общий entity source/inventory/geometry/material adapter для sign/bed и прочих block entities; entities/cushion/bell отложены, scope согласовать до переключения. Unknown не заменять cube.

Свежего полного остатка нет. Старые 78/74 unresolved и 39 sign — исторические значения. В библиотечном тесте HEAD ожидается 99 типов; это не успешный запуск и не число карточек. Полные проверки и визуальная приёмка в этой передаче не выполнялись.

## Интеграция и приёмка

- [ ] Перепроверить HTML; сохранить рабочий legacy 0.9.1 до приёмки.
- [ ] Отдельная проверяемая страница normalize→compile→access→preview→registry с настоящими PNG/Three. Admission среза решить явно, не ослаблять строгий compileModelCatalog скрытым исключением unsupported.
- [ ] Find/editor/loaders используют общий объект и корректно обновляют материалы; state/forms/stages независимы от edit slot.
- [ ] Role-based icon badges, Shared textures, EN/RU, растущие подписи/design tokens без редизайна бумаги. UX поиска item icon согласовать.
- [ ] Плеер отдельно от state: timing/order, пауза при рисовании, экспорт всей ленты; часы/компас demo cycle.
- [ ] Saved-ID openTexture, transactions/async targets, dimensions/alpha, import limits/cache/URL lifecycle.
- [ ] Настоящие WebGL/Android: draw/undo/redo→Add→reopen→PNG→mcpack, Back, язык/тема, pack/slot/frame switching.
- [ ] Только после приёмки согласованного scope переключить HTML/FK_V/cache и удалить заменённый legacy runtime.

## Темп и сохранность

Готовый пакет сразу на системное подтверждение точных полных аргументов. После записи сверять полное содержание/diff, не только число файлов. После обрыва сначала GitHub. Документы по запросу; постоянные отчёты остатка не обязательны. Файлы <25000 UTF-8 байт. Backup автоматически не обновлять; fk070_packs не очищать.

Полные items/entities, IndexedDB, большие паки, пользовательский backup, PWA/offline и права на ресурсы — отдельные этапы.
