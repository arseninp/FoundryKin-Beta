# ARCHITECTURE

Передача 2026-10-30, проверенный HEAD 2a109dc3c527d2cd7ad0d6221212ce47af15c0f9. library.mjs прочитан непосредственно; остальные изменения ниже восстановлены из OLDCHAT11 и требуют проверки соответствующих исходников перед кодовыми правками.

## Два пути

Legacy: app.html → fk-editor/fk-app → iframe index.html → fk-модули. Новый: data → normalization → aliases/states/families/icons → compile → access → preview bindings → registry → renderer. По истории новый путь пока не подключён к HTML; версия живых страниц 0.9.1. Новая проверяемая страница и полноценный редактор ещё не реализованы.

## Контракты

- load.mjs: JSONC/assembleChunks; hashes проверяет вызывающий загрузчик.
- resources.mjs: уникальные paths/faces/carried отдельно от variants/carriedVariants с повторами и индексами. Shared door atlases выбирают свои половины. normalizeBlock вызывает rules/parts.mjs для именованных частей.
- rules/models.mjs: явные специальные назначения и ограниченные шаблоны; model-policy подключает их. Unknown остаётся unresolved, не default cube.
- rules/parts.mjs и pitcher-parts.mjs: named bindings flower/stem, sunflower front/back, индексированные грани sniffer_egg, части pitcher и варианты lightning_rod.
- rules/dependencies.mjs: declaredDependencies/attachDependencies объявляют общие роли, проверяют формат, единственность пути и наличие в inventory. Azalea pot/soil, устройства torch_on/off, pitcher pod. Собственные paths не расширяются неявно; общий ресурс не становится собственным редактируемым слотом.
- compile.mjs: records/cards/aliases/families/stateGroups/routes/reverse resource index и присоединение dependencies. Зависимости не являются полным entity source adapter или готовым окном Shared textures.
- identity/rules/duplicates: эквивалентность ресурсов, модели и состояний перед объединением waxed/infested; old-ID routes сохраняются. Степени окисления не удаляются.
- states.mjs: power groups, pumpkin/anvil/amethyst и вариант pitcher_crop/plant. Группа требует одинаковый model; для bamboo_sapling/adult с разными моделями нужен механизм форм, пока не подключённый.
- access.mjs: saved ID/alias → source/card/form/state; неоднозначный PNG не выбирает первого владельца.
- preview.mjs: slot независим от state; проверяет owned пути или dependency именно объявленной роли, возвращает shared для загрузчика. Azalea potted выбирает potted_azalea и down/south/west. Посевы/turtle_egg используют variants.up, не уникальные faces. Не все состояния валидируются на одном уровне: часть проверяется построителем. Общая панель UI отсутствует.
- models/library.mjs: запечатанная библиотека фабрик вплоть до workshop. Ожидаемое тестами количество по архиву — 69, не результат выполнения в этой передаче. compileModelCatalog остаётся строгим: unresolved/missing builders блокируют компиляцию до normalize. Режим ограниченного среза не реализован. Plain/wrapped terrain/item atlas поддерживаются.

## Геометрия

models/shapes.mjs даёт composeShape/requireRoles и общие операции плоскостей, боксов и повёрнутых/наклонных групп. Перенос сохраняет принятую legacy geometry/UV, кроме явно оговорённых отличий. Реализации сгруппированы по ответственности: bamboo, moss, redstone, fittings, plants, specials, growth, mechanisms, flowerbeds, pitcher, wires, tracks, metals, workshop и прежние primitives/strands/lights/planar/fixtures/doors/amethyst/azalea.

Closed door остаётся без открывания. Один amethyst выбирает growth. Potted azalea зарегистрирована, но её Java-reference geometry требует Bedrock PNG/UV review. Repeater/comparator перенесены из принятого fk-curation.js, не заново из Java. Включённый redstone torch сохраняет дополнительные sprite planes. Track — плоский рисунок, без наклонов/соединений путей. Workshop показывает downward hopper, floor grindstone и две рамки. Регистрация не означает полноту игровых состояний.

## Данные и расширение

PIN Mojang 46ba6ea985fb5a92d79a9419198f10dda14c199d. Исторические параметры candidate: 1275 определений, 1241 terrain key, 8201 resource path, auxiliary end_gateway/lava_cauldron; raw blocks 1352. Это не новый замер. Старый stonecutter по поправке архива уже исключён; не возвращать его как unresolved задачу без проверки candidate.

Item по умолчанию sprite, 3D только по явному объявлению. Entity source/geometry/material/render-controller adapter не реализован. Табличкам, кроватям и другим объектам с отдельными атласами нужен проверяемый источник, inventory и ownership, а не только строка dependencies. Сохранять размеры PNG, alpha, atlases и frame sequences.

## Проверки и сохранность

История содержит targeted mock/syntax/real-input проверки, но полный validate/tests/compile, CI, WebGL/Android и export не подтверждены. В этой передаче код не запускался. Команды для среды исполнения: node tools/validate.mjs и node --test tools/*.test.mjs; запуск не перекладывать на владельца.

Legacy cache foundrykin.catalog.v6; packs fk070_packs. Риски: saved ID, async target binding, storage transactions/import limits, non-square atlases, глобальное изменение разрешения, cache limits и URL lifecycle. Не очищать storage. Перед удалением legacy проверить draw/undo/redo/Add/reopen/PNG/mcpack.
