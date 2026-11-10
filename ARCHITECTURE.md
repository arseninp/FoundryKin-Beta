# ARCHITECTURE

Обновлено 2026-11-10 по OLDCHAT31, семи документам и истории main до 337f7537ccdad52ff828d70bcb7f20fcd4347f55. Не выпуск. CONTEXT/handoff задают точку продолжения. Полная предыдущая архитектура на dc73611 и исторические 8c3805b/3e503a8/5b083a7/3fe2d82 сохраняют все модельные контракты, кроме прямо обновлённого ниже статуса. Сокращение истории не разрешает упрощать геометрию.

## Единственный рабочий путь

app.html → fk-editor/fk-app → iframe index.html → compiled editor. После 0a502af active core/view не используют legacy dispatch/FKShapes.build. Физическая чистка scripts/exports ещё не закончена; FKCatalog.loadAny нужен PNG/TGA.

PIN Mojang/bedrock-samples 46ba6ea985fb5a92d79a9419198f10dda14c199d → load/assembleChunks → normalize/resources/icons/aliases/states/families → compile/access/resolver → registry/materials/textures → scene. Manifest/hash/count/conflict checks сохранять. parseLooseJson сохраняет ,}/,] внутри строк, комментарии разделяют токены. Unknown не cube; неоднозначный ресурс не первый PNG.

Manifest: blocks 1275, terrain 1241, existing 8201, items 75/items-000.json, данные записаны в 3e698c4. Это не число cards/builders/принятых моделей. Auxiliary end_gateway/lava_cauldron и expanded bed различать. REVIEW_IDS собирается в preview.mjs из base/additional tables; старые coverage/counts не свежий аудит.

## Идентичность и ресурсы

Records/source IDs отдельно от visible cards. Access сохраняет source-ID/card/form/state/slot/reopen routes. Общая PNG не основание alias: редакторская сигнатура включает model/states/faces/indexed alternatives+repeats/carried/icons/bindings/textureSets. Oxidation/normal/deepslate не сливать; waxed только при эквивалентности.

material-families — production policy, tools/catalog-families — переэкспорт. Double slabs: equivalent full block → alias; отличающиеся → family form, включая пары slab/double без полного блока. Smooth stone double сохраняет stone_slab_side. Строгая валидация b82838b, запрет произвольных alias-форм/вложенности/пустых семейств остаются.

Standing/wall sign по wood/placement вместе, hanging отдельно. Cave vines whole/body/head и berries независимо от PNG. Standing/wall banner теперь тоже одна family: standing_banner с native/wall; records и source IDs не aliases и не удаляются фильтром Find.

Owned unique paths не indexed alternatives. Named parts/door halves/furnace pairs и pot/soil/piston head_back/torch/pitcher/chorus/amethyst dependencies сохранять без передачи ownership. Reverse index — единственный источник shared связей; warning для активного файла, normalize owners к visible cards с dependencies. compiledInfo.shared по всем files не точная плашка ресурса.

## Знамёна и группы ресурсов

50d12e1: banner adapter заменяет fallback planks настоящими banner resources; полотно и стойка используют собственный sheet. Исходная blocks definition сохраняется как provenance, не как рабочие грани/ownership досок. Основной лист, 42 рисунка, особые источники, явно объявленные icons/carried не терять.

3bcf213: существующий editor slot list поддерживает resourceGroups из семантики source. Для знамени Основа/Рисунки/Дополнительные исходники; у прочих объектов пока flat list. Активный раздел открывается автоматически. Раскрытие не выбирает PNG и не перестраивает модель; кнопки создаются сразу, lazy loading и измеренное ускорение не заявлены.

da03234: общий вид заголовка с name left/count+arrow right. Готовый banner_illager входит в Основу, отдельный pattern_illager — не тот же ресурс. d5a6145 восстановил snap(k) с размерами cv[k], не cv[slot].

BANNER_COLORS/ordered patterns/canvas composition — просмотр, не 16 отдельных цветных PNG. Новую палитру владелец не запросил. Ominous готовый sheet без recolor/обычных layers сохранить. Выбор edited PNG не переключает форму/цвет/слои. UI примерки рисунков/слоёв и миниатюры не завершены.

Группы распространять через тот же контракт по declared roles, не ручные кнопки и не эвристику имени. Bubble/pot/ghast — дальнейшие кандидаты, не автоматически готовые группы.

## Bubble и карты материала

337f753 добавляет withDeclaredBindings для bubble_column/model=sprite: рабочие paths = 18 declared bindings плюс явно объявленные icons/carried; fallback east/west pumpkin_side исключается из рабочих faces/variants/paths. source.kind=engine-effect/template=bubble_column/definition сохраняет исходное описание. Raw normalize без model=sprite и посторонние IDs не переписываются. Полный двухфайловый diff прочитан, исполнение новых тестов текущим проходом не подтверждено. UI-группы пузырей этим пакетом НЕ подключены.

Bubble_column/end_portal/end_gateway сохраняют общий sprite/WebGL и квадратные cards, не no-preview/empty builder/новый renderer. Один выбранный ресурс на plane не particle simulation. Пометка ограничения игрового эффекта остаётся будущей.

8485bb4: polished_cinnabar_mers добавлен по явному pinned texture_set declaration к editable paths внутри существующей карточки. Не suffix inference/не albedo/не PBR. 44a5f84 добавил CI inspection исходного TGA и сравнение production decoding. Decode/drawing/history/save/reopen/export через прежний canvas/PNG-путь не переписаны. Пользователь сообщил, что MERS работает; это не побайтовое доказательство сохранности RGBA/subsurface alpha. Не утверждать ни доказанную порчу, ни полную безопасность без проверки.

## Иконки и controls

assembleChunks опциональные items отдельно от terrain, counts/hash/duplicate checks; старый manifest не получает искусственно пустой atlas. Генератор pinned item_texture.json через blockIconLinks, repeats сохраняются; bed light_gray→silver.

compiledSelection: объявленная record.icons без explicit view → sprite, обычный ресурс → model. Не эвристика директории; explicit view не переопределять. Принадлежность slot семейству проверяется. Будущий Item-значок отличает icon от model textures, flat/no rotation, та же карточка. Carried вроде бамбука требует сверки роли. Icons filter — адресный вход на тот же ресурс, не второй каталог.

Один FKModelState/FKM/fk-menu/preview-controls. Observer off/on через indexed cube, default off. Hanging mounting ceiling/attached/wall через sign-preview, ceiling default; обычные family forms не получают duplicate mounting, sprite без model controls. Сохранить bulb/frosted_ice/anchor/crafter/structure/leaf/crop typed validation и EN/RU. PNG/form/slot/state/pose независимы.

## Lifecycle и отображение

291b5d9: family frame canvases/history reuse, PNG serialization по изменению, pack change сбрасывает кадры, модель не очищается до await. Async invalidation/discard/setPack/rollback Add сохранять. 0f27ede: GPU texture reuse при прежнем размере, update по пикселям, resize освобождает прежние; unchanged bindings/alpha без material.needsUpdate. CPU comparison осталось; не второй cache manager без причины.

createModelMaterials: classified isTexture+boolean semi; Basic-unlit sprite/glow/emissive, Lambert обычные, конфликт lit/unlit отклонять. Semi transparent/alphaTest0/depthWrite false, иначе false/.05/true. FrontSide/depthTest, planar DoubleSide по контракту. Materials владеют material, GPU layer textures, canvas borrowed. Cleanup/AggregateError/cache/retry/limits сохранить.

Whole-sheet alpha/inflate/UV/стыки — гипотезы исчезающих поверхностей, не установленный диагноз. Не глобальный opaque/DoubleSide/alpha=255. Начальная ориентация общая cards/editor, не игровое facing/mirror. Восемь групп для разворота перечислены в CONTEXT и подтверждены владельцем; исправление ещё не записано. Не глобальные 180° и не повторная компенсация полок/подсолнуха. Масштаб пока не менять.

## Сохраняемые модельные контракты

- Head sheets bindings.sheet/full sheets без copies/crops. Player head+hat inflate 0.5px/full Steve/routes, body/skin/armor позже. Skeleton/wither/creeper/zombie/piglin/dragon и statue oxidation/4 poses сохранять. Dragon 256x256/static jaw/mirror UV; statue eyes/flower автоматически не добавлять.
- Bed source→16 records/owned sheets, bed→red_bed, light_gray→silver, 9 частей. Chest 11 IDs/sheet-double_sheet/open/double, ender без double; shulker 17/base-lid/open. Whole-block facing не возвращать.
- Signs 13 пород, реальные standing_sign/darkoak IDs, hanging отдельный sheet. acacia@750f657: standing/attached rotation, ceiling/wall facing; старое подозрение ceiling rotation снято.
- Eyeblossom closed/open одна card с glow; pumpkin/melon отдельные cards с composite stem; budding amethyst один нарост stage/face; kelp A–D не стадии роста.
- Liquids четыре ID/integer level0..7/default0/height(8-level)/9, lava emissive; flow/slopes/tint не заявлены. Pot 23 patterns+brick/4 faces. Conduit шесть ресурсов/static active/eye-wind; bf90910 исправил вертикальный UV-масштаб inactive, владелец подтвердил работу. Bell пять частей/стойки/sheet без звона/прочих креплений.
- Fire 4 внутренних+4 perimeter planes/full UV/primary-alternate независимо от PNG/unlit roles; campfire 28 log faces, lit +2 flame planes/emissive up. Static не playback/smoke.
- Leaf14/cutout-opaque/carried/variants, biome tint не принят. Cauldron content не PNG и не готовая система красителей. Indexed buttons/plates/stairs/grass_path down/dirt-coarse_dirt/mycelium up-down-side/snow-side/repeats сохранять. normal_stone_stairs не stone_stairs; принятую геометрию без дефекта не переписывать.

## Приёмка

Текущий проход: чтение архива/семи документов/истории и полный diff 337f753, без исполнения тестов/приложения. Пользовательская проверка conduit/MERS не полный CI/побайтовая проверка/export. Каталог просмотрен владельцем до D, чтение builders не визуальная приёмка. Real PNG/TGA/WebGL/Android/draw-history/Add/reopen/export остаются.

Следующая согласованная runtime-версия 1.0.0 здесь не устанавливается. Versioning classic/dynamic imports согласованно, backup/паки/localStorage не очищать. Full mobs/skin/body/armor/tablet-desktop layout отложены.
