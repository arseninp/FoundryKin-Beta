# ARCHITECTURE — 2026-11-13

Кодовая база перед docs-only пакетом:84f33e5a73426a5567bcc359dac1e4b73e701a0d/main. app/index0.9.13, preview0.9.9. Текущие статусы — CONTEXT/TODO. Подробные прежние модельные контракты в ARCHITECTURE.md на30b51e2be09edb90082687af99d98b7bca470cc8 остаются обязательными, кроме явно обновлённых ниже пунктов; получать точечно, не читать все старые чаты.

## Путь и инварианты

app.html → fk-editor/fk-app → iframe index.html → compiled editor. Legacy dispatch/FKShapes.build не рабочий путь; физическая чистка exports/scripts не завершена, FKCatalog.loadAny нужен PNG/TGA.

PIN46ba6ea985fb5a92d79a9419198f10dda14c199d → load/assemble → normalize/resources/icons/aliases/states/families → compile/access/resolver → registry/materials/textures → scene. Hash/count/conflict/path validators не ослаблять. Unknown не cube, неоднозначность не первая PNG; loose JSON сохраняет quoted ,}/,].

Records/source-ID/card/form/state/slot/reopen различать. Signature учитывает model/states/faces/indexed sequences+repeats/carried/icons/bindings/textureSets. Alias только при полной editor equivalence, family явно; частичная общая PNG не merge. Double slabs отличаются→form, equivalent→alias, smooth stone side сохранить. Owned/borrowed/indexed paths не смешивать, ownership не передавать. PNG/form/slot/state/pose независимы.

## Модули и lifecycle

catalog/editor-selection: family paths/groups/selection/reopen/search/imageMeta/mkFile/frame prep; editor-resource-usage: read-only active/borrowed owners/dependencies. fk-core: async tokens/pack/history/cv/fr/fi/resourceInfo. prepared-preview: resolved material request/instances/update/dispose; banner-preview: composition. models/materials/textures: owned materials/GPU textures, borrowed canvases; fk-view: один renderer/scenes/capture и общий начальный ракурс. Один picker/menu/runtime.

Frame/history/PNG encoding и GPU reuse по размеру сохранять, resize освобождает прежнее; не очищать модель до await. Async invalidation/discard/Add rollback/retry/limits/cleanup сохранять. Play/Pause уже записан: физические кадры PNG сверху вниз раз в секунду, не JSON timing/order; остановки drawing/manual/undo/loading/slot/hidden/exit/reset, export полный вертикальный PNG. Не постоянный render loop.

## Общая политика материалов

По умолчанию boolean semi: true→transparent=true/alphaTest0/depthWrite=false; false→false/.05/true. Basic sprite/emissive, Lambert прочие; lit/unlit conflict отклонять, FrontSide/depthTest, planar DoubleSide по контракту.

1ff3c7f добавил own boolean descriptor.depthWrite и узкое исключение пиглина; телефон подтвердил прекращение пропадания. Это исторический шаг. 5ca11ee ЗАМЕНИЛ ID-исключение общей политикой: registry задаёт depthWrite=true для volume-классов skull/copper_golem_statue/bed/chest/shulker_box/door/sign/banner. Явный boolean entry.depthWrite имеет приоритет, включая false; дескриптор валидируется и фиксируется реестром.

prepared-preview собирает bindings с ключами part_N_role, emissiveRoles и depthWriteRoles из дескриптора каждой части. Sprite-view не наследует volume depth override. materials валидирует global/role boolean policies; role override приоритетнее global, затем default !semi. Выбранная политика фиксируется в requests и сохраняется при update, даже если исходный дескриптор меняют снаружи.

Материалы индексируются по texture path: совместимые роли используют один материал. Один path с разными depth-write или lit/unlit policies отклоняется ДО выделения материалов. Это не реализация двух материалов на одну PNG и не молчаливое объединение. Текстуры заимствуются, dispose материалов не должен освобождать их. Стекло/cube, liquids/fire/slime/honey и sprite не получают новую общую политику автоматически. Не менять alphaTest/UV/PNG или все материалы ради этого правила.

## Геометрия и очистка

11b13e7 обнулил прежнее HEAD_INFLATE=-0.02 пиглина; a259f76 затем удалил сам параметр/константу/нулевые аргументы/арифметику. Голова/пятачок/клыки имеют прямые размеры size/16, центры/UV/уши сохранены. В copper-golem-statue удалены шесть -0.01 и поле inflate; цепочки поворотов разобраны по новому формату без смены их смысла. Не обнулять намеренные другие слои, особенно player hat inflate0.5.

03c0bc4: moss side на границе -0.5 вместо -7.9/16; bd126aa: decal -0.5 вместо -0.49; 41df4a3: две campfire flame planes шириной sqrt(2) вместо .9*sqrt(2). Это записанные изменения, не доказательство устранения швов. Возможное совпадение поверхностей мха проверять отдельно.

Азалия2deb138 использует composeShape: верх/четыре стороны/два стебля, полные sqrt(2)×1. Это упрощённая Java-раскладка, вид принят владельцем, не точная Java-копия и не проверенная Bedrock-геометрия. Старые15.8/15.9 совпадали с Java-шаблоном, поэтому не называть все дроби случайными поправками. Potted azalea остаётся по source-derived ELEMENTS; диапазон15.9..16 не удалён. Общий построитель не должен скрыто уменьшать/раздувать/округлять все модели. Швы и полный аудит остатка открыты.

Начальный ракурс41bf23b — ANGLE_Y+PI внешней stage.group для восьми model keys при reset/выходе из flat, не геометрия до bounds/UV swap. Sprite flat, ручной ракурс сохранять; shelves/sunflower не компенсировать повторно.

## PNG viewport

fk-png-viewport.js загружается после fk-core и до fk-tools, перехватывает input до рисования. Существующий canvas#ed помещается в fkPngPanel → fkPngClip → fkPngSurface; его пиксели/разрешение/история не копируются и не масштабируются как данные. Сетка в той же движущейся области. CSS: контейнер tone2, кнопки tone3, весь panel получает красную рамку в free-mode.

Свободная позиция блокирует pointerdown/move кисти, включает drag/pinch/wheel и клавиатуру; повторное нажатие фиксирует вид. Zoom ограничен .25..256 относительно fit; bound оставляет доступный участок. Начальная позиция возвращает fit, не меняет free-mode/пиксели/Undo. При смене cur() или размеров canvas сбрасываются вид и free-mode; resize окна сохраняет относительный центр. Busy/не-edit/hidden отменяют жесты, blur/потеря capture освобождают pointer state. Отдельного render loop/редактора нет. Точность рисования на всех масштабах не объявлена исчерпывающе принятой.

## Палитра

fk-tools владеет инструментами/цветом/палитрой через FKAPI.ctx и общий FKM. Сохранённые цвета — до20 RGBA hex8 в fk_hist; одинаковый RGB с другой alpha — другой образец. Удержание цвета удаляет его, удержание значка открывает Очистить палитру, короткое нажатие — picker. После hold не должен срабатывать обычный click. Очистка сначала сохраняет next в storage, затем меняет queue/UI; ошибка сохраняет прежний список. Кисть/alpha/PNG/Undo/паки не очищаются.

С0.9.11 выбранный образец выделен --acc border+outer shadow без галочки; active-filter отключён. only light не устранил Samsung-затемнение. f847a5d: palettePixels → ImageData/putImageData рисует swatches32×32, current preview44×44 и hue/alpha tracks240×16. Шахматка и alpha композиция выполняются внутри отображаемого canvas, выход display-image opaque; исходный RGBA остаётся неизменным. Hue/alpha input остаются controls над canvas с прозрачной track. SV-поле уже было canvas. Это display-only решение: HEX/RGBA/пипетка/кисть не компенсируются и PNG/3D не переписываются. Владелец подтвердил успех в Samsung Internet 2026-11-13.

## Ресурсные и модельные контракты

- Banner standing/wall family, hanging signs отдельно; signs по wood/placement. Cave vines whole/body/head/berries не зависят от PNG. Cauldron native/lava family: сброс только несовместимого content, исходные IDs/ресурсы сохраняются.
- Groups только declared roles; active group раскрыта, toggle не PNG selection/rebuild. Banner base/42 patterns/special (illager и pattern_illager различать); bubble4/4/8/2; pot23+brick; ghast4 стадии0–3/shared_stages не пятая. Icons/other отдельно, duplicate membership запрещён.
- Bubble sprite исключает pumpkin_side из рабочих faces/variants/paths, source.definition хранит provenance; raw/чужие IDs не переписывать. Не simulation/no-preview/empty builder.
- e7c6ebe: семь skull records используют настоящий bindings.sheet и объявленные item icons; terrain fallback/старые faces/variants/carried не рабочие ресурсы головы. Исходное описание в source.definition; soul sand остаётся самостоятельным блоком.
- Resource info над stage, пустой/reset/error скрывается, textContent; owned/dependencies не переносить. Usage reuse/общий обход не постоянный cache/benchmark, старые file/shared lists справки не возвращать.
- Banner0–16 layers/42 patterns/16 цветов, move вместе с цветом/remove preview; ominous sheet сохраняет обычные настройки. Lazy thumbnails уже есть, общий picker/максимум2 загрузки. • icon только mixed declared roles, не любой carried.
- Items optional отдельно от terrain, строгие hashes/counts/repeats; старый manifest не получает пустой atlas. Исторические counts3e698c4:blocks1275/terrain1241/existing8201/items75, не свежие cards/builders. light_gray→silver.
- MERS explicit texture_set без PBR/суффиксных догадок; RGBA/subsurface alpha round trip не подтверждён. Conduit inactive UV исправлен,6 ресурсов/static active-eye-wind.
- Full sheets/bindings.sheet без copies/crops; player Steve/head+hat/routes; dragon256×256/static jaw/mirror; statue oxidation/4 poses. Bed16 records/9 частей/bed→red_bed, нижний шов открыт. Chest11 IDs/sheet-double_sheet/open/double, ender без double; shulker17/base-lid/open; whole-block facing не возвращать.
- Signs13 пород/реальные darkoak IDs/hanging mounting; eyeblossom closed-open/glow; pumpkin-melon composite stem; budding amethyst один нарост; kelp A–D не growth stages.
- Liquids4 ID/level0..7/height(8-level)/9/lava emissive, flow/tint не заявлены; bell5 частей; fire4 inner+4 perimeter/full UV/unlit; campfire28 log faces+2 flames; leaf14/cutout-opaque. Indexed buttons/plates/stairs/path/snow/mycelium/repeats и named dependencies pot/soil/piston/torch/pitcher/chorus/amethyst сохранять.

## Диагностика, версии и ограничения

mkFile77bd1fb: data URL/signature/IHDR без fallback16×16, предел16384/16777216, не decode/CRC. rejected94a1185 изолирует сохранённые ресурсы и запрещает молчаливую vanilla substitution. acacia_shelf первопричина неизвестна.

84b04ac/7520b15/6391cde/b72d421: FKLog bounded memory/очистка полей → существующий s-diag, до400 events; отчёт40 rejected/60 events каждого документа/100000 символов+отметка. Без PNG/pack content/auto-send/storage writes; не универсальный DLP. Детали прежних checks сохранены в Git CONTEXT на30b51e2.

app/index0.9.13, preview0.9.9; карты импортов имеют разный охват, не весь граф. В index добавлены load/access/preview/library и изменённые model modules; это не доказательство сетевой первопричины/деплоя. p#fkBuild уже удалён, существующая верхняя версия остаётся. #30312b только будущий фон, не применён.84f33e5 меняет также размеры поисковой SVG22×22.

До/после/улучшение сохранения/единое оформление/3D-рисование не реализованы. Report10db8cd — программный WebGL, не Android. Чат35 сообщает14 depth+registry на ddeef9e и отдельные9/6/10 локальных проверок других пакетов; не полный HEAD CI и не новый запуск этого сеанса. Безопасность/производительность/сквозная приёмка/legacy cleanup остаются. Backup/паки/storage/PIN/scale не очищать и не менять.
