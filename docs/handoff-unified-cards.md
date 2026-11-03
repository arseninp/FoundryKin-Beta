# Передача: совмещённые карточки голов, статуй и глазоцвета

Обновлено 2026-11-03 по OLDCHAT19 и уточнению владельца. Проверенный HEAD до записи: 40c82f0e6e3be884f73d0ee61bf8a8a385e5164d, main. Читать после CONTEXT. Не выпуск/визуальная приёмка. Предыдущая передача целиком сохранена в aae3661cbffb20f482d60973e7e008a0c26771e2.

## Ранее записано — не повторять

- bd83fbd: copper-golem-sources/compile/assignment используют существующие entity sheets четырёх окислений. Source/waxed IDs/resources сохранены; geometry standing/sitting/running/star уже была в d7fb217. Глаза/цветок не добавлялись.
- 74f40c8/199ddc6: skull builder и skeleton_skull/wither_skeleton_skull с textures/entity/skeleton/skeleton и textures/entity/skeleton/wither_skeleton. Куб 8x8x8; UV Y для 64x32 через square painter 64. Не projectile wither_skull. Внутренний rotation 0..15 не UI опция.
- 67cf7ed/c9eca2d: creeper_head/zombie_head через skull, общие textures/entity/creeper/creeper и textures/entity/zombie/zombie. Без тел/charged/baby/hidden hat. Прежние 503 не отменяют найденные записи.
- 4ad9cd2/62146c2: piglin-head geometry/source textures/entity/piglin/piglin. Взрослая голова шириной 10, пятачок/клыки/уши с pivots по pinned piglin.geo.json, лист 64x64. Head inflate -.02, ears 0 по прежней передаче; реальный render не принят.

Registry expectation 110 из прежних тестов — не свежий coverage/число принятых cards. Настенное крепление ранее отклонялось, не принято. Player_head и полные entities не входят в текущий перенос.

## Изменения OLDCHAT19

- f2479ea: одна карточка глазоцвета, bloom closed/open, default closed; явные models cross/emissive_cross. Обе records/paths/routes/glow сохранены; строгий запрет случайного смешения моделей других групп остаётся. Старые раздельные карточки/auth_required устарели.
- 2623353: controls из stateGroups, убраны дубли списков вариантов тыквы/роста аметиста.
- 2d222fc/b8cbd84/4b4d417/356de40: переработан существующий FKModelState, единые FKM/стили извлечены в fk-menu.js/fk-menu.css с удалением прежних реализаций; themed picker подключён в preview. Не второй picker и не загрузка drawing tools.
- 7cb4a83: forms/compile/access поддерживают материнские cards, настоящие source records/familyDefaults без фиктивных entities.
- df72fa6: form отдельно от slot/state, plan.forms; fruit/stem потребитель согласован, composite fruit не дублирует form selector.
- 8e64e04/ad3de20: четыре стадии статуи/четыре позы и skeleton/wither_skeleton/creeper/zombie/piglin head/skull forms подключены к материнским cards. Source ID открывает правильное представление; rotation controls нет.
- d715eca: общий пункт Текстура; form/slot/state независимы; выбранная PNG загружается и вне model bindings; default model sheet для голов/статуй, явный PNG/sprite сохраняют правила.
- c71716b/b9fe64e/40c82f0: только head/jaw дракона и dragon_head → ender_dragon. textures/entity/dragon/dragon, общий 256x256 sheet, mirror UV, 6 head cubes + 1 jaw cube, static closed jaw, dispatch через skull. Без нового builder ID/PNG головы/полного тела. Bedrock placement/scale/UV не приняты.

Срез — 27 source block IDs: прежние 17 + четыре невощёные стадии статуи + пять голов/черепов + dragon_head. Не 27 cards, не весь каталог, не приёмка всех waxed маршрутов. Кодовое подключение согласованных голов к отдельному preview записано; основной редактор не переключён.

## Обязательные границы

Одна материнская card, только доступные формы. Source records/IDs/resources/reopen не терять. Общая PNG не duplicate alias. Форма меняет geometry/UV, не копирует/обрезает sheet; разные реальные файлы сохранять. PNG/form/state/pose независимы.

Полные мобы/их скелет/развёртки отложены и НЕ недоделка текущего этапа. Моб не показывается готовым без модели. Будущий перенос переиспользует подходящую основу без второй копии. Статуе автоматически не добавлять глаза/цветок, окисления не сливать.

Вращение жестом, без rotation/facing меню голов/статуй. Позы статичны, не плеер. Подписи EN/RU, IDs не переводить, paper/design tokens сохранять. Перерабатывать существующие обязанности/потребителей, без второго каталога/специальных панелей/цепочек обёрток.

## Точка продолжения

Владелец уже спросил, адаптирован ли макет для планшета/компьютера. Прочитать фактические editor/iframe/preview layout/CSS/size consumers и ответить по коду. Готовность широкого макета не установлена, новая раскладка/редизайн не согласованы. Не просить заново сформулировать вопрос.

Последнюю реплику ассистента OLDCHAT19 владелец в новом чате прямо исключил из работы. Не превращать её заявления в баги/задачи и не отвлекаться на них вместо макета.

## Доказательства и сохранность

Исторические точечные Node/syntax/mocked DOM/canvas/Three проверки не полная pinned normalize/compile/resolver/UI цепочка. Среды/отчёты не переносятся; перекрывающиеся числа не суммируются. Workflow обновлён, успешный Actions не подтверждён. Реальные PNG/TGA/WebGL/Android/export/Bedrock UV и full compile не приняты.

Сейчас прочитаны OLDCHAT19, семь документов, последние 20 коммитов и preview.mjs; HEAD повторно проверен, тесты/браузер не запускались, весь код/diff не исследовался. Только main, точное подтверждение каждой записи и полный saved diff/контент. После неоднозначного сбоя сначала GitHub. Новые test files отдельно согласовать; backup/fk070_packs не трогать. PIN/остальные контракты — CONTEXT/ARCHITECTURE.
