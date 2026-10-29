# ARCHITECTURE — действующий сайт и незавершённый рефактор

На 2026-10-29, проверенная кодовая точка `502d4b4`. Новый код уже в main, но HTML его не загружает.

## Действующий путь

Оболочка app.html → fk-i18n.js → fk-editor.js → fk-app.js, JSZip 3.10.1; редактор открывается в iframe index.html. FK_V и HTML-ссылки — 0.9.1, хотя fk-blocks-b обновлён коммитом 6bd8b58 под сообщением v0.9.2.

Редактор:
```
fk-i18n → Three.js r128 → fk-catalog-data → fk-catalog
→ fk-shapes → fk-sculk → fk-lights → fk-details → fk-fixtures
→ fk-strands → fk-curation → fk-blocks-b → fk-view
→ fk-model-state → fk-core → fk-pixel-grid → fk-tools → fk-grid → fk-help
```

Индексаторы/построители обёрнуты цепочкой. sp[id]={kind,list,fm} переопределяет слоты; extra содержит дополнительные пути, но автоматически не гарантирует доступность в редакторе. Массивы terrain для primary сведены к первому элементу. Строковый carried поддержан неполно, объектный в старом каталоге теряется. Азалия имеет горшечные ресурсы в исходных гранях, но специальный список слотов использует только обычные части.

fk-blocks-b: explicit extended, stage, attached, eye уже записаны для поршней, культур/яйца, крючка и рамки. fk-curation: репитер/компаратор сохраняют auto/off/on; fk-strands всё ещё читает выбранный слот. Не путать старый и новый путь.

FKView: один ленивый renderer, сцены редактора/снимка, рендер по запросу, без idle RAF. Камера ±.95, z=3.9, базовый поворот (.6155,-PI/4,0); Ambient .75 и Directional .55. Текстуры Nearest, alphaTest .05. Find и редактор используют одну геометрию. End portal/gateway — спрайты; Nether portal — вертикальная плоскость; end portal frame — отдельный корпус с глазом.

## Новый путь: реальные контракты

| Модуль | Состояние и назначение |
|---|---|
| catalog/load.mjs | Разбор исходных JSONC и сборка частей; CLI вызывающего кода проверяет SHA |
| catalog/resources.mjs | paths/faces/carried — уникальные пути; variants/carriedVariants — исходные последовательности с повторами; выбор своих половин из общих массивов семи дверей |
| catalog/items.mjs | Общий resourceVariants; индекс предмета сохраняет исходные позиции, PNG-пути дедуплицированы |
| catalog/identity.mjs, rules/duplicates.mjs | Проверяемые aliases waxed/infested и явные правила; подпись учитывает модель, состояния, ресурсы и последовательности вариантов |
| catalog/rules/icons.mjs | Явные связи блок→item, исключения ключей дверей/табличек, цвета bed; это ещё не полный проверенный список |
| catalog/states.mjs | 7 явных power-групп: три печи, лампа, факел, репитер, компаратор. Не общий готовый распознаватель всех состояний |
| catalog/compile.mjs | Нормализация → aliases → state groups → families → cards/resources; сохраняет исходные records и обратный индекс |
| catalog/access.mjs | ID/alias → источник, каноническая карточка, форма, состояние; locate не угадывает первого владельца общего PNG |
| catalog/preview.mjs | Выбранный PNG отдельно от состояния; явный выбор при множестве путей грани; именованные bindings для мха/серного острия; вызывает registry.build |
| catalog/model-policy.mjs | Консервативные правила по ID/суффиксам и overrides; unresolved вместо default cube; специальные исключения приоритетнее общих правил |
| models/registry.mjs | Уникальные строковые ключи, атомарная регистрация, seal, validate |
| models/library.mjs | Регистрация библиотек, inspectModelCoverage, bindCatalogModels; compileModelCatalog связывает policy с компилятором и блокирует неполное покрытие |

Новый preview ещё не универсальный presentation pipeline: модельно-специфические bindings сейчас есть лишь для двух сегментированных моделей. Наличие всех PNG в paths не гарантирует правильную роль/грань, порядок стадий или показ на модели. Правила ориентации печей, формы горшков, рост бамбука и стадии аметиста ещё требуют завершения.

21 построитель:
- primitives: cube, slab, stairs, wall, fence, gate, button, plate, cake, trapdoor, carpet;
- strands: pale_hanging_moss, sulfur_spike;
- lights: lantern, chain, torch, campfire;
- planar: cross, sprite, rail, decal.

В новых моделях campfire читает state.lit (boolean), sulfur_spike — direction=down/up и merged=boolean. Power-группы каталога используют powered=off/on (строки). Единой законченной схемы UI для этих разных параметров ещё нет. Sprite — явный режим/роль, не префикс папки; текущий preview для item пока допускает только sprite, не произвольную 3D-геометрию предмета.

## Данные и генераторы

Источник закреплён на Mojang 46ba6ea985fb5a92d79a9419198f10dda14c199d. data/catalog-candidate содержит 1275 blocks, 1241 terrain, 8201 existing; auxiliary содержит end_gateway/lava_cauldron. data/catalog-families — прежний план семейств. Новая заранее скомпилированная база для браузера ещё не опубликована.

prepare-catalog-inputs теперь учитывает каждый ID реестра: admitted/excluded/missing-definition/no-textures/invalid-definition/invalid-textures. Это исправляет отчёт, не восстанавливает автоматически ресурсы записей без textures. Старые generated JSON после изменения генератора не пересобирались.

## Проверки и их пределы

```
node tools/validate.mjs
node --test tools/*.test.mjs
node tools/catalog-audit.mjs --chunks data/catalog-candidate
node tools/model-coverage.mjs --chunks data/catalog-candidate
```

Команды здесь — для ассистента/разработчика, не поручение владельцу. Общий успешный прогон на текущем HEAD не подтверждён.

validate: Node 22 в CI, синтаксис tracked JS/MJS, лимит 25000 UTF-8 байт, все tools/*.test.mjs; триггеры включают CSS и data/**. В workflow осталась строка ветки refactor-0.9, сама ветка удалена; очистить позже без воссоздания ветки. CSS-триггер не означает полноценную CSS/WebGL-проверку.

catalog-real-inputs.test проверяет нормализацию полного набора и ресурсы азалии/бамбука/дверей, но не PNG-инвентарь, назначения, полный компилятор или рендер. Новые геометрические тесты используют заглушки Three.

model-coverage в 502d4b4: inspectCoverage дублирует функцию библиотеки; тесты проверяют малый набор и SHA, но не весь CLI или неверный source commit. Исправить до использования как доказательства полноты.

## Хранение и известные риски

Старый cache key foundrykin.catalog.v6, пользовательские паки fk070_packs. Не удалять паки ради кэша. openTexture старого ядра игнорирует ID; сохранение может менять память до успешной записи; асинхронная замена PNG не закреплена за исходной целью; изображения приводятся к общему разрешению. Транзакции, ограничения импорта, mixed/non-square атласы, лимиты кэшей, toBlob/revokeObjectURL и entity pipeline не завершены.
