# ARCHITECTURE — 2026-11-12

База30b51e2be09edb90082687af99d98b7bca470cc8/main, runtime0.9.6. Текущие статусы — CONTEXT/TODO. Подробные прежние модельные контракты в ARCHITECTURE.md на этом Git SHA остаются обязательными, кроме явно обновлённых здесь пунктов; получать точечно, не читать все старые чаты.

## Путь и инварианты

app.html → fk-editor/fk-app → iframe index.html → compiled editor. Legacy dispatch/FKShapes.build не рабочий путь; физическая чистка exports/scripts не завершена, FKCatalog.loadAny нужен PNG/TGA.

PIN46ba6ea985fb5a92d79a9419198f10dda14c199d → load/assemble → normalize/resources/icons/aliases/states/families → compile/access/resolver → registry/materials/textures → scene. Hash/count/conflict/path validators не ослаблять. Unknown не cube, неоднозначность не первая PNG; loose JSON сохраняет quoted ,}/,].

Records/source-ID/card/form/state/slot/reopen различать. Signature учитывает model/states/faces/indexed sequences+repeats/carried/icons/bindings/textureSets. Alias только при полной editor equivalence, family явно; частичная общая PNG не merge. Double slabs отличаются→form, equivalent→alias, smooth stone side сохранить. Owned/borrowed/indexed paths не смешивать, ownership не передавать. PNG/form/slot/state/pose независимы.

## Модули и lifecycle

catalog/editor-selection: family paths/groups/selection/reopen/search/imageMeta/mkFile/frame prep; editor-resource-usage: read-only active/borrowed owners/dependencies. fk-core: async tokens/pack/history/cv/fr/fi/resourceInfo. prepared-preview: resolved material request/instances/update/dispose; banner-preview: composition. models/materials/textures: owned materials/GPU textures, borrowed canvases; fk-view: один renderer/scenes/capture и общий начальный ракурс. Один picker/menu/runtime.

Frame/history/PNG encoding и GPU reuse по размеру сохранять, resize освобождает прежнее; не очищать модель до await. Async invalidation/discard/Add rollback/retry/limits/cleanup сохранять. Play/Pause уже записан: физические кадры PNG сверху вниз раз в секунду, не JSON timing/order; остановки drawing/manual/undo/loading/slot/hidden/exit/reset, export полный вертикальный PNG. Не постоянный render loop.

## Материал и геометрия пиглина

По умолчанию boolean semi: true→transparent=true/alphaTest0/depthWrite=false; false→false/.05/true. Basic sprite/emissive, Lambert прочие; lit/unlit conflict отклонять, FrontSide/depthTest, planar DoubleSide по контракту.

1ff3c7f: необязательный own boolean descriptor.depthWrite, тип проверяется, значение фиксируется и действует при update. prepared-preview задаёт true ТОЛЬКО volume/skull/object.id=piglin_head/parts===undefined. Текстура/UV/прозрачность/alphaTest прежние; glass/прочие головы/bed/sprite/multipart не переключены. Телефон пользователя подтвердил прекращение пропадания, не глобальную политику.

11b13e7: HEAD_INFLATE=0 вместо source -0.02 для головы/пятачка/клыков. Центры/UV/уши прежние. Контакты проверены с mock, пользователь: лучше, не идеально. Не обнулять намеренные другие слои, особенно player hat inflate0.5. Не менять global scale/все дробные размеры.

Начальный ракурс41bf23b — ANGLE_Y+PI внешней stage.group для восьми model keys при reset/выходе из flat, не геометрия до bounds/UV swap. Sprite flat, ручной ракурс сохранять; shelves/sunflower не компенсировать повторно.

## Ресурсные и модельные контракты

- Banner standing/wall family, hanging signs отдельно; signs по wood/placement. Cave vines whole/body/head/berries не зависят от PNG. Cauldron native/lava family: сброс только несовместимого content, исходные IDs/ресурсы сохраняются.
- Groups только declared roles; active group раскрыта, toggle не PNG selection/rebuild. Banner base/42 patterns/special (illager и pattern_illager различать); bubble4/4/8/2; pot23+brick; ghast4 стадии0–3/shared_stages не пятая. Icons/other отдельно, duplicate membership запрещён.
- Bubble sprite исключает pumpkin_side из рабочих faces/variants/paths, source.definition хранит provenance; raw/чужие IDs не переписывать. Не simulation/no-preview/empty builder.
- Resource info над stage, пустой/reset/error скрывается, textContent; owned/dependencies не переносить. Usage reuse/общий обход не постоянный cache/benchmark, старые file/shared lists справки не возвращать.
- Banner0–16 layers/42 patterns/16 цветов, move вместе с цветом/remove preview; ominous sheet сохраняет обычные настройки. Lazy thumbnails уже есть, общий picker/максимум2 загрузки. • icon только mixed declared roles, не любой carried.
- Items optional отдельно от terrain, строгие hashes/counts/repeats; старый manifest не получает пустой atlas. Исторические counts3e698c4:blocks1275/terrain1241/existing8201/items75, не свежие cards/builders. light_gray→silver.
- MERS explicit texture_set без PBR/суффиксных догадок; RGBA/subsurface alpha round trip не подтверждён. Conduit inactive UV исправлен,6 ресурсов/static active-eye-wind.
- Full sheets/bindings.sheet без copies/crops; player Steve/head+hat/routes; dragon256×256/static jaw/mirror; statue oxidation/4 poses. Bed16 records/9 частей/bed→red_bed, нижний шов открыт. Chest11 IDs/sheet-double_sheet/open/double, ender без double; shulker17/base-lid/open; whole-block facing не возвращать.
- Signs13 пород/реальные darkoak IDs/hanging mounting; eyeblossom closed-open/glow; pumpkin-melon composite stem; budding amethyst один нарост; kelp A–D не growth stages.
- Liquids4 ID/level0..7/height(8-level)/9/lava emissive, flow/tint не заявлены; bell5 частей; fire4 inner+4 perimeter/full UV/unlit; campfire28 log faces+2 flames; leaf14/cutout-opaque. Indexed buttons/plates/stairs/path/snow/mycelium/repeats и named dependencies pot/soil/piston/torch/pitcher/chorus/amethyst сохранять.

## Диагностика, версии и ограничения

mkFile77bd1fb: data URL/signature/IHDR без fallback16×16, предел16384/16777216, не decode/CRC. rejected94a1185 изолирует сохранённые ресурсы и запрещает молчаливую vanilla substitution. acacia_shelf первопричина неизвестна.

84b04ac/7520b15/6391cde/b72d421: FKLog bounded memory/очистка полей → существующий s-diag, до400 events; отчёт40 rejected/60 events каждого документа/100000 символов+отметка. Без PNG/pack content/auto-send/storage writes; не универсальный DLP. Детали прежних checks сохранены в Git CONTEXT на базе выше.

0.9.6 app/index/preview/local JS-CSS; import maps только prepared-preview/materials/piglin-head. Не весь граф/не доказательство деплоя. Дубль p#fkBuild убрать отдельно, исходная верхняя версия остаётся. #30312b только будущий фон, не применён.

Report10db8cd — программный WebGL, не Android. Отдельные6 depth и3 geometry tests не полный CI HEAD. Безопасность/производительность/сквозная приёмка/legacy cleanup остаются. Backup/паки/storage не очищать.
