# ARCHITECTURE

Обновлено 2026-11-10 по OLDCHAT30, прочитанным документам и истории main до 8c3805b4f58c485308e2cd1bc6142a7565c0e186. Не выпуск. CONTEXT/handoff задают текущую точку. Полная прежняя архитектура на 8c3805b и версии 3e503a8/5b083a7/3fe2d82 сохраняют все модельные ограничения, не отменённые явно ниже; сокращение истории здесь не разрешает упрощать геометрию.

## Единственный рабочий путь

app.html → fk-editor/fk-app → iframe index.html → compiled editor. После 0a502af ядро всегда использует compiled catalog; FKView не вызывает FKShapes.build. Старый fallback не возвращать. Legacy scripts/exports физически ещё требуют чистки; FKCatalog.loadAny нужен PNG/TGA.

PIN Mojang/bedrock-samples 46ba6ea985fb5a92d79a9419198f10dda14c199d → load/assembleChunks → normalize/resources/icons/aliases/states/families → compile/access/resolver → registry/materials/textures → scene. Manifest/hash/count/conflict checks сохранять. parseLooseJson сохраняет ,}/,] внутри строк, комментарии разделяют токены. Unknown не cube; неоднозначный ресурс не первый PNG.

Текущий manifest: blocks 1275, terrain 1241, existing 8201, items 75; items-000.json сохранён ботом в 3e698c4. Это исходные записи, не число карточек, builders или принятых моделей. Auxiliary end_gateway/lava_cauldron и расширение bed дают отдельные множества. Исторические coverage 1277/base preview 638/1177 не подменяют текущую сверку. REVIEW_IDS собирается в preview.mjs из base и дополнительных таблиц, не только preview-config.

## Идентичность, семейства и ресурсы

Records/source IDs/resources сохраняются отдельно от видимых cards. Access обеспечивает source-ID routes, card/form/state/slot/reopen. Совпадения PNG недостаточно для alias. Проверяется полная нормализованная редакторская сигнатура: модель, состояния, грани, indexed alternatives/repeats, carried/icons и bindings. Oxidation/normal/deepslate не сливать; waxed только при эквивалентности.

material-families — общая политика, tools/catalog-families только переэкспорт. Double slabs разбираются включая медные схемы имён. Эквивалент обычного блока — alias без лишней формы; отличающийся — double-slab form внутри семейства, включая пары slab/double без полного блока. Smooth stone double сохраняет side stone_slab_side вместо all stone_slab_top. b82838b сохраняет проверки произвольных alias-форм/вложенности/пустых семейств; нельзя ослаблять их ради дедупликации.

Standing/wall sign объединяются по wood/placement, hanging отдельно. Cave_vines body/head находятся внутри родительской карточки; builders частей остаются для просмотра форм, berries независимо от PNG. Не скрывать отдельные records фильтром Find. Infested/coral wall fan/candle-cake aliases сохраняют прежние контракты; candle cake alias не обещает свечу на геометрии торта.

Owned unique paths не indexed alternatives. Named parts/door halves, furnace pairs и pot/soil/piston head_back/torch/pitcher/chorus/amethyst shared dependencies сохранять без передачи ownership. Catalog reverse index — единственный источник связей; shared warning должен запрашивать активный файл и нормализовать IDs к видимым карточкам, учитывать зависимости. compiledInfo.shared по всем files не точная плашка одного ресурса.

## Предметные иконки и controls

assembleChunks принимает опциональные items-chunks отдельно от terrain с counts/hash/duplicate checks; старый manifest без items не получает искусственно пустой атлас. Генератор читает pinned item_texture.json, отбирает через blockIconLinks. Индексы/повторы сохраняются, bed light_gray → bed_silver.

compiledSelection определяет иконку по объявленному record.icons, не директории файла. Без явного view выбранная иконка → sprite; обычный ресурс → model. Явный режим не переопределяется. Сохраняются проверки принадлежности ресурса семейству. Будущий icons filter использует адресный вход на ресурс той же карточки, не второй каталог.

Один FKModelState/FKM/fk-menu/preview-controls, не частные меню. Observer powered='off'/'on' через indexed cube, off default; не зависит от edited PNG. Hanging sign mounting ceiling/attached/wall через catalog/sign-preview.mjs; ceiling default. Обычные sign family forms не получают второе поле mounting, sprite не получает model controls.

Сохранять прежние bulb/frosted_ice/anchor/crafter/structure modes, leaf cutout/opaque, crop stages и typed validation/EN-RU. PNG/form/slot/state/pose независимы. Head sheets bindings.sheet/full sheets без copies/crops. Eyeblossom closed/open одна card с glow; pumpkin/melon отдельные cards с composite stem; budding amethyst один нарост stage/face; kelp A–D не стадии роста.

## Lifecycle и производительность

291b5d9 сохраняет семейные frame canvases/history, сериализует PNG только по изменению пикселей/разрешения и сбрасывает кадры при pack change. Модель не очищается перед await, но перестроение не устранено полностью. Async invalidation/discard/setPack и rollback неудачного Add сохранять.

0f27ede обновляет GPU-текстуры на месте при прежнем размере, по изменённым пикселям; resize пересоздаёт batch и освобождает прежний. Неизменённые bindings/alpha policy не требуют material.needsUpdate. CPU-чтение/сравнение всех ресурсов осталось; второй cache manager не добавлять без необходимости.

createModelMaterials: classified isTexture + boolean semi; Basic-unlit для sprite/glow/emissive, Lambert для обычного, conflicting lit/unlit path отклонять. Semi → transparent/alphaTest 0/depthWrite false; иначе false/.05/true. FrontSide/depthTest, planar DoubleSide по существующему контракту. Materials владеют материалами, GPU layer — textures; source canvases заимствуются. Cleanup всех частей/ошибок/AggregateError/cache/retry/limits сохранить.

Один semi-пиксель на sheet, inflate деталей и UV/стыки — возможные диагностические направления исчезающих поверхностей, не установленные причины. Не глобальный opaque/DoubleSide/alpha=255.

## Просмотр и карты материала

Bubble_column/end_portal/end_gateway остаются на общем sprite/WebGL пути, квадратная сетка без пустых карточек. No-preview renderer/пустой builder НЕ выбран. Bubble сохраняет 18 owned roles, выбранный slot даёт одну texture/plane; pumpkin_side не bubble role. Это не particle simulation. Будущая независимая пометка объясняет ограничение игрового эффекта.

polished_cinnabar_mers.tga — план дополнительного editable resource внутри polished cinnabar, ещё не подключён. Не albedo и не обещание PBR. Перед записью проверить сохранение RGBA как данных материала, включая subsurface alpha, через decode/draw/history/save/reopen/export. Canvas-путь не считать автоматически побайтово безопасным; подозрение из архива проверить.

Начальная ориентация общая для карточки и редактора, не игровое facing и не зеркалирование. Отвёрнутые головы — кандидат на 180° только после проверки группы; ghast/banner/dripleaf отдельно сверять. Масштаб маленьких объектов пока не менять.

## Сохраняемые модельные контракты

- Bed: source bed → 16 records/owned sheets, bed→red_bed, light_gray→silver, прежние 9 частей; не новая геометрия. Chest 11 IDs/sheet-double_sheet/open/double, ender без double; shulker 17 IDs/base-lid/open. Whole-block facing не возвращать.
- Player_head: head+hat inflate 0.5px/full Steve sheet/routes; body/skin/armor позже. Skeleton/wither/creeper/zombie/piglin/dragon heads и statue oxidation/4 poses сохранить. Dragon 256x256/static jaw/mirror UV; statue eyes/flower автоматически не добавлять.
- Signs: 13 пород/реальные standing_sign и darkoak IDs; hanging отдельный sheet. Reference acacia@750f657: standing/attached rotation, ceiling/wall facing. Прежнее подозрение ceiling rotation снято.
- Liquids: четыре ID, integer level 0..7/default 0, height (8-level)/9, lava emissive; flow/slopes/tint не заявлены. Pot: 23 patterns+brick/4 faces. Conduit 6 resources/static active/eye-wind, дефект неактивного вида открыт. Bell 5 частей/стойки/sheet без звона/прочих креплений.
- Fire: 4 внутренних+4 периметральных planes/full UV, primary/alternate независимо от PNG, unlit roles; campfire unlit 28 log faces, lit ещё 2 flame planes, emissive up. Static не playback/smoke.
- Leaf 14 IDs cutout/opaque, carried/variants сохранить, biome tint не принят. Banner colors/ordered layers/canvas update/tint полотна, ominous отдельный sheet без recolor/layers/card. Cauldron content не PNG и не готовая система красителей.
- Indexed buttons/plates/stairs, grass_path down=dirt/coarse_dirt, mycelium named up/down/side + snow-side/repeats сохранить. Normal_stone_stairs не stone_stairs. Принятую repeater/comparator и прочую геометрию без дефекта не переписывать.

## Приёмка и версия

OLDCHAT30 содержит локальные проверки пакетов и пользовательское улучшение скорости/«всё ок», но не полную приёмку. В текущем документальном проходе исполнения не было. Старые e07f971 validate 697/697 и preview north ambiguity — история, не статус HEAD. Generated data в Git не равны зелёному CI всех последующих записей.

Полные PNG/TGA/WebGL/UV/alpha/Android/source search/draw-history/Add/reopen/export остаются к проверке. Версия следующего согласованного runtime обновления 1.0.0; здесь не изменена. Не смешивать versions в app/index/classic scripts/dynamic imports; бэкап и паки/localStorage не очищать. Full mobs/skin/body/armor/tablet-desktop layout отложены.
