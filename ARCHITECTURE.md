# ARCHITECTURE

Кодовая точка 07caecd, 2026-10-29. Рефактор в main ещё не подключён к рабочим страницам.

## Два пути

Рабочий: app.html → fk-editor/fk-app → iframe index.html → старые fk-модули. Новый: data → normalization → aliases/states/families/icons → compile → access → preview bindings → registry → renderer. HTML пока использует только первый.

Legacy обёртки/sp-списки могут терять варианты/carried. Старое ядро игнорирует saved ID, местами меняет модель через PNG-слот, имеет риски async replacement/storage и общего изменения разрешения. Наличие нового модуля не исправляет автоматически старый runtime.

## Контракты

- load.mjs: JSONC/assembleChunks, terrain в texture_data; hashes проверяет вызывающий загрузчик.
- resources.mjs: unique paths/faces/carried отдельно от variants/carriedVariants с повторами/индексами. Семь shared door atlases выбирают свои половины.
- items.mjs/rules/icons.mjs: item atlas и явные icon links; полный аудит не закрыт.
- identity.mjs/rules/duplicates.mjs: aliases с проверкой эквивалентности, а не по одному общему PNG.
- compile.mjs: records/cards/aliases/families/stateGroups/routes/reverse resource index. Полная совместимость с family plan ещё требует прогона.
- states.mjs: семь power groups плюс pumpkin/anvil/amethyst; неполную группу не сливать вслепую.
- access.mjs: saved ID/alias → source/card/form/state; неоднозначный PNG не выбирает первого владельца.
- preview.mjs: editing slot отдельно от model state; role → пути, явный выбор альтернатив, проверка принадлежности ресурсов. Есть bindings door/pumpkin/candle/azalea/strands.
- model-policy.mjs: явные материалы/формы/специальные назначения и overrides; unresolved вместо default cube.
- models/library.mjs: compileModelCatalog допускает plain/wrapped terrain/item atlas и блокирует неполное покрытие. tools/model-coverage.mjs переиспользует общую проверку и учитывает overrides; прежнее дублирование уже исправлено.

## Реестр и незавершённые модели

30 типов: primitives cube/slab/stairs/wall/fence/gate/button/plate/cake/trapdoor/carpet/anvil/beacon/pumpkin; strands pale_hanging_moss/sulfur_spike; lights lantern/chain/torch/campfire; planar cross/sprite/rail/decal; fixtures pane/candle/brewing; door; amethyst; azalea.

Door — закрытые две половины без merged canvas. Amethyst — один cross, growth выбирает исходный ID. Unpotted azalea — top/side/plant из up/north/east; potted down/south/west сохранены в редактируемых ресурсах.

Potted azalea — незарегистрированный Java-reference candidate (template_potted_azalea_bush, blob d3ce7c09fc34fe2212a741ebf3a2a5e3a720e405). Нужны Bedrock PNG/UV review, зависимости pot/soil и выбор формы. Нельзя подставлять чужие пути в обход ownership validation.

## Данные и расширение

PIN Mojang 46ba6ea985fb5a92d79a9419198f10dda14c199d. Candidate: 1275 блоков, 1241 terrain key, 8201 resource path, auxiliary end_gateway/lava_cauldron. Raw blocks имеет 1352 definitions; часть legacy/internal отфильтрована намеренно.

Named bindings и объявленная model — заготовка для расширения. Item по умолчанию sprite; 3D только по объявлению. Entity source/geometry/material/render-controller adapter НЕ реализован. Исходные размеры PNG, альфа, атласы и frame sequences должны сохраняться.

## Проверки и хранение

Targeted тесты используют заглушки Three/геометрии. Полный validate/compileModelCatalog, зелёный CI, настоящий WebGL/Android и экспорт текущей точки не подтверждены. Проверки: node tools/validate.mjs и node --test tools/*.test.mjs. Пути в данных не равны проверке PNG-пикселей.

Legacy cache foundrykin.catalog.v6; user packs fk070_packs. Backup кода не содержит паков. Не очищать storage ради кэша. Transactions, import limits, async target, non-square atlases, cache limits и URL lifecycle требуют регрессий.
