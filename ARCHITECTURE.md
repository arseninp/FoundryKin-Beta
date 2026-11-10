# ARCHITECTURE

Обновлено2026-11-10 по OLDCHAT32, семи документам и main до3f2cf4fc785c171a58036bee06ddd8df4f93dab5. Не выпуск/полная приёмка. CONTEXT/handoff задают продолжение. Прежние модельные контракты dc73611/8c3805b/3e503a8/5b083a7/3fe2d82 сохраняются, кроме прямо обновлённого статуса; сокращение истории не разрешает упрощать геометрию.

## Единственный рабочий путь

app.html → fk-editor/fk-app → iframe index.html → compiled editor. После0a502af active core/view без legacy dispatch/FKShapes.build. Физическая чистка scripts/exports не закончена; FKCatalog.loadAny нужен PNG/TGA.

PIN Mojang/bedrock-samples46ba6ea985fb5a92d79a9419198f10dda14c199d → load/assembleChunks → normalize/resources/icons/aliases/states/families → compile/access/resolver → registry/materials/textures → scene. Manifest/hash/count/conflict checks сохранять. parseLooseJson сохраняет ,}/,] внутри строк, комментарии разделяют токены. Unknown не cube, неоднозначность не первая PNG.

Manifest: blocks1275, terrain1241, existing8201, items75/items-000.json из3e698c4. Это не число cards/builders/принятых моделей. Auxiliary end_gateway/lava_cauldron и expanded bed различать. REVIEW_IDS в preview.mjs из base/additional tables; старые coverage/counts не свежий аудит.

## Идентичность и ресурсы

Records/source IDs отдельно от visible cards; сохранять source-ID/card/form/state/slot/reopen routes. Editor signature включает model/states/faces/indexed alternatives+repeats/carried/icons/bindings/textureSets. Общая PNG не alias. Families задаются явно, частичное совпадение текстур не автоматическая группировка. Oxidation/normal/deepslate не сливать; waxed только при эквивалентности.

material-families — production policy, tools/catalog-families — переэкспорт. Double slabs: equivalent full block→alias, отличающиеся→family form, включая slab/double без полного блока; smooth stone double сохраняет stone_slab_side. b82838b не ослаблять: без произвольных alias-форм/вложенности/пустых семейств.

Standing/wall sign по wood/placement вместе, hanging отдельно. Cave vines whole/body/head и berries независимо от PNG. Banner standing/wall family сохраняет records/IDs, не alias и не удаление из Find. Cauldron native/lava тоже family с исходными records, safe content normalization в cauldron-controls.

Owned unique paths не indexed alternatives. Named parts/door halves/furnace pairs и pot/soil/piston head_back/torch/pitcher/chorus/amethyst dependencies сохранять без ownership transfer.

## Актуальная карта модулей

- catalog/editor-selection.mjs: family paths, groups по declared roles, compiledSelection/reopen/search, image metadata и frame preparation.
- catalog/editor-resource-usage.mjs: read-only resourceUsage/resourceUsageInfo/appendResourceUsage; owners из reverse index плюс явные dependencies, notes.
- fk-core.js: resourceInfo перед stage, выбор slots/groups ниже; fr/fi/cv/history/setFrame/packCur, async selection/pack lifecycle.
- fk-model-state.css: отдельный информационный блок, не кнопка выбора PNG.
- catalog/banner-controls.mjs: schema/state.patterns существующего picker; catalog/cauldron-controls.mjs: content/подписи/переходы family.
- preview-controls.mjs/FKModelState/FKM/fk-menu: один путь управления, не второй picker.
- fk-view.js: общий cards/editor показ и начальный ракурс, не геометрия/UV.

## Группы ресурсов

50d12e1 заменяет banner fallback planks на собственный sheet; source definition — provenance, не ownership досок. Основа включает готовый banner_illager;42 patterns и отдельные special sources не терять, pattern_illager не тот же ресурс. Заголовок name left/count+arrow right. d5a6145 восстановил snap(k) с cv[k], не cv[slot].

833e3f9: bubble up_top4/down_top4/outer8/inner2. bc0f118: pot Основа(base+brick side)/23 patterns; dried ghast stages0–3 по7 bindings. Файл нескольких стадий в shared_stages ровно раз; это не пятая стадия. Declared icons отдельно, остаток other. Строгий запрет нескольких групп на файл сохранён. Не filenames/директории/ручной список кнопок.

Активная группа раскрывается автоматически. Toggle не выбирает PNG и не rebuild model. Кнопки создаются сразу: это не lazy loading и не доказанное ускорение. Обычные объекты без групп сохраняют flat list.

## Сведения над просмотром

43dcfd2/f245aa6/a804a64/6726278: active file usage, borrowed resources и notes перед stage. Не compiledInfo.shared по всем файлам. Owners из catalog.resources, consumers из record.dependencies; объединять по visible card, сохранять source/form/state/relation/roles. Borrowed не отдельные editable files карточки, ownership не передаётся. Старые lists файлов/shared из справки удалены, остальные инструкции/forms/status/errors остаются.

resourceInfo обычный block перед stage, скрыт пустой, очищается reset/cancel/error; группы PNG ниже. DOM через textContent, toggle read-only. 8b8da8a использует рассчитанный active usage для icon note, 3f2cf4f одним проходом dependencies обрабатывает active+borrowed paths. Не постоянный cache, отсутствие измерений не benchmark.

## Знамёна и controls

BANNER_COLORS/ordered patterns/canvas composition — preview, не16 отдельных цветных PNG; новой палитры нет. 57a7e30/f50a901/eec565b:0–16 слоёв,42 declared patterns,16 существующих цветов; move переносит pattern+color, remove удаляет слой из preview. Поле действия сбрасывается для повторной команды. Ominous готовый sheet без обычных recolor/layers, настройки сохраняются для возврата. Edited PNG не выбирает form/color/layers. Миниатюры ещё не реализованы.

Cauldron7d37e29/0195317: обычный empty/water/colored_water, лавовый empty/lava; сброс только несовместимого content при смене form. Подписи water_still_grey/cauldron_water, оба исходных ресурса сохраняются. PNG не content; игровая система красителей не заявлена.

Observer indexed cube/off-on/default off. Hanging mounting ceiling/attached/wall через sign-preview, default ceiling; обычные family forms без duplicate mounting, sprite без model controls. Bulb/frosted_ice/anchor/crafter/structure/leaf/crop typed validation и EN/RU сохранять. PNG/form/slot/state/pose независимы.

## Bubble, иконки и material maps

337f753: bubble_column/model=sprite paths=18 declared bindings плюс declared icons/carried; pumpkin_side fallback исключён из рабочих faces/variants/paths. source.kind=engine-effect/template=bubble_column/definition сохраняет исходник. Raw normalize без model=sprite/чужие IDs не переписываются.

Bubble_column/end_portal/end_gateway — общий sprite/WebGL, квадратные cards, не no-preview/empty builder/новый renderer/particles. Source-effect note уже есть для declared effect sprite, не всех плоских ресурсов.

assembleChunks items optional отдельно от terrain, counts/hash/duplicate checks; старый manifest не получает пустой atlas. Генератор pinned item_texture через blockIconLinks, repeats сохраняются, bed light_gray→silver. Declared icons без explicit view→sprite; explicit view не переопределять, принадлежность slot family проверяется. Item note уже есть; carried бамбука сначала сверить по роли, не угадывать. Icons filter пока будущий адресный вход в тот же каталог.

8485bb4: polished_cinnabar_mers по явному pinned texture_set в editable paths существующей карточки, не suffix inference/albedo/PBR. Diagnostics44a5f84 в существующем candidate workflow. Decode/draw/history/save/reopen/export через прежний canvas/PNG path не переписаны. Пользовательское «работает» не RGBA/subsurface alpha доказательство. Не объявлять ни порчу, ни полную безопасность без проверки.

## Lifecycle, кадры и отображение

291b5d9: family frame canvases/history reuse, PNG encoding по изменению, pack change сбрасывает frames; модель не очищать до await. Async invalidation/discard/setPack/rollback Add сохранять. 0f27ede: GPU reuse при том же размере, resize освобождает прежнюю, unchanged bindings/alpha без material.needsUpdate; CPU comparison осталось, не второй cache manager.

В fk-core пока только ручные fPrev/fNext/setFrame, история каждого кадра отдельно, packCur собирает полный вертикальный PNG. Следующий Play/Pause: один кадр/секунда сверху вниз и цикл к первому, без JSON timing/order. НЕ записан; ошибку тестовой обвязки не считать успешной проверкой. Остановка при смене объекта/slot, рисовании, выходе/скрытии и pack reset; проверить реальные hooks/async. Не постоянный render loop.

createModelMaterials: classified isTexture+boolean semi; Basic-unlit sprite/glow/emissive, Lambert прочие, lit/unlit conflicts отклонять. Semi transparent/alphaTest0/depthWrite false, иначе false/.05/true. FrontSide/depthTest, planar DoubleSide по контракту. Materials владеют material, GPU layer textures, canvas borrowed. Cleanup/AggregateError/cache/retry/limits сохранить.

41bf23b: stage.group.rotation использует ANGLE_Y+Math.PI для skull/copper_golem_statue/dried_ghast/chest/banner/big_dripleaf/tripwire_hook/sign при reset или выходе из flat. Не изменение geometry до bounds/UV swap. Flat без вращения, ручной ракурс при обычной повторной сборке сохраняется. Полки/подсолнух не компенсировать повторно, scale пока не менять. Whole-sheet alpha/inflate/UV — гипотезы исчезающих поверхностей, не global opaque/DoubleSide/alpha255.

## Сохраняемые модельные контракты

- Head sheets bindings.sheet/full sheets без copies/crops; player head+hat inflate0.5px/full Steve/routes, body/skin/armor позже. Skeleton/wither/creeper/zombie/piglin/dragon и statue oxidation/4 poses; dragon256x256/static jaw/mirror UV, statue eyes/flower автоматически не добавлять.
- Bed source→16 records/owned sheets, bed→red_bed, light_gray→silver,9 частей. Chest11 IDs/sheet-double_sheet/open/double, ender без double; shulker17/base-lid/open. Whole-block facing не возвращать.
- Signs13 пород, реальные standing_sign/darkoak IDs, hanging отдельный sheet. acacia750f657: standing/attached rotation, ceiling/wall facing; старое подозрение ceiling rotation снято.
- Eyeblossom closed/open одна card с glow; pumpkin/melon отдельные с composite stem; budding amethyst один нарост stage/face; kelp A–D не стадии роста.
- Liquids4 ID/integer level0..7/default0/height(8-level)/9, lava emissive; flow/slopes/tint не заявлены. Pot23 patterns+brick/4 faces. Conduit6 ресурсов/static active/eye-wind; inactive vertical UVbf90910, пользователь подтвердил. Bell5 частей/стойки/sheet без звона/прочих креплений.
- Fire4 внутренних+4 perimeter planes/full UV/primary-alternate независимо от PNG/unlit roles; campfire28 log faces, lit+2 flame planes/emissive up. Static не playback/smoke.
- Leaf14/cutout-opaque/carried/variants, biome tint не принят. Indexed buttons/plates/stairs/grass_path down/dirt-coarse_dirt/mycelium up-down-side/snow-side/repeats сохранять. normal_stone_stairs не stone_stairs; принятую геометрию без дефекта не переписывать.

## Приёмка и отложенное

Текущий docs-проход — целевое чтение OLDCHAT32, семи документов, истории, editor-selection/resource-usage/banner-controls/cauldron-controls/fk-core и полных diff a804a64/41bf23b. Не все diff/код и не запуск Node/CI/приложения/WebGL. Пользовательское «все ок вроде» — ограниченная проверка тогдашнего UI; conduit/MERS не полный RGBA/export. Каталог до D, чтение builders не приёмка. Real PNG/TGA/WebGL/Android/draw-history/Add/reopen/export остаются.

Runtime/cache versions и архивирование отложены; docs-only не устанавливает1.0.0. Бэкап/паки/localStorage не очищать. После блоков перед дальнейшим items планируется аудит безопасности; code-map пока не создана. Full mobs/skin/body/armor/tablet-desktop layout отдельно.
